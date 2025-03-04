import { PrismaClient } from '@prisma/client';
import { retrieveSimilarChunks } from './embedding.service.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateChatResponse(
  query: string, 
  websiteId: number,
  chatHistory: Array<{role: string, content: string}> = []
): Promise<{ 
  answer: string; 
  sources: Array<{ url: string; title: string; relevance: number }>; 
  followupQuestions?: string[];
}> {



  // Retrieve relevant chunks with similarity scores
  const relevantChunks = await retrieveSimilarChunks(query, websiteId, 3);
  
  if (relevantChunks.length === 0) {
    return {
      answer: "I couldn't find any relevant information to answer your question. Could you rephrase or ask something else about this website?",
      sources: [],
      followupQuestions: [
        "What specific information are you looking for?",
        "Would you like to know general information about this website instead?",
        "Can I help you navigate to a different topic?"
      ]
    };
  }
  
  // Calculate normalized relevance scores (0-100)
  const chunks = relevantChunks.map(chunk => ({
    ...chunk,
    relevance: Math.round(chunk.similarity * 100)
  }));

  console.log('chunks for normalized', chunks);
  
  // Sort chunks by relevance
  chunks.sort((a, b) => b.relevance - a.relevance);

  console.log('chunks for sorted', chunks);
  
  // Filter out low-relevance chunks (optional threshold)
  const highRelevanceChunks = chunks.filter(chunk => chunk.relevance > 60);
  const finalChunks = highRelevanceChunks.length > 0 ? highRelevanceChunks : chunks.slice(0, 3);
  
  // Format context from chunks with metadata
  const context = finalChunks.map((chunk, i) => 
    `[DOCUMENT ${i+1}] (Source: ${chunk.title || 'Untitled'}, URL: ${chunk.url})
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

  console.log('unique sources', uniqueSources);
  
  // Generate system prompt
  const systemPrompt = `You are an intelligent assistant that answers questions based on information from a specific website. 
  
  IMPORTANT INSTRUCTIONS:
  1. Base your answers ONLY on the provided documents. If the information isn't in the documents, say "I don't have enough information to answer that question based on the website content."
  2. Cite your sources using [DOCUMENT X] notation.
  3. Be concise but comprehensive.
  4. Format your response using Markdown when appropriate.
  5. If you quote text directly, use quotation marks.
  6. Analyze the information critically and provide thoughtful insights.
  7. Maintain a helpful, professional tone.
  
  DOCUMENTS FROM WEBSITE:
  ${context}`;

  try {
    // Configure Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
      },
    });

    // Create chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "I'll be asking questions about a website. Please follow the instructions carefully." }],
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
        temperature: 0.2,
        topP: 0.8,
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
      And these website documents: 
      ${finalChunks.map(c => c.text).join("\n\n").substring(0, 1000)}
      
      Generate 3 natural follow-up questions the user might want to ask next.
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
      answer: "I'm sorry, I encountered an error while generating a response. Please try again in a moment.",
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
  const interactions = await prisma.chatInteraction.findMany({
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
  interactions.reverse().forEach(interaction => {
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