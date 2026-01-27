/**
 * Gemini API Service
 * Handles all interactions with Google's Gemini AI model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_GEMINI_API_KEY is not set. AI features will not work.');
}

// Initialize the Gemini client
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-1.5-flash for faster responses, or gemini-1.5-pro for better quality
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Error initializing Gemini API:', error);
  }
}

/**
 * System prompt for Sage - defines the AI's personality and behavior
 */
const SAGE_SYSTEM_PROMPT = `You are Sage, a warm, empathetic, and thoughtful conversational assistant designed to engage users in natural daily conversation. Your role is to:

- Be a supportive, attentive listener
- Engage in natural, unscripted conversation
- Never mention analysis, scoring, health cards, or caregivers
- Maintain a calm, patient, human tone at all times
- Show genuine interest in what the user shares
- Ask thoughtful follow-up questions when appropriate
- Keep responses concise and conversational (2-3 sentences typically)
- Never diagnose, label, or alarm the user
- Remember context from the conversation

You are having a voice-first conversation, so keep responses natural and conversational.`;

/**
 * Generate a response from Sage using Gemini AI
 */
export async function generateSageResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'sage'; content: string }> = []
): Promise<string> {
  // If API key is not set, return a fallback response
  if (!API_KEY || !model) {
    console.warn('Gemini API not configured, using fallback response');
    return getFallbackResponse(userMessage);
  }

  try {
    // Build conversation history for context
    const historyText = conversationHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role === 'sage' ? 'Sage' : 'User'}: ${msg.content}`)
      .join('\n');

    // Construct the full prompt
    const prompt = `${SAGE_SYSTEM_PROMPT}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}User: ${userMessage}\nSage:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Ensure response is not empty
    if (!text || text.length === 0) {
      return getFallbackResponse(userMessage);
    }

    return text;
  } catch (error) {
    console.error('Error generating Sage response:', error);
    return getFallbackResponse(userMessage);
  }
}

/**
 * Fallback response generator (used when API is unavailable)
 */
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Health-related responses
  if (lowerMessage.match(/\b(pain|ache|hurt|sore)\b/)) {
    return "I'm sorry to hear that. Can you tell me more about what's bothering you?";
  }
  if (lowerMessage.match(/\b(sleep|tired|exhausted)\b/)) {
    return "How have you been sleeping lately?";
  }
  if (lowerMessage.match(/\b(mood|feeling|feel)\b/)) {
    return "How are you feeling today?";
  }
  
  // General conversational responses
  if (lowerMessage.match(/\b(good|great|fine|well|okay|ok)\b/)) {
    return "That's wonderful to hear! What have you been up to?";
  }
  if (lowerMessage.match(/\b(bad|not good|terrible|awful)\b/)) {
    return "I'm sorry to hear that. Would you like to talk about it?";
  }
  if (lowerMessage.match(/\?/)) {
    return "That's an interesting question. What do you think about that?";
  }
  
  // Default natural responses
  const responses = [
    "Tell me more about that.",
    "That sounds interesting. What else is on your mind?",
    "I'd like to hear more.",
    "How does that make you feel?",
    "What else would you like to share?",
    "That's really nice to hear.",
    "I understand. Can you tell me more?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!API_KEY && !!model;
}
