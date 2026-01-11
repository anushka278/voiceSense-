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
  TimelineEvent,
  HealthEntry,
  MedicalJournal,
  SharedHealthEntry
} from '@/types';
import { calculateCognitiveProfile } from '@/lib/cognitiveProfileCalculator';

interface AppState {
  // Authentication state
  isAuthenticated: boolean;
  currentUserId: string | null;
  
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
  activeTab: 'home' | 'games' | 'family' | 'insights' | 'biography' | 'timeline' | 'health' | 'settings' | 'speak';
  isDarkMode: boolean;
  
  // Biography feature
  memorySessions: MemorySession[];
  biography: Biography | null;
  
  // Health Scribe feature
  medicalJournal: MedicalJournal | null;
  isHealthMode: boolean;
  receivedHealthEntries: SharedHealthEntry[];
  sentHealthEntries: SharedHealthEntry[];
  
  // Actions
  login: (username: string, password: string) => boolean;
  signUp: (username: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
  completeOnboarding: (name: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentTranscript: (transcript: string) => void;
  setCurrentEmotionalState: (state: EmotionalState) => void;
  addSpeechAnalysis: (analysis: SpeechAnalysis) => void;
  addGameResult: (result: CognitiveGameResult) => void;
  addInsight: (insight: Insight) => void;
  markInsightsRead: () => void;
  setActiveTab: (tab: 'home' | 'games' | 'family' | 'insights' | 'biography' | 'timeline' | 'health' | 'settings' | 'speak') => void;
  toggleDarkMode: () => void;
  updateConversationSettings: (settings: Partial<ConversationSettings>) => void;
  addFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (memberId: string) => void;
  addFamilyMemory: (memberId: string, memory: FamilyMemory) => void;
  // Biography actions
  addMemorySession: (session: MemorySession) => void;
  updateMemorySession: (sessionId: string, updates: Partial<MemorySession>) => void;
  addBiographyEntry: (entry: BiographyEntry) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  setBiography: (biography: Biography) => void;
  // Health actions
  addHealthEntry: (entry: HealthEntry) => void;
  setMedicalJournal: (journal: MedicalJournal) => void;
  setIsHealthMode: (isHealthMode: boolean) => void;
  shareHealthEntryToFamily: (entry: HealthEntry, memberUsername: string) => void;
  markSharedHealthEntryRead: (entryId: string) => void;
  reset: () => void;
}

const generateInitialUser = (username: string): User => ({
  id: crypto.randomUUID(),
  name: username, // Use username as name initially
  preferredName: username, // Use username as preferred name
  familyMembers: [],
  cognitiveProfile: {
    userId: crypto.randomUUID(),
    lastUpdated: new Date(),
    overallTrend: null,
    languageComplexity: { current: null, trend: null, weeklyAverage: null },
    memoryRecall: { current: null, trend: null, weeklyAverage: null },
    attention: { current: null, trend: null, weeklyAverage: null },
    processingSpeed: { current: null, trend: null, weeklyAverage: null },
    emotionalPatterns: {
      dominant: null,
      frequency: null
    },
    peakCognitionTime: null,
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
      isAuthenticated: false,
      currentUserId: null,
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
      isDarkMode: false,
      memorySessions: [],
      biography: null,
      medicalJournal: null,
      isHealthMode: false,

      // Actions
      login: (username, password) => {
        // Login only - does not create accounts
        try {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          const normalizedUsername = username.trim().toLowerCase();
          
          // Check if user exists and password matches
          if (storedUsers[normalizedUsername] && storedUsers[normalizedUsername].password === password) {
            const userData = storedUsers[normalizedUsername];
            
            // For login users, always skip onboarding - only new signups need to see it
            const updatedState = {
              isAuthenticated: true, 
              currentUserId: normalizedUsername,
              user: userData.user || null,
              isOnboarded: userData.isOnboarded !== undefined ? userData.isOnboarded : true, // Use stored isOnboarded or default to true
              speechAnalyses: userData.speechAnalyses || [],
              gameResults: userData.gameResults || [],
              insights: userData.insights || [],
              memorySessions: userData.memorySessions || [],
              biography: userData.biography || null,
              medicalJournal: userData.medicalJournal || null,
              receivedHealthEntries: userData.receivedHealthEntries || [],
              sentHealthEntries: userData.sentHealthEntries || []
            };
            
            // Set the state directly - this will also update persist storage
            set(updatedState);
            
            // Save user data to localStorage immediately
            try {
              storedUsers[normalizedUsername] = {
                ...storedUsers[normalizedUsername],
                password: storedUsers[normalizedUsername].password,
                user: updatedState.user,
                isOnboarded: true, // Mark as onboarded for returning users
                speechAnalyses: updatedState.speechAnalyses,
                gameResults: updatedState.gameResults,
                insights: updatedState.insights,
                memorySessions: updatedState.memorySessions,
                biography: updatedState.biography,
                medicalJournal: updatedState.medicalJournal,
                receivedHealthEntries: updatedState.receivedHealthEntries,
                sentHealthEntries: updatedState.sentHealthEntries
              };
              localStorage.setItem('sage-users', JSON.stringify(storedUsers));
            } catch (e) {
              // localStorage not available, continue anyway
              console.warn('localStorage not available, data not saved');
            }
            
            return true;
          }
        } catch (e) {
          // localStorage not available or error parsing
          console.warn('localStorage error during login:', e);
        }
        
        // User doesn't exist or password doesn't match
        return false;
      },
      
      signUp: (username, password) => {
        // Sign up only - creates new account
        const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
        const normalizedUsername = username.trim().toLowerCase();
        
        // Check if username already exists
        if (storedUsers[normalizedUsername]) {
          return false; // Username already taken
        }
        
        // Create new account
        const newUser = generateInitialUser(normalizedUsername);
        storedUsers[normalizedUsername] = {
          password: password,
          user: newUser,
          isOnboarded: false,
          speechAnalyses: [],
          gameResults: [],
          insights: [],
          memorySessions: [],
          biography: null,
          medicalJournal: null,
          receivedHealthEntries: [],
          sentHealthEntries: []
        };
        localStorage.setItem('sage-users', JSON.stringify(storedUsers));
        set({ 
          isAuthenticated: true, 
          currentUserId: normalizedUsername,
          user: newUser,
          isOnboarded: false,
          receivedHealthEntries: [],
          sentHealthEntries: []
        });
        return true;
      },
      
      logout: () => set((state) => {
        // Save current user data before logging out
        if (state.currentUserId) {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          storedUsers[state.currentUserId] = {
            ...storedUsers[state.currentUserId],
            password: storedUsers[state.currentUserId]?.password || '',
            user: state.user,
            isOnboarded: state.isOnboarded,
            speechAnalyses: state.speechAnalyses,
            gameResults: state.gameResults,
            insights: state.insights,
            memorySessions: state.memorySessions,
            biography: state.biography,
            medicalJournal: state.medicalJournal
          };
          localStorage.setItem('sage-users', JSON.stringify(storedUsers));
        }
        
        return { 
          isAuthenticated: false, 
          currentUserId: null,
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
        };
      }),
      
      setUser: (user) => set({ user }),
      
      completeOnboarding: (name) => {
        const state = useStore.getState();
        // Use current username if available, otherwise use the provided name
        const usernameToUse = state.currentUserId || name;
        const newUser = generateInitialUser(usernameToUse);
        // Update name and preferredName with the provided name from onboarding
        newUser.name = name;
        newUser.preferredName = name.split(' ')[0];
        
        let finalUser = newUser;
        
        // If there's existing data, calculate profile from it
        if (state.speechAnalyses.length > 0 || state.gameResults.length > 0) {
          const calculatedProfile = calculateCognitiveProfile(
            state.speechAnalyses,
            state.gameResults,
            newUser.cognitiveProfile
          );
          finalUser = { ...newUser, cognitiveProfile: calculatedProfile };
        }
        
        // Update state
        set({
          user: finalUser,
          isOnboarded: true
        });
        
        // Immediately save to localStorage
        if (state.currentUserId) {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          storedUsers[state.currentUserId] = {
            ...storedUsers[state.currentUserId],
            user: finalUser,
            isOnboarded: true,
            speechAnalyses: state.speechAnalyses,
            gameResults: state.gameResults,
            insights: state.insights,
            memorySessions: state.memorySessions,
            biography: state.biography,
            medicalJournal: state.medicalJournal
          };
          localStorage.setItem('sage-users', JSON.stringify(storedUsers));
        }
      },
      
      setIsRecording: (isRecording) => set({ isRecording }),
      
      setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),
      
      setCurrentEmotionalState: (state) => set({ currentEmotionalState: state }),
      
      addSpeechAnalysis: (analysis) => set((state) => {
        const newAnalyses = [...state.speechAnalyses, analysis];
        const updatedProfile = state.user 
          ? calculateCognitiveProfile(newAnalyses, state.gameResults, state.user.cognitiveProfile)
          : undefined;
        return {
          speechAnalyses: newAnalyses,
          user: state.user && updatedProfile
            ? { ...state.user, cognitiveProfile: updatedProfile }
            : state.user
        };
      }),
      
      addGameResult: (result) => set((state) => {
        const newResults = [...state.gameResults, result];
        const updatedProfile = state.user
          ? calculateCognitiveProfile(state.speechAnalyses, newResults, state.user.cognitiveProfile)
          : undefined;
        return {
          gameResults: newResults,
          user: state.user && updatedProfile
            ? { ...state.user, cognitiveProfile: updatedProfile }
            : state.user
        };
      }),
      
      addInsight: (insight) => set((state) => ({
        insights: [insight, ...state.insights],
        unreadInsights: state.unreadInsights + 1
      })),
      
      markInsightsRead: () => set({ unreadInsights: 0 }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      toggleDarkMode: () => set((state) => ({ 
        isDarkMode: !state.isDarkMode 
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
            timelineEvents: [],
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
      
      addTimelineEvent: (event) => set((state) => {
        // Helper to ensure date is a Date object (handles localStorage string serialization)
        const toDate = (d: Date | string): Date => d instanceof Date ? d : new Date(d);
        
        if (!state.biography) {
          const newBiography: Biography = {
            id: crypto.randomUUID(),
            userId: state.user?.id || '',
            title: `${state.user?.preferredName || 'User'}'s Life Story`,
            entries: [],
            timelineEvents: [event],
            lastUpdated: new Date(),
            isComplete: false
          };
          return { biography: newBiography };
        }
        return {
          biography: {
            ...state.biography,
            timelineEvents: [...state.biography.timelineEvents, event].sort((a, b) => 
              toDate(a.date).getTime() - toDate(b.date).getTime()
            ),
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
      
      shareHealthEntryToFamily: (entry, memberUsername) => {
        try {
          const state = useStore.getState();
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          const normalizedMemberUsername = memberUsername.trim().toLowerCase();
          
          // Check if the family member's account exists
          if (!storedUsers[normalizedMemberUsername]) {
            alert('Family member account not found. Please check the username.');
            return;
          }
          
          // Get current user info
          const currentUserName = state.currentUserId || '';
          const currentUserData = storedUsers[currentUserName];
          const currentUserNameDisplay = currentUserData?.user?.preferredName || currentUserData?.user?.name || currentUserName;
          
          // Create shared entry for recipient
          const receivedEntry: SharedHealthEntry = {
            id: crypto.randomUUID(),
            healthEntry: entry,
            fromUsername: currentUserName,
            fromName: currentUserNameDisplay,
            timestamp: new Date(),
            read: false
          };
          
          // Create shared entry for sender (with recipient info)
          const sentEntry: SharedHealthEntry = {
            ...receivedEntry,
            id: crypto.randomUUID(), // Different ID for sent entry
            toUsername: normalizedMemberUsername
          };
          
          // Add to the family member's received entries
          const memberData = storedUsers[normalizedMemberUsername];
          const memberReceivedEntries = memberData.receivedHealthEntries || [];
          memberData.receivedHealthEntries = [...memberReceivedEntries, receivedEntry];
          
          // Add to current user's sent entries
          const currentUserSentEntries = currentUserData.sentHealthEntries || [];
          currentUserData.sentHealthEntries = [...currentUserSentEntries, sentEntry];
          
          // Save to localStorage
          storedUsers[normalizedMemberUsername] = memberData;
          storedUsers[currentUserName] = currentUserData;
          localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          
          // Update state if users are currently logged in
          if (state.currentUserId === normalizedMemberUsername) {
            set({ receivedHealthEntries: memberData.receivedHealthEntries || [] });
          }
          set({ sentHealthEntries: currentUserData.sentHealthEntries || [] });
        } catch (e) {
          console.error('Error sharing health entry:', e);
          alert('Failed to share health entry. Please try again.');
        }
      },
      
      markSharedHealthEntryRead: (entryId) => {
        try {
          const state = useStore.getState();
          const currentUserId = state.currentUserId;
          if (!currentUserId) return;
          
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          const userData = storedUsers[currentUserId];
          
          if (userData && userData.receivedHealthEntries) {
            userData.receivedHealthEntries = userData.receivedHealthEntries.map((entry: SharedHealthEntry) =>
              entry.id === entryId ? { ...entry, read: true } : entry
            );
            
            storedUsers[currentUserId] = userData;
            localStorage.setItem('sage-users', JSON.stringify(storedUsers));
            
            set({ receivedHealthEntries: userData.receivedHealthEntries });
          }
        } catch (e) {
          console.error('Error marking entry as read:', e);
        }
      },
      
      reset: () => set({
        isAuthenticated: false,
        currentUserId: null,
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
        isDarkMode: false,
        memorySessions: [],
        biography: null,
        medicalJournal: null,
        isHealthMode: false,
        receivedHealthEntries: []
      })
    }),
    {
      name: 'sage-storage',
      partialize: (state) => ({
        // Only persist minimal auth state - user data is stored in sage-users
        isAuthenticated: state.isAuthenticated,
        currentUserId: state.currentUserId,
        isOnboarded: state.isOnboarded
        // User data should always be loaded from sage-users, not from persist storage
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, if user is authenticated, load their actual data from sage-users
        // This ensures we use the correct isOnboarded status
        if (state?.isAuthenticated && state.currentUserId) {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          const userData = storedUsers[state.currentUserId];
          if (userData) {
            // Override rehydrated state with actual user data from storage
            // Always use userData from localStorage, never from rehydrated state
            useStore.setState({
              user: userData.user || null,
              isOnboarded: userData.isOnboarded === true ? true : false,
              speechAnalyses: userData.speechAnalyses || [],
              gameResults: userData.gameResults || [],
              insights: userData.insights || [],
              memorySessions: userData.memorySessions || [],
              biography: userData.biography || null,
              medicalJournal: userData.medicalJournal || null,
              receivedHealthEntries: userData.receivedHealthEntries || [],
              sentHealthEntries: userData.sentHealthEntries || []
            });
          }
        }
      }
    }
  )
);

