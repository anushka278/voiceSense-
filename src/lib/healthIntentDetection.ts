import type { HealthIntent } from '@/types';

/**
 * Detects health-related intents from conversation
 */
export function detectHealthIntent(transcript: string): HealthIntent | null {
  const lowerTranscript = transcript.toLowerCase();

  // Symptom detection
  const symptomKeywords = [
    'dizzy', 'nauseous', 'tired', 'weak', 'fever', 'headache', 
    'pain', 'ache', 'sore', 'unwell', 'sick', 'ill', 'symptom'
  ];
  if (symptomKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'symptom';
  }

  // Medication detection
  const medicationKeywords = [
    'pill', 'medicine', 'medication', 'prescription', 'drug', 
    'take my', 'did i take', 'forgot to take', 'dose'
  ];
  if (medicationKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'medication';
  }

  // Pain detection
  const painKeywords = ['pain', 'hurts', 'aching', 'sore', 'discomfort'];
  if (painKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'pain';
  }

  // Appointment detection
  const appointmentKeywords = [
    'doctor', 'appointment', 'visit', 'clinic', 'hospital', 
    'checkup', 'see the doctor'
  ];
  if (appointmentKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'appointment';
  }

  // Mood detection
  const moodKeywords = [
    'feel', 'feeling', 'emotion', 'mood', 'anxious', 'worried', 
    'sad', 'happy', 'depressed', 'stressed'
  ];
  if (moodKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'mood';
  }

  // Sleep detection
  const sleepKeywords = [
    'sleep', 'slept', 'insomnia', 'tired', 'exhausted', 
    'rest', 'nap', 'awake'
  ];
  if (sleepKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'sleep';
  }

  // Nutrition detection
  const nutritionKeywords = [
    'eat', 'ate', 'food', 'meal', 'hungry', 'appetite', 
    'breakfast', 'lunch', 'dinner', 'snack'
  ];
  if (nutritionKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    return 'nutrition';
  }

  return null;
}

/**
 * Generates follow-up questions based on health intent
 */
export function generateHealthFollowUpQuestions(intent: HealthIntent): string[] {
  const questions: Record<HealthIntent, string[]> = {
    symptom: [
      "When did this start?",
      "Have you eaten today?",
      "Are you taking any medications?",
      "How would you rate your discomfort on a scale of 1-10?"
    ],
    medication: [
      "What medication are you referring to?",
      "When were you supposed to take it?",
      "Did you take it earlier today?",
      "Would you like me to remind you?"
    ],
    pain: [
      "What is your pain level on a scale of 1-10?",
      "Where exactly does it hurt?",
      "When did the pain start?",
      "Does anything make it better or worse?"
    ],
    appointment: [
      "When is your appointment?",
      "What is it for?",
      "Do you need help preparing for it?",
      "Would you like me to remind you?"
    ],
    mood: [
      "How are you feeling right now?",
      "What's on your mind?",
      "Is there something specific that's bothering you?",
      "Would you like to talk about it?"
    ],
    sleep: [
      "How many hours did you sleep last night?",
      "Did you have trouble falling asleep?",
      "Did you wake up during the night?",
      "How do you feel when you wake up?"
    ],
    nutrition: [
      "What did you eat today?",
      "Are you feeling hungry?",
      "Are you having any trouble eating?",
      "How is your appetite?"
    ],
    general: [
      "How are you feeling overall?",
      "Is there anything you'd like to tell me about your health?",
      "Have you noticed any changes recently?"
    ]
  };

  return questions[intent] || questions.general;
}

/**
 * Extracts pain level from transcript (1-10)
 */
export function extractPainLevel(transcript: string): number | null {
  const lowerTranscript = transcript.toLowerCase();
  
  // Look for explicit pain level mentions
  const painLevelMatch = lowerTranscript.match(/(?:pain|hurt|discomfort).*?(\d+)/);
  if (painLevelMatch) {
    const level = parseInt(painLevelMatch[1]);
    if (level >= 1 && level <= 10) {
      return level;
    }
  }

  // Look for "on a scale" patterns
  const scaleMatch = lowerTranscript.match(/scale.*?(\d+)/);
  if (scaleMatch) {
    const level = parseInt(scaleMatch[1]);
    if (level >= 1 && level <= 10) {
      return level;
    }
  }

  return null;
}

