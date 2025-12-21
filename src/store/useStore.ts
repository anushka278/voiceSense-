import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  SpeechAnalysis, 
  CognitiveGameResult, 
  Insight,
  EmotionalState,
  FamilyMember,
  FamilyMemory,
  ConversationSettings,
  MemorySession,
  Biography,
  BiographyEntry,
  HealthEntry,
  MedicalJournal
} from '@/types';

interface AppState {
  // User state
  user: User | null;
  isOnboarded: boolean;
  
  // Current session
  isRecording: boolean;
  currentTranscript: string;
  currentEmotionalState: EmotionalState;
  
  // Speech analysis history
  speechAnalyses: SpeechAnalysis[];
  
  // Game results
  gameResults: CognitiveGameResult[];
  
  // Insights
  insights: Insight[];
  unreadInsights: number;
  
  // UI state
  activeTab: 'home' | 'speak' | 'games' | 'family' | 'insights' | 'biography' | 'health';
  isCalmingMode: boolean;
  
  // Biography feature
  memorySessions: MemorySession[];
  biography: Biography | null;
  
  // Health Scribe feature
  medicalJournal: MedicalJournal | null;
  isHealthMode: boolean;
  
  // Actions
  setUser: (user: User) => void;
  completeOnboarding: (name: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentTranscript: (transcript: string) => void;
  setCurrentEmotionalState: (state: EmotionalState) => void;
  addSpeechAnalysis: (analysis: SpeechAnalysis) => void;
  addGameResult: (result: CognitiveGameResult) => void;
  addInsight: (insight: Insight) => void;
  markInsightsRead: () => void;
  setActiveTab: (tab: 'home' | 'speak' | 'games' | 'family' | 'insights' | 'biography' | 'health') => void;
  toggleCalmingMode: () => void;
  updateConversationSettings: (settings: Partial<ConversationSettings>) => void;
  addFamilyMember: (member: FamilyMember) => void;
  addFamilyMemory: (memberId: string, memory: FamilyMemory) => void;
  // Biography actions
  addMemorySession: (session: MemorySession) => void;
  updateMemorySession: (sessionId: string, updates: Partial<MemorySession>) => void;
  addBiographyEntry: (entry: BiographyEntry) => void;
  setBiography: (biography: Biography) => void;
  // Health actions
  addHealthEntry: (entry: HealthEntry) => void;
  setMedicalJournal: (journal: MedicalJournal) => void;
  setIsHealthMode: (isHealthMode: boolean) => void;
  reset: () => void;
}

const generateInitialUser = (name: string): User => ({
  id: crypto.randomUUID(),
  name,
  preferredName: name.split(' ')[0],
  familyMembers: [],
  cognitiveProfile: {
    userId: crypto.randomUUID(),
    lastUpdated: new Date(),
    overallTrend: 'stable',
    languageComplexity: { current: 75, trend: 0, weeklyAverage: 75 },
    memoryRecall: { current: 72, trend: 2, weeklyAverage: 71 },
    attention: { current: 78, trend: 1, weeklyAverage: 77 },
    processingSpeed: { current: 70, trend: -1, weeklyAverage: 71 },
    emotionalPatterns: {
      dominant: 'calm',
      frequency: { calm: 45, happy: 25, anxious: 10, sad: 8, agitated: 5, neutral: 7 }
    },
    peakCognitionTime: 'morning',
    recentInsights: []
  },
  conversationSettings: {
    speechRate: 'normal',
    sentenceComplexity: 'moderate',
    usesFamiliarNames: true,
    repetitionEnabled: true,
    calmingModeActive: false
  },
  createdAt: new Date()
});

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isOnboarded: false,
      isRecording: false,
      currentTranscript: '',
      currentEmotionalState: 'neutral',
      speechAnalyses: [],
      gameResults: [],
      insights: [],
      unreadInsights: 0,
      activeTab: 'home',
      isCalmingMode: false,
      memorySessions: [],
      biography: null,
      medicalJournal: null,
      isHealthMode: false,

      // Actions
      setUser: (user) => set({ user }),
      
      completeOnboarding: (name) => set({
        user: generateInitialUser(name),
        isOnboarded: true
      }),
      
      setIsRecording: (isRecording) => set({ isRecording }),
      
      setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),
      
      setCurrentEmotionalState: (state) => set({ currentEmotionalState: state }),
      
      addSpeechAnalysis: (analysis) => set((state) => ({
        speechAnalyses: [...state.speechAnalyses, analysis]
      })),
      
      addGameResult: (result) => set((state) => ({
        gameResults: [...state.gameResults, result]
      })),
      
      addInsight: (insight) => set((state) => ({
        insights: [insight, ...state.insights],
        unreadInsights: state.unreadInsights + 1
      })),
      
      markInsightsRead: () => set({ unreadInsights: 0 }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      toggleCalmingMode: () => set((state) => ({ 
        isCalmingMode: !state.isCalmingMode 
      })),
      
      updateConversationSettings: (settings) => set((state) => ({
        user: state.user ? {
          ...state.user,
          conversationSettings: { ...state.user.conversationSettings, ...settings }
        } : null
      })),
      
      addFamilyMember: (member) => set((state) => ({
        user: state.user ? {
          ...state.user,
          familyMembers: [...state.user.familyMembers, member]
        } : null
      })),
      
      addFamilyMemory: (memberId, memory) => set((state) => ({
        user: state.user ? {
          ...state.user,
          familyMembers: state.user.familyMembers.map(m => 
            m.id === memberId 
              ? { ...m, memories: [...m.memories, memory] }
              : m
          )
        } : null
      })),
      
      // Biography actions
      addMemorySession: (session) => set((state) => ({
        memorySessions: [...state.memorySessions, session]
      })),
      
      updateMemorySession: (sessionId, updates) => set((state) => ({
        memorySessions: state.memorySessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        )
      })),
      
      addBiographyEntry: (entry) => set((state) => {
        if (!state.biography) {
          const newBiography: Biography = {
            id: crypto.randomUUID(),
            userId: state.user?.id || '',
            title: `${state.user?.preferredName || 'User'}'s Life Story`,
            entries: [entry],
            lastUpdated: new Date(),
            isComplete: false
          };
          return { biography: newBiography };
        }
        return {
          biography: {
            ...state.biography,
            entries: [...state.biography.entries, entry],
            lastUpdated: new Date()
          }
        };
      }),
      
      setBiography: (biography) => set({ biography }),
      
      // Health actions
      addHealthEntry: (entry) => set((state) => {
        if (!state.medicalJournal) {
          const newJournal: MedicalJournal = {
            id: crypto.randomUUID(),
            userId: state.user?.id || '',
            entries: [entry],
            lastUpdated: new Date(),
            summary: {
              recentSymptoms: [],
              medicationCompliance: 100,
              painTrend: 'stable',
              lastDoctorVisit: undefined
            }
          };
          return { medicalJournal: newJournal };
        }
        return {
          medicalJournal: {
            ...state.medicalJournal,
            entries: [...state.medicalJournal.entries, entry],
            lastUpdated: new Date()
          }
        };
      }),
      
      setMedicalJournal: (journal) => set({ medicalJournal: journal }),
      
      setIsHealthMode: (isHealthMode) => set({ isHealthMode }),
      
      reset: () => set({
        user: null,
        isOnboarded: false,
        isRecording: false,
        currentTranscript: '',
        currentEmotionalState: 'neutral',
        speechAnalyses: [],
        gameResults: [],
        insights: [],
        unreadInsights: 0,
        activeTab: 'home',
        isCalmingMode: false,
        memorySessions: [],
        biography: null,
        medicalJournal: null,
        isHealthMode: false
      })
    }),
    {
      name: 'voicesense-storage',
      partialize: (state) => ({
        user: state.user,
        isOnboarded: state.isOnboarded,
        speechAnalyses: state.speechAnalyses,
        gameResults: state.gameResults,
        insights: state.insights,
        memorySessions: state.memorySessions,
        biography: state.biography,
        medicalJournal: state.medicalJournal
      })
    }
  )
);

