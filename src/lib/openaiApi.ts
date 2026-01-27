/**
 * OpenAI API Service
 * Handles all interactions with OpenAI's GPT models for Sage conversations
 */

import OpenAI from 'openai';

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim() || '';

// Validate OpenAI API key format (should start with 'sk-' and be ~51 characters)
const isValidApiKey = API_KEY && API_KEY.startsWith('sk-') && API_KEY.length > 40;

if (!API_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_OPENAI_API_KEY is not set. AI features will not work.');
} else if (!isValidApiKey) {
  console.error('❌ Invalid OpenAI API key format!');
  console.error('   OpenAI API keys must start with "sk-" and be ~51 characters long.');
  console.error('   Get your key at: https://platform.openai.com/api-keys');
  console.error(`   Current key format: ${API_KEY.substring(0, 10)}... (${API_KEY.length} chars)`);
}

// Initialize the OpenAI client
let openai: OpenAI | null = null;

if (API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  } catch (error) {
    console.error('Error initializing OpenAI API:', error);
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
 * Generate a response from Sage using OpenAI API
 */
export async function generateSageResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'sage'; content: string }> = []
): Promise<string> {
  // If API key is not set or invalid, return a fallback response
  if (!API_KEY || !isValidApiKey || !openai) {
    if (API_KEY && !isValidApiKey) {
      console.error('❌ Invalid OpenAI API key format. Please update your .env.local file with a valid key from https://platform.openai.com/api-keys');
    } else {
      console.warn('OpenAI API not configured, using fallback response');
    }
    return getFallbackResponse(userMessage);
  }

  try {
    // Convert conversation history to OpenAI format
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SAGE_SYSTEM_PROMPT
      },
      ...conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.role === 'sage' ? 'assistant' as const : 'user' as const,
          content: msg.content
        })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o-mini for cost-effectiveness, can change to 'gpt-4' or 'gpt-3.5-turbo'
      messages: messages,
      temperature: 0.7, // Makes responses more natural and varied
      max_tokens: 150 // Keep responses concise
    });

    const text = completion.choices[0]?.message?.content?.trim();

    // Ensure response is not empty
    if (!text || text.length === 0) {
      return getFallbackResponse(userMessage);
    }

    return text;
  } catch (error: any) {
    console.error('Error generating Sage response:', error);
    
    // Check for authentication errors
    if (error?.message?.includes('401') || 
        error?.message?.includes('Unauthorized') ||
        error?.status === 401) {
      console.error('❌ OpenAI API authentication failed. Please check your API key.');
    } else if (error?.message?.includes('429') || error?.status === 429) {
      console.error('❌ OpenAI API rate limit exceeded. Please try again later.');
    }
    
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
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!API_KEY && !!openai;
}
