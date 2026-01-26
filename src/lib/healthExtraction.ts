// Health Information Extraction
// Passively detects health-related information during conversation

import type { HealthCard, HealthCategory } from '@/types';

interface HealthKeyword {
  category: HealthCategory;
  keywords: string[];
  severity?: 'low' | 'moderate' | 'high';
}

const HEALTH_KEYWORDS: HealthKeyword[] = [
  {
    category: 'pain',
    keywords: ['pain', 'ache', 'aching', 'sore', 'hurt', 'hurting', 'discomfort', 'tender', 'stiff', 'sharp', 'dull', 'throbbing', 'burning'],
    severity: 'moderate'
  },
  {
    category: 'sleep',
    keywords: ['sleep', 'slept', 'sleeping', 'insomnia', 'tired', 'exhausted', 'restless', 'wake', 'waking', 'nightmare', 'dream', 'nap', 'snooze'],
    severity: 'low'
  },
  {
    category: 'mood',
    keywords: ['happy', 'sad', 'depressed', 'anxious', 'worried', 'stressed', 'calm', 'peaceful', 'frustrated', 'angry', 'upset', 'down', 'blue', 'mood'],
    severity: 'low'
  },
  {
    category: 'energy',
    keywords: ['energy', 'energetic', 'tired', 'fatigue', 'exhausted', 'lethargic', 'weak', 'drained', 'lively', 'active', 'sluggish'],
    severity: 'low'
  },
  {
    category: 'appetite',
    keywords: ['appetite', 'hungry', 'eating', 'food', 'meal', 'nausea', 'nauseous', 'stomach', 'digestion', 'indigestion', 'appetite loss'],
    severity: 'low'
  },
  {
    category: 'mobility',
    keywords: ['walk', 'walking', 'move', 'moving', 'mobility', 'stiff', 'stiffness', 'joint', 'knee', 'hip', 'back', 'shoulder', 'limb', 'leg', 'arm'],
    severity: 'moderate'
  },
  {
    category: 'medication',
    keywords: ['medication', 'medicine', 'pill', 'prescription', 'drug', 'dose', 'dosage', 'take', 'taking', 'forgot', 'missed', 'pharmacy'],
    severity: 'high'
  },
  {
    category: 'symptom',
    keywords: ['symptom', 'fever', 'cough', 'headache', 'dizziness', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'rash', 'swelling', 'inflammation'],
    severity: 'moderate'
  }
];

/**
 * Extract health information from conversation text
 */
export function extractHealthInfo(text: string): Array<{
  category: HealthCategory;
  description: string;
  severity: 'low' | 'moderate' | 'high';
  confidence: 'explicit' | 'inferred';
}> {
  const textLower = text.toLowerCase();
  const detected: Array<{
    category: HealthCategory;
    description: string;
    severity: 'low' | 'moderate' | 'high';
    confidence: 'explicit' | 'inferred';
  }> = [];
  
  // Check for explicit health mentions
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  HEALTH_KEYWORDS.forEach(({ category, keywords, severity: defaultSeverity }) => {
    keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        // Find the sentence containing this keyword
        const containingSentence = sentences.find(s => 
          s.toLowerCase().includes(keyword)
        );
        
        if (containingSentence) {
          // Check if it's an explicit mention (e.g., "I have pain" vs "no pain")
          const isExplicit = !containingSentence.toLowerCase().match(/\b(no|not|don't|doesn't|didn't|won't|can't|isn't|aren't|wasn't|weren't)\b/);
          
          // Determine severity
          let severity: 'low' | 'moderate' | 'high' = defaultSeverity || 'low';
          
          // Check for severity indicators
          if (containingSentence.toLowerCase().match(/\b(severe|terrible|awful|extreme|intense|unbearable|bad|really bad|very bad)\b/)) {
            severity = 'high';
          } else if (containingSentence.toLowerCase().match(/\b(mild|slight|little|bit|somewhat|moderate)\b/)) {
            severity = 'low';
          } else if (containingSentence.toLowerCase().match(/\b(moderate|medium|okay|ok)\b/)) {
            severity = 'moderate';
          }
          
          // Avoid duplicates
          const alreadyDetected = detected.some(d => 
            d.category === category && 
            d.description.toLowerCase().includes(keyword)
          );
          
          if (!alreadyDetected && isExplicit) {
            detected.push({
              category,
              description: containingSentence.trim(),
              severity,
              confidence: isExplicit ? 'explicit' : 'inferred'
            });
          }
        }
      }
    });
  });
  
  return detected;
}

/**
 * Create a health card from extracted information
 */
export function createHealthCard(
  healthInfo: {
    category: HealthCategory;
    description: string;
    severity: 'low' | 'moderate' | 'high';
    confidence: 'explicit' | 'inferred';
  },
  sourceSessionId?: string
): Omit<HealthCard, 'id' | 'confirmed'> {
  return {
    date: new Date(),
    category: healthInfo.category,
    description: healthInfo.description,
    severity: healthInfo.severity,
    confidence: healthInfo.confidence,
    sourceSessionId
  };
}
