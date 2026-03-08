import { prisma } from '../configs/db.js';
import { retrieveSimilarChunks } from './embedding.service.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import config from '../configs/config.js';

const genAI = new GoogleGenerativeAI(config.ai.api_key);

export async function generateChatResponse(
  query: string, 
  websiteId: number,
  chatHistory: Array<{role: string, content: string}> = []
): Promise<{ 
  answer: string; 
  sources: Array<{ url: string; title: string; relevance: number }>; 
  followupQuestions?: string[];
}> {
  const relevantChunks = await retrieveSimilarChunks(query, websiteId, 3);
  
  if (relevantChunks.length === 0) {
    return {
      answer: "Hmm, I'm drawing a blank on that one! 🤔 Could you try asking in a different way? I'm eager to help but might need a hint to point me in the right direction!",
      sources: [],
      followupQuestions: [
        "Would you like me to tell you what topics I know about this website?",
        "Can I help you find something else instead?",
        "Maybe we could start with a more general question?"
      ]
    };
  }
  
  // Calculate normalized relevance scores (0-100)
  const chunks = relevantChunks.map(chunk => ({
    ...chunk,
    relevance: Math.round(chunk.similarity * 100)
  }));

  // Sort chunks by relevance
  chunks.sort((a, b) => b.relevance - a.relevance);
  
  // Filter out low-relevance chunks (optional threshold)
  const highRelevanceChunks = chunks.filter(chunk => chunk.relevance > 60);
  const finalChunks = highRelevanceChunks.length > 0 ? highRelevanceChunks : chunks.slice(0, 3);
  
  // Format context from chunks with metadata
  const context = finalChunks.map((chunk, i) => 
    `[CONTENT ${i+1}] (Source: ${chunk.title || 'Untitled'}, URL: ${chunk.url})
    ${chunk.text}
    `
  ).join("\n\n");
  
  // Extract unique sources with relevance scores
  const uniqueSources = Array.from(
    new Map(finalChunks.map(chunk => 
      [chunk.url, {
        url: chunk.url, 
        title: chunk.title || chunk.url,
        relevance: chunk.relevance
      }]
    )).values()
  );
  
  const systemPrompt = `You are a knowledgeable, friendly assistant answering questions about a specific website's content.

      RESPONSE FORMATTING RULES (strictly follow):
      - Start with a short 1-2 sentence direct answer as a plain paragraph.
      - Use **bold** for key terms or important phrases.
      - Use ### headings only when the response has 3 or more distinct sections.
      - Use bullet lists (- item) for multiple points; keep each bullet to 1 line.
      - Use numbered lists only for sequential steps.
      - Never mix paragraphs and bullets randomly - pick one structure per section.
      - NEVER use HTML tags or centered text. All content must be left-aligned.
      - Keep total response under 200 words unless the question genuinely requires more.
      - No filler openers like "Great question!" or "Certainly!".
      - Never say "based on the provided documents" or "according to the information" - speak naturally.
      - If you don't know, say: "I don't have that information - feel free to ask something else!"
      - Use emojis sparingly (max 1 per response), only where genuinely useful.

      WEBSITE CONTENT:
      ${context}`;

  try {
    // Configure Gemini model
    const model = genAI.getGenerativeModel({
      model: config?.ai?.model ? config.ai.model : "",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.4, // Slightly higher for more personality
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 800,
      },
    });

    // Create chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hi! I'll be asking questions about a website. I want you to be helpful, friendly and conversational and Please follow the instructions carefully." }],
        },
        {
          role: "model",
          parts: [{ text: "I'll help you with questions about the website, following the instructions to base my answers only on the provided documents, cite sources properly, and maintain a helpful tone. What would you like to know?" }],
        },
        ...chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 800,
      },
    });

    // Send the system prompt and user query
    const result = await chat.sendMessage([
      { text: systemPrompt },
      { text: `User question: ${query}` }
    ]);
    
    const response = result.response.text();
    
    // Generate follow-up questions based on context and current query
    const followupResult = await model.generateContent(`
      Based on this user question: "${query}" 
      And this answer: "${response}"
      And these website contents: 
      ${finalChunks.map(c => c.text).join("\n\n").substring(0, 1000)}
      
      Generate 3 natural, conversational follow-up questions the user might want to ask next.
      Make them sound casual and friendly, as if continuing a conversation.
      Return ONLY the questions as a JSON array of strings, nothing else.
      Example: ["Question 1?", "Question 2?", "Question 3?"]
    `);
    
    let followupQuestions: string[] = [];
    try {
      const followupText = followupResult.response.text().trim();
      // Extract JSON array from the response
      const jsonMatch = followupText.match(/\[.*\]/s);
      if (jsonMatch) {
        followupQuestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing follow-up questions:', e);
      followupQuestions = [];
    }
    
    // Log the interaction
    await logChatInteraction(
      websiteId, 
      query, 
      response, 
      uniqueSources,
      finalChunks.map(c => c.id)
    );
    
    return {
      answer: response,
      sources: uniqueSources,
      followupQuestions: followupQuestions.slice(0, 3)
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      answer: "Oops! 😅 I seem to be having a moment. My circuits got a bit tangled. Could we try that again in a second?",
      sources: uniqueSources
    };
  }
}

async function logChatInteraction(
  websiteId: number,
  query: string,
  response: string,
  sources: Array<{ url: string; title: string; relevance: number }>,
  chunkIds: number[],
  sessionId: string = generateSessionId()
): Promise<void> {
  await prisma.chatInteraction.create({
    data: {
      websiteId,
      query,
      response,
      sessionId,
      chunksUsed: chunkIds.join(',')
    }
  });
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Function to maintain chat history for conversational context
export async function getChatHistory(sessionId: string, limit: number = 5): Promise<Array<{role: string, content: string}>> {
  const interactions: any[] = await prisma.chatInteraction.findMany({
    where: {
      sessionId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
  
  // Convert to format expected by Gemini
  const history: Array<{role: string, content: string}> = [];
  
  // Reverse to get chronological order
  interactions.reverse().forEach((interaction: any) => {
    history.push({
      role: "user",
      content: interaction.query
    });
    
    history.push({
      role: "model",
      content: interaction.response
    });
  });
  
  return history;
}

// Enhanced retrieval function with semantic search improvements
export async function enhancedRetrieval(
  query: string, 
  websiteId: number
): Promise<any[]> {
  // Get basic vector search results
  const vectorResults = await retrieveSimilarChunks(query, websiteId, 12);
  
  // Use Gemini to analyze the query for key concepts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const conceptResult = await model.generateContent(`
    Extract 3-5 key concepts or entities from this query: "${query}"
    Return ONLY a JSON array of strings, nothing else.
    Example: ["concept1", "concept2", "concept3"]
  `);
  
  let keyConcepts: string[] = [];
  try {
    const conceptText = conceptResult.response.text().trim();
    // Extract JSON array from the response
    const jsonMatch = conceptText.match(/\[.*\]/s);
    if (jsonMatch) {
      keyConcepts = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing key concepts:', e);
  }
  
  // If we have key concepts, use them to boost relevant results
  if (keyConcepts.length > 0) {
    // Rerank results based on presence of key concepts
    return vectorResults.map(result => {
      let conceptScore = 0;
      keyConcepts.forEach(concept => {
        if (result.text.toLowerCase().includes(concept.toLowerCase())) {
          conceptScore += 0.1; // Boost score for each concept found
        }
      });
      
      return {
        ...result,
        similarity: Math.min(result.similarity + conceptScore, 1.0) // Cap at 1.0
      };
    }).sort((a, b) => b.similarity - a.similarity);
  }
  
  return vectorResults;
}