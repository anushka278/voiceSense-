/**
 * Game API Service
 * Uses OpenAI API to generate dynamic brain game questions and validate answers
 */

import OpenAI from 'openai';
import { isOpenAIConfigured } from './openaiApi';

/**
 * Safely extract and parse JSON from API response text
 * Handles cases where the API returns extra text before or after JSON
 */
function parseJSONFromText(text: string): any {
  // Remove markdown code blocks if present
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Try to find JSON object boundaries more precisely
  // Look for the first { and find the matching closing }
  let startIdx = text.indexOf('{');
  if (startIdx === -1) {
    throw new Error('No JSON object found in response');
  }
  
  // Find the matching closing brace
  let braceCount = 0;
  let endIdx = startIdx;
  
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') braceCount++;
    if (text[i] === '}') braceCount--;
    if (braceCount === 0) {
      endIdx = i;
      break;
    }
  }
  
  if (braceCount !== 0) {
    throw new Error('Invalid JSON structure - unmatched braces');
  }
  
  const jsonStr = text.substring(startIdx, endIdx + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    // If parsing fails, try to find JSON array instead
    startIdx = text.indexOf('[');
    if (startIdx !== -1) {
      braceCount = 0;
      for (let i = startIdx; i < text.length; i++) {
        if (text[i] === '[') braceCount++;
        if (text[i] === ']') braceCount--;
        if (braceCount === 0) {
          return JSON.parse(text.substring(startIdx, i + 1));
        }
      }
    }
    throw error;
  }
}

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim() || '';
const isValidApiKey = API_KEY && API_KEY.startsWith('sk-') && API_KEY.length > 40;

let openai: OpenAI | null = null;

if (API_KEY && isValidApiKey) {
  try {
    openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('Error initializing OpenAI API for games:', error);
  }
}

/**
 * Generate a memory game (story + questions) using AI
 */
export async function generateMemoryGame(): Promise<{
  id: string;
  type: 'story' | 'photo' | 'list';
  content: string;
  questions: Array<{ question: string; correctAnswer: string }>;
}> {
  if (!isOpenAIConfigured() || !openai) {
    // Fallback to hardcoded game
    const { getRandomMemoryGame } = await import('./gameData');
    return getRandomMemoryGame();
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are creating memory recall games for seniors. Generate a simple, engaging story (3-5 sentences) about everyday activities, family, hobbies, or community events. Then create 4 questions about specific details from the story. Keep stories warm and relatable. Questions should test memory of names, places, times, objects, or actions mentioned in the story.`
        },
        {
          role: 'user',
          content: `Generate a new memory recall game with:
1. A short story (3-5 sentences) about everyday life
2. 4 questions about specific details from the story
3. Each question should have a clear, simple correct answer

Return ONLY valid JSON in this exact format:
{
  "content": "the story text here",
  "questions": [
    {"question": "question 1", "correctAnswer": "answer 1"},
    {"question": "question 2", "correctAnswer": "answer 2"},
    {"question": "question 3", "correctAnswer": "answer 3"},
    {"question": "question 4", "correctAnswer": "answer 4"}
  ]
}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from API');

    // Parse JSON response safely
    const game = parseJSONFromText(text);
    
    // Validate structure
    if (!game.content || !game.questions || !Array.isArray(game.questions)) {
      throw new Error('Invalid game structure');
    }

    return {
      content: game.content,
      questions: game.questions.map((q: any) => ({
        question: q.question,
        correctAnswer: q.correctAnswer
      }))
    };
  } catch (error) {
    console.error('Error generating memory game:', error);
    // Fallback to hardcoded game
    const { getRandomMemoryGame } = await import('./gameData');
    const game = getRandomMemoryGame();
    return {
      content: game.content,
      questions: game.questions
    };
  }
}

/**
 * Generate an attention game using AI
 */
export async function generateAttentionGame(): Promise<{
  id: string;
  type: 'word_detection' | 'sound_pattern' | 'counting';
  content: string;
  targetWord?: string;
  correctCount: number;
}> {
  if (!isOpenAIConfigured() || !openai) {
    const { getRandomAttentionGame } = await import('./gameData');
    const game = getRandomAttentionGame();
    return {
      content: game.content,
      targetWord: game.targetWord,
      correctCount: game.correctCount
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are creating attention and focus games for seniors. Generate a short paragraph (4-6 sentences) that naturally repeats a specific word 4-6 times. The word should be a common, simple word.`
        },
        {
          role: 'user',
          content: `Generate a new attention game with:
1. A short paragraph (4-6 sentences) that naturally repeats a common word 4-6 times
2. The target word to count
3. The exact count of how many times the word appears

Return ONLY valid JSON in this exact format:
{
  "content": "the paragraph text here",
  "targetWord": "the word to count",
  "correctCount": 4
}`
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from API');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    const game = JSON.parse(jsonMatch[0]);
    
    if (!game.content || !game.targetWord || typeof game.correctCount !== 'number') {
      throw new Error('Invalid game structure');
    }

    return game;
  } catch (error) {
    console.error('Error generating attention game:', error);
    const { getRandomAttentionGame } = await import('./gameData');
    const game = getRandomAttentionGame();
    return {
      content: game.content,
      targetWord: game.targetWord,
      correctCount: game.correctCount
    };
  }
}

/**
 * Generate a language game using AI
 */
export async function generateLanguageGame(): Promise<{
  id: string;
  type: 'sentence_completion' | 'naming' | 'description';
  prompt: string;
  expectedResponses: string[];
  difficultyLevel: 1 | 2 | 3;
}> {
  if (!isOpenAIConfigured() || !openai) {
    const { getRandomLanguageGame } = await import('./gameData');
    return getRandomLanguageGame();
  }

  try {
    const gameTypes = ['sentence_completion', 'naming', 'description'];
    const selectedType = gameTypes[Math.floor(Math.random() * gameTypes.length)] as 'sentence_completion' | 'naming' | 'description';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are creating language formation games for seniors. Generate simple, clear prompts that test language skills.`
        },
        {
          role: 'user',
          content: `Generate a ${selectedType} language game. For sentence_completion, provide an incomplete sentence. For naming, ask to name 3+ items in a category. For description, ask to describe something.

Return ONLY valid JSON in this exact format:
{
  "prompt": "the prompt/question text",
  "type": "${selectedType}",
  "expectedResponses": ["answer1", "answer2", "answer3"],
  "difficultyLevel": 1
}`
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from API');

    const game = parseJSONFromText(text);
    
    if (!game.prompt || !game.expectedResponses || !Array.isArray(game.expectedResponses)) {
      throw new Error('Invalid game structure');
    }

    return {
      id: `language-ai-${Date.now()}`,
      prompt: game.prompt,
      type: selectedType,
      expectedResponses: game.expectedResponses,
      difficultyLevel: (game.difficultyLevel || 1) as 1 | 2 | 3
    };
  } catch (error) {
    console.error('Error generating language game:', error);
    const { getRandomLanguageGame } = await import('./gameData');
    return getRandomLanguageGame();
  }
}

/**
 * Generate a processing speed game using AI
 */
export async function generateProcessingSpeedGame(): Promise<{
  id: string;
  type: 'category_naming' | 'object_naming' | 'word_association';
  category: string;
  timeLimit: number;
  minimumResponses: number;
}> {
  if (!isOpenAIConfigured() || !openai) {
    const { getRandomProcessingSpeedGame } = await import('./gameData');
    return getRandomProcessingSpeedGame();
  }

  try {
    const categories = [
      'fruits', 'vegetables', 'animals', 'colors', 'countries', 'cities',
      'things in a kitchen', 'things you wear', 'things in a living room',
      'words that rhyme with "day"', 'words that rhyme with "cat"',
      'things that are red', 'things that fly', 'things that are round'
    ];
    const category = categories[Math.floor(Math.random() * categories.length)];

    return {
      id: `speed-ai-${Date.now()}`,
      type: 'category_naming' as const,
      category,
      timeLimit: 25,
      minimumResponses: 5
    };
  } catch (error) {
    console.error('Error generating processing speed game:', error);
    const { getRandomProcessingSpeedGame } = await import('./gameData');
    return getRandomProcessingSpeedGame();
  }
}

/**
 * Generate a category sorting game using AI
 */
export async function generateCategorySortingGame(): Promise<{
  id: string;
  type: 'single_choice' | 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficultyLevel: 1 | 2 | 3;
}> {
  if (!isOpenAIConfigured() || !openai) {
    const { getRandomCategorySortingGame } = await import('./gameData');
    return getRandomCategorySortingGame();
  }

  try {
    const categories = [
      { name: 'vegetables', examples: ['carrot', 'broccoli', 'lettuce'] },
      { name: 'fruits', examples: ['apple', 'banana', 'orange'] },
      { name: 'animals', examples: ['dog', 'cat', 'bird'] },
      { name: 'colors', examples: ['red', 'blue', 'green'] },
      { name: 'tools', examples: ['hammer', 'screwdriver', 'wrench'] },
      { name: 'clothing', examples: ['shirt', 'pants', 'shoes'] }
    ];
    
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const wrongOptions = ['airplane', 'book', 'computer', 'mountain', 'ocean', 'music'];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Generate a category sorting question for "${selectedCategory.name}". Provide:
1. A question asking which item belongs to the category
2. 3 options: one correct answer from ${selectedCategory.examples.join(', ')}, and 2 wrong answers from ${wrongOptions.join(', ')}
3. Shuffle the options

Return ONLY valid JSON:
{
  "question": "Which one is a ${selectedCategory.name}?",
  "options": ["correct", "wrong1", "wrong2"],
  "correctAnswer": "correct",
  "category": "${selectedCategory.name}",
  "difficultyLevel": 1
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from API');

    const game = parseJSONFromText(text);
    
    if (!game.question || !game.options || !game.correctAnswer) {
      throw new Error('Invalid game structure');
    }

    return {
      id: `category-ai-${Date.now()}`,
      type: 'single_choice' as const,
      question: game.question,
      options: game.options,
      correctAnswer: game.correctAnswer,
      category: selectedCategory.name,
      difficultyLevel: 1 as const
    };
  } catch (error) {
    console.error('Error generating category sorting game:', error);
    const { getRandomCategorySortingGame } = await import('./gameData');
    return getRandomCategorySortingGame();
  }
}

/**
 * Generate a pattern completion game using AI
 */
export async function generatePatternCompletionGame(): Promise<{
  id: string;
  type: 'color' | 'number' | 'word' | 'shape';
  pattern: string[];
  missingIndex: number;
  options: string[];
  correctAnswer: string;
}> {
  if (!isOpenAIConfigured() || !openai) {
    const { getRandomPatternCompletionGame } = await import('./gameData');
    return getRandomPatternCompletionGame();
  }

  try {
    const patternTypes = [
      { type: 'color', examples: ['red', 'blue', 'green', 'yellow'] },
      { type: 'number', examples: ['one', 'two', 'three', 'four'] },
      { type: 'word', examples: ['cat', 'dog', 'bird', 'fish'] }
    ];
    
    const selectedType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    const pattern = [selectedType.examples[0], selectedType.examples[1], selectedType.examples[0], selectedType.examples[1]];
    const correctAnswer = selectedType.examples[0];
    const wrongOptions = selectedType.examples.slice(2);
    const typeMap: Record<string, 'color' | 'number' | 'word' | 'shape'> = {
      'color': 'color',
      'number': 'number',
      'word': 'word'
    };

    return {
      id: `pattern-ai-${Date.now()}`,
      type: typeMap[selectedType.type] || 'word',
      pattern,
      missingIndex: 4,
      options: [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5),
      correctAnswer
    };
  } catch (error) {
    console.error('Error generating pattern completion game:', error);
    const { getRandomPatternCompletionGame } = await import('./gameData');
    return getRandomPatternCompletionGame();
  }
}

/**
 * Use AI to validate if a user's answer matches the correct answer
 * Handles variations, typos, casing, and similar meanings
 */
export async function validateAnswer(
  userAnswer: string,
  correctAnswer: string,
  question?: string
): Promise<boolean> {
  if (!isOpenAIConfigured() || !openai) {
    // Fallback to local matching
    const { matchAnswer } = await import('./answerMatcher');
    return matchAnswer(userAnswer, correctAnswer);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are validating answers for a cognitive game. Be lenient - accept answers that are:
- Similar in meaning (synonyms)
- Have minor spelling errors
- Use different casing (uppercase/lowercase)
- Use different word forms (singular/plural)
- Are equivalent (e.g., "3" and "three", "Monday" and "Mon")

Return ONLY "true" or "false" as a JSON boolean.`
        },
        {
          role: 'user',
          content: `Question: ${question || 'N/A'}
Correct answer: "${correctAnswer}"
User answer: "${userAnswer}"

Is the user's answer correct (considering variations, typos, casing, and similar meanings)? Return ONLY true or false as JSON: {"isCorrect": true/false}`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent validation
      max_tokens: 50
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      // Fallback to local matching
      const { matchAnswer } = await import('./answerMatcher');
      return matchAnswer(userAnswer, correctAnswer);
    }

    // Try to parse JSON response
    try {
      const result = parseJSONFromText(text);
      if (typeof result.isCorrect === 'boolean') {
        return result.isCorrect;
      }
    } catch (e) {
      // If JSON parsing fails, check for boolean strings
      if (text.toLowerCase().includes('true')) return true;
      if (text.toLowerCase().includes('false')) return false;
    }

    // Fallback to local matching
    const { matchAnswer } = await import('./answerMatcher');
    return matchAnswer(userAnswer, correctAnswer);
  } catch (error) {
    console.error('Error validating answer with AI:', error);
    // Fallback to local matching
    const { matchAnswer } = await import('./answerMatcher');
    return matchAnswer(userAnswer, correctAnswer);
  }
}
