// import { PrismaClient } from '@prisma/client';
// import { retrieveSimilarChunks } from './embeddingService';
// import axios from 'axios';

// const prisma = new PrismaClient();

// // You can replace this with your preferred LLM API
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// export async function generateChatResponse(
//   query: string, 
//   websiteId: number
// ): Promise<{ answer: string; sources: Array<{ url: string; title: string }> }> {
//   // Retrieve relevant chunks
//   const relevantChunks = await retrieveSimilarChunks(query, websiteId, 5);
  
//   if (relevantChunks.length === 0) {
//     return {
//       answer: "I couldn't find any relevant information to answer your question.",
//       sources: []
//     };
//   }
  
//   // Format context from chunks
//   const context = relevantChunks.map(chunk => chunk.text).join("\n\n");
  
//   // Generate prompt for LLM
//   const prompt = `
//   You are a helpful assistant that answers questions based on the following information from a website:
  
//   ${context}
  
//   User question: ${query}
  
//   Answer the question based only on the provided information. If you cannot answer from the given context, say so.
//   Include references to your sources in your answer using [1], [2], etc. notation.
//   `;
  
//   // Get response from LLM
//   const response = await callLLMAPI(prompt);
  
//   // Extract unique sources
//   const uniqueSources = Array.from(
//     new Map(relevantChunks.map(chunk => 
//       [chunk.url, {url: chunk.url, title: chunk.title || chunk.url}]
//     )).values()
//   );
  
//   // Log the interaction
//   await logChatInteraction(websiteId, query, response, uniqueSources);
  
//   return {
//     answer: response,
//     sources: uniqueSources
//   };
// }

// async function callLLMAPI(prompt: string): Promise<string> {
//   try {
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-3.5-turbo',
//         messages: [
//           { role: 'system', content: 'You are a helpful assistant.' },
//           { role: 'user', content: prompt }
//         ],
//         temperature: 0.3,
//         max_tokens: 500
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     return response.data.choices[0].message.content;
//   } catch (error) {
//     console.error('Error calling LLM API:', error);
//     return "I'm sorry, I encountered an error while generating a response.";
//   }
// }

// async function logChatInteraction(
//   websiteId: number,
//   query: string,
//   response: string,
//   sources: Array<{ url: string; title: string }>
// ): Promise<void> {
//   await prisma.chatInteraction.create({
//     data: {
//       websiteId,
//       query,
//       response,
//       sources: sources,
//       sessionId: generateSessionId()
//     }
//   });
// }

// function generateSessionId(): string {
//   return Math.random().toString(36).substring(2, 15);
// }