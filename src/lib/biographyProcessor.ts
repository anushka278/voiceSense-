import type { BiographyEntry, MemorySession } from '@/types';

/**
 * Background function that analyzes chat logs and extracts biographical facts
 * This simulates sending to an AI service for analysis
 */
export async function processBiographyFromTranscript(
  transcript: string,
  chapter: string
): Promise<BiographyEntry> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Extract key biographical facts from transcript
  // In a real implementation, this would call an AI API
  const extractedFacts = extractBiographicalFacts(transcript);

  const entry: BiographyEntry = {
    id: crypto.randomUUID(),
    chapter: chapter as any,
    content: formatBiographyContent(transcript, chapter),
    extractedFacts,
    timestamp: new Date(),
    sourceSessionId: crypto.randomUUID()
  };

  return entry;
}

/**
 * Extracts biographical facts from transcript
 * In production, this would use an AI service with the prompt:
 * "Analyze the transcript below. Extract key biographical facts (dates, names, locations, life lessons) 
 * and format them into a structured JSON file titled 'Grandma's Life Story.' Ignore small talk."
 */
function extractBiographicalFacts(transcript: string): BiographyEntry['extractedFacts'] {
  const facts: BiographyEntry['extractedFacts'] = {
    dates: [],
    names: [],
    locations: [],
    lifeLessons: []
  };

  // Simple pattern matching (in production, use AI)
  const datePattern = /\b(19|20)\d{2}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi;
  const dates = transcript.match(datePattern);
  if (dates) {
    facts.dates = [...new Set(dates)];
  }

  // Extract capitalized words (likely names/places)
  const capitalizedWords = transcript.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (capitalizedWords) {
    const filtered = capitalizedWords.filter(word => 
      !['I', 'The', 'This', 'That', 'When', 'Where', 'What', 'How', 'Why'].includes(word)
    );
    facts.names = [...new Set(filtered.slice(0, 10))];
  }

  // Extract locations (words after "in", "at", "from")
  const locationPattern = /\b(in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
  const locations = [...transcript.matchAll(locationPattern)];
  if (locations.length > 0) {
    facts.locations = [...new Set(locations.map(m => m[2]).slice(0, 5))];
  }

  // Extract life lessons (sentences with "learned", "taught", "important", etc.)
  const lessonKeywords = ['learned', 'taught', 'important', 'remember', 'always', 'never', 'should'];
  const sentences = transcript.split(/[.!?]+/);
  const lessons = sentences
    .filter(s => lessonKeywords.some(keyword => s.toLowerCase().includes(keyword)))
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 3);
  
  if (lessons.length > 0) {
    facts.lifeLessons = lessons;
  }

  return facts;
}

/**
 * Formats transcript into biography content
 */
function formatBiographyContent(transcript: string, chapter: string): string {
  // Clean up the transcript and format it as a biography entry
  const cleaned = transcript
    .replace(/\s+/g, ' ')
    .trim();
  
  // Add chapter context
  return `During ${chapter}, ${cleaned}`;
}

/**
 * Generates empathetic follow-up questions based on the conversation
 */
export function generateFollowUpQuestions(
  currentTopic: string,
  previousResponses: string[]
): string[] {
  const questions: string[] = [];

  // Generate contextual follow-up questions
  if (currentTopic.toLowerCase().includes('childhood')) {
    questions.push(
      "What was your favorite memory from that time?",
      "Who were the most important people in your life then?",
      "What did you learn from that experience?"
    );
  } else if (currentTopic.toLowerCase().includes('career')) {
    questions.push(
      "What did you enjoy most about that work?",
      "What challenges did you face?",
      "How did that shape who you are today?"
    );
  } else if (currentTopic.toLowerCase().includes('marriage') || currentTopic.toLowerCase().includes('family')) {
    questions.push(
      "What made that moment special?",
      "How did that change your life?",
      "What would you want others to know about that time?"
    );
  } else {
    questions.push(
      "Can you tell me more about that?",
      "What stands out most in your memory?",
      "How did that make you feel?"
    );
  }

  return questions;
}

