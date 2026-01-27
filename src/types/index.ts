// Core Types for Sage

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
  username?: string; // Username to connect accounts
  photoUrl?: string;
  voiceRecordingUrl?: string;
  status: 'connected' | 'pending' | 'requested'; // Connection status
  messages: FamilyMessage[]; // Messages between family members
}

export interface FamilyRequest {
  id: string;
  fromUsername: string; // Username of person sending request
  fromName: string;
  toUsername: string; // Username of person receiving request
  relationship: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface FamilyMessage {
  id: string;
  fromUsername: string;
  fromName: string;
  toUsername: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface CognitiveProfile {
  userId: string;
  lastUpdated: Date;
  overallTrend: 'stable' | 'improving' | 'declining' | 'variable' | null;
  languageComplexity: {
    current: number | null;
    trend: number | null; // positive = improving
    weeklyAverage: number | null;
  };
  memoryRecall: {
    current: number | null;
    trend: number | null;
    weeklyAverage: number | null;
  };
  attention: {
    current: number | null;
    trend: number | null;
    weeklyAverage: number | null;
  };
  processingSpeed: {
    current: number | null;
    trend: number | null;
    weeklyAverage: number | null;
  };
  emotionalPatterns: {
    dominant: EmotionalState | null;
    frequency: Record<EmotionalState, number> | null;
  };
  peakCognitionTime: 'morning' | 'afternoon' | 'evening' | null;
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
  hasCompletedOnboarding: boolean; // CRITICAL: Must be true after onboarding, false initially
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

export interface SharedHealthEntry {
  id: string;
  healthEntry: HealthEntry;
  fromUsername: string;
  fromName: string;
  toUsername?: string; // Username of recipient (for sent entries)
  timestamp: Date;
  read: boolean;
}

// Talk Feature Types
export interface TalkMessage {
  id: string;
  role: 'sage' | 'user';
  content: string;
  timestamp: Date;
  spoken?: boolean; // Whether this was spoken via TTS
}

export interface TalkSession {
  id: string;
  timestamp: Date;
  messages: TalkMessage[];
  transcript: string; // Full conversation transcript
  cliScore: number | null; // Cognitive Linguistic Index (0-100, never shown to user)
  cliBreakdown: {
    lexicalAccess: number; // 0-100
    fluency: number; // 0-100
    syntacticComplexity: number; // 0-100
    coherence: number; // 0-100
    processingSpeed: number; // 0-100
    attention: number; // 0-100
  } | null;
  status: 'active' | 'completed';
  duration: number; // seconds
}

// Health Card Types (for passive health extraction)
export type HealthCategory = 'pain' | 'sleep' | 'mood' | 'energy' | 'appetite' | 'mobility' | 'medication' | 'symptom';

export interface HealthCard {
  id: string;
  date: Date;
  category: HealthCategory;
  description: string; // User's own words when possible
  severity: 'low' | 'moderate' | 'high';
  confidence: 'explicit' | 'inferred'; // Whether user explicitly mentioned or we inferred
  sourceSessionId?: string; // Which talk session this came from
  confirmed: boolean; // Whether user confirmed we can remember this
}