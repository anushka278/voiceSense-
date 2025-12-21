// Core Types for VoiceSense

export type EmotionalState = 'calm' | 'happy' | 'anxious' | 'sad' | 'agitated' | 'neutral';

export interface SpeechAnalysis {
  id: string;
  timestamp: Date;
  duration: number; // seconds
  transcript: string;
  metrics: {
    sentenceLength: number;
    vocabularyComplexity: number; // 0-100
    grammarConsistency: number; // 0-100
    repetitionCount: number;
    pauseFrequency: number; // pauses per minute
    speechRate: number; // words per minute
    fleschKincaidGrade: number;
  };
  emotionalState: EmotionalState;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface LanguageComplexityScore {
  date: Date;
  overallScore: number; // 0-100
  breakdown: {
    vocabulary: number;
    grammar: number;
    fluency: number;
    coherence: number;
  };
  timeOfDayScores: {
    morning: number | null;
    afternoon: number | null;
    evening: number | null;
  };
}

export interface CognitiveGameResult {
  id: string;
  gameType: 'memory_recall' | 'attention_focus' | 'language_formation' | 'processing_speed' | 'category_sorting' | 'pattern_completion';
  timestamp: Date;
  accuracy: number; // 0-100
  responseTime: number; // milliseconds average
  repetitionsNeeded: number;
  frustrationDetected: boolean;
  completed: boolean;
}

export interface MemoryGame {
  id: string;
  type: 'story' | 'photo' | 'list';
  content: string;
  questions: {
    question: string;
    correctAnswer: string;
  }[];
}

export interface AttentionGame {
  id: string;
  type: 'word_detection' | 'sound_pattern' | 'counting';
  content: string;
  targetWord?: string;
  correctCount: number;
}

export interface LanguageGame {
  id: string;
  type: 'sentence_completion' | 'naming' | 'description';
  prompt: string;
  expectedResponses: string[];
  difficultyLevel: 1 | 2 | 3;
}

export interface ProcessingSpeedGame {
  id: string;
  type: 'category_naming' | 'object_naming' | 'word_association';
  category: string;
  timeLimit: number; // seconds
  minimumResponses: number;
}

export interface CategorySortingGame {
  id: string;
  type: 'single_choice' | 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficultyLevel: 1 | 2 | 3;
}

export interface PatternCompletionGame {
  id: string;
  type: 'color' | 'number' | 'word' | 'shape';
  pattern: string[];
  missingIndex: number;
  options: string[];
  correctAnswer: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photoUrl?: string;
  voiceRecordingUrl?: string;
  memories: FamilyMemory[];
  recentUpdates: FamilyUpdate[];
}

export interface FamilyMemory {
  id: string;
  title: string;
  description: string;
  date?: Date;
  photoUrl?: string;
  tags: string[];
}

export interface FamilyUpdate {
  id: string;
  content: string;
  date: Date;
  author: string;
}

export interface CognitiveProfile {
  userId: string;
  lastUpdated: Date;
  overallTrend: 'stable' | 'improving' | 'declining' | 'variable';
  languageComplexity: {
    current: number;
    trend: number; // positive = improving
    weeklyAverage: number;
  };
  memoryRecall: {
    current: number;
    trend: number;
    weeklyAverage: number;
  };
  attention: {
    current: number;
    trend: number;
    weeklyAverage: number;
  };
  processingSpeed: {
    current: number;
    trend: number;
    weeklyAverage: number;
  };
  emotionalPatterns: {
    dominant: EmotionalState;
    frequency: Record<EmotionalState, number>;
  };
  peakCognitionTime: 'morning' | 'afternoon' | 'evening';
  recentInsights: Insight[];
}

export interface Insight {
  id: string;
  timestamp: Date;
  type: 'language' | 'memory' | 'attention' | 'emotion' | 'pattern';
  severity: 'info' | 'notable' | 'significant';
  title: string;
  description: string;
  recommendation?: string;
}

export interface DailyLog {
  date: Date;
  speechSessions: SpeechAnalysis[];
  gameResults: CognitiveGameResult[];
  emotionalJourney: {
    time: Date;
    state: EmotionalState;
  }[];
  averageLanguageComplexity: number;
  notes?: string;
}

export interface ConversationSettings {
  speechRate: 'slow' | 'normal' | 'fast';
  sentenceComplexity: 'simple' | 'moderate' | 'complex';
  usesFamiliarNames: boolean;
  repetitionEnabled: boolean;
  calmingModeActive: boolean;
}

export interface User {
  id: string;
  name: string;
  preferredName: string;
  dateOfBirth?: Date;
  profilePhotoUrl?: string;
  familyMembers: FamilyMember[];
  cognitiveProfile: CognitiveProfile;
  conversationSettings: ConversationSettings;
  createdAt: Date;
}

// Feature 7: Biography Capture Types
export type LifeChapter = 'childhood' | 'career' | 'marriage' | 'family' | 'hobbies' | 'travel' | 'achievements' | 'lessons';

export interface MemorySession {
  id: string;
  chapter: LifeChapter;
  timestamp: Date;
  transcript: string;
  questions: {
    question: string;
    response: string;
    timestamp: Date;
  }[];
  status: 'active' | 'completed' | 'paused';
}

export interface BiographyEntry {
  id: string;
  chapter: LifeChapter;
  content: string;
  extractedFacts: {
    dates?: string[];
    names?: string[];
    locations?: string[];
    lifeLessons?: string[];
  };
  timestamp: Date;
  sourceSessionId: string;
}

export interface Biography {
  id: string;
  userId: string;
  title: string;
  entries: BiographyEntry[];
  lastUpdated: Date;
  isComplete: boolean;
}

// Feature 8: Health Scribe Types
export type HealthIntent = 'symptom' | 'medication' | 'appointment' | 'pain' | 'mood' | 'sleep' | 'nutrition' | 'general';

export interface HealthEntry {
  id: string;
  timestamp: Date;
  intent: HealthIntent;
  primaryConcern: string;
  followUpQuestions: {
    question: string;
    response: string;
    timestamp: Date;
  }[];
  painLevel?: number; // 1-10
  notes: string;
  tags: string[];
}

export interface MedicalJournal {
  id: string;
  userId: string;
  entries: HealthEntry[];
  lastUpdated: Date;
  summary: {
    recentSymptoms: string[];
    medicationCompliance: number; // 0-100
    painTrend: 'improving' | 'stable' | 'worsening';
    lastDoctorVisit?: Date;
  };
}

