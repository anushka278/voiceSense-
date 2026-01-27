import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  SpeechAnalysis, 
  CognitiveGameResult, 
  Insight,
  EmotionalState,
  FamilyMember,
  FamilyRequest,
  FamilyMessage,
  ConversationSettings,
  MemorySession,
  Biography,
  BiographyEntry,
  HealthEntry,
  MedicalJournal,
  SharedHealthEntry,
  TalkSession,
  HealthCard
} from '@/types';
import { calculateCognitiveProfile } from '@/lib/cognitiveProfileCalculator';
import { 
  userService, 
  talkSessionService, 
  healthCardService, 
  speechAnalysisService, 
  gameResultService, 
  insightService, 
  familyRequestService,
  memorySessionService
} from '@/lib/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabaseHelper';
import { supabase } from '@/lib/supabase';

interface AppState {
  // Authentication state
  isAuthenticated: boolean;
  currentUserId: string | null;
  
  // User state
  user: User | null;
  // REMOVED: isOnboarded - now using user.hasCompletedOnboarding instead
  
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
  activeTab: 'home' | 'games' | 'family' | 'insights' | 'settings' | 'talk';
  isDarkMode: boolean;
  
  // Talk feature
  talkSessions: TalkSession[];
  healthCards: HealthCard[];
  
  // Family requests
  familyRequests: FamilyRequest[];
  
  // Memory sessions (for biography capture and speak sessions)
  memorySessions: MemorySession[];
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
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
  setActiveTab: (tab: 'home' | 'games' | 'family' | 'insights' | 'settings' | 'talk') => void;
  toggleDarkMode: () => void;
  updateConversationSettings: (settings: Partial<ConversationSettings>) => void;
  requestFamilyConnection: (username: string, name: string, relationship: string) => void;
  acceptFamilyRequest: (requestId: string) => void;
  rejectFamilyRequest: (requestId: string) => void;
  removeFamilyMember: (memberId: string) => void;
  sendFamilyMessage: (toUsername: string, content: string) => void;
  markFamilyMessageRead: (messageId: string) => void;
  // Talk actions
  addTalkSession: (session: TalkSession) => void;
  addHealthCard: (card: HealthCard) => void;
  confirmHealthCard: (cardId: string) => void;
  addMemorySession: (session: MemorySession) => void;
  reset: () => void;
  clearAllAccounts: () => void;
  deleteAllAccounts: () => Promise<void>;
}

const generateInitialUser = (username: string): User => ({
  id: crypto.randomUUID(),
  name: username, // Temporary - will be set during onboarding
  preferredName: '', // CRITICAL: Must be empty initially, set during onboarding
  hasCompletedOnboarding: false, // CRITICAL: Must be false for new users
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
      isRecording: false,
      currentTranscript: '',
      currentEmotionalState: 'neutral',
      speechAnalyses: [],
      gameResults: [],
      insights: [],
      unreadInsights: 0,
      activeTab: 'home',
      isDarkMode: false,
      talkSessions: [],
      healthCards: [],
      familyRequests: [],
      memorySessions: [],

      // Actions
      login: async (username, password) => {
        // Login only - does not create accounts
          const normalizedUsername = username.trim().toLowerCase();
        
        // Validate input
        if (!normalizedUsername || !password) {
          return false;
        }

        // Try Supabase first if configured
        if (isSupabaseConfigured()) {
          try {
            const user = await userService.login(normalizedUsername, password);
            if (!user) {
              return false;
            }

            // Load all user data from Supabase
            const [talkSessions, healthCards, speechAnalysesData, gameResultsData, insightsData, familyRequests, memorySessions] = await Promise.all([
              talkSessionService.findByUserId(user.id),
              healthCardService.findByUserId(user.id),
              speechAnalysisService.findByUserId(user.id).catch(() => []),
              gameResultService.findByUserId(user.id).catch(() => []),
              insightService.findByUserId(user.id).catch(() => []),
              familyRequestService.findByUserId(user.id).catch(() => []),
              memorySessionService.findByUserId(user.id).catch(() => [])
            ]);

            // Convert simplified Supabase data to full types (with defaults for missing fields)
            const speechAnalyses: SpeechAnalysis[] = speechAnalysesData.map((sa: any) => ({
              id: sa.id,
              timestamp: sa.timestamp,
              duration: sa.duration || 0,
              transcript: sa.transcript,
              metrics: sa.metrics || {
                sentenceLength: sa.avg_sentence_length || 0,
                vocabularyComplexity: sa.language_complexity || 0,
                grammarConsistency: 0,
                repetitionCount: 0,
                pauseFrequency: 0,
                speechRate: 0,
                fleschKincaidGrade: 0
              },
              emotionalState: sa.emotional_state || 'neutral',
              timeOfDay: 'morning' // Default, could be calculated from timestamp
            }));

            const gameResults: CognitiveGameResult[] = gameResultsData.map((gr: any) => ({
              id: gr.id,
              gameType: gr.game_type,
              timestamp: gr.timestamp,
              accuracy: gr.accuracy,
              responseTime: gr.time_taken || 0,
              repetitionsNeeded: 0,
              frustrationDetected: false,
              completed: true
            }));

            const insights: Insight[] = insightsData.map((ins: any) => ({
              id: ins.id,
              timestamp: ins.timestamp,
              type: ins.type,
              title: ins.title,
              description: ins.description,
              severity: 'info' as const // Default severity
            }));

            // Convert Supabase user to app User format
            const initialUser = generateInitialUser(user.name);
            const appUser: User = {
              id: user.id,
              name: user.name,
              preferredName: user.preferred_name || '', // CRITICAL: Must have preferredName
              hasCompletedOnboarding: user.is_onboarded || false, // Map from Supabase field
              familyMembers: user.family_members || [],
              cognitiveProfile: user.cognitive_profile || initialUser.cognitiveProfile,
              conversationSettings: initialUser.conversationSettings,
              createdAt: new Date(user.created_at)
            };

            // CRITICAL: Validate preferredName exists for onboarded users
            if (appUser.hasCompletedOnboarding && !appUser.preferredName) {
              console.error('❌ CRITICAL: User has completed onboarding but preferredName is missing!');
              // This is a blocking error - user should not be able to proceed
            }

            set({
              isAuthenticated: true,
              currentUserId: user.id,
              user: appUser,
              talkSessions,
              healthCards,
              speechAnalyses,
              gameResults,
              insights,
              familyRequests,
              memorySessions,
              unreadInsights: 0 // Will be calculated from insights if needed
            });

            return true;
          } catch (error) {
            console.error('Supabase login error:', error);
            // Fall through to localStorage fallback
          }
        }

        // Fallback to localStorage
        try {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          
          // Check if user exists and password matches
          if (storedUsers[normalizedUsername] && storedUsers[normalizedUsername].password === password) {
            const userData = storedUsers[normalizedUsername];
            
            // If user data is missing or invalid, repair it
            if (!userData || !userData.user || typeof userData.user !== 'object') {
              console.warn('User data missing or invalid for:', normalizedUsername, '- repairing...');
              
              // Create a new user object - CRITICAL: Check if user had completed onboarding
              const existingHasCompletedOnboarding = userData?.user?.hasCompletedOnboarding ?? 
                                                      (userData?.isOnboarded === true); // Legacy support
              const existingPreferredName = userData?.user?.preferredName || '';
              const existingName = userData?.user?.name || normalizedUsername;
              
              const repairedUser: User = {
                ...generateInitialUser(existingName),
                name: existingName,
                preferredName: existingPreferredName,
                hasCompletedOnboarding: existingHasCompletedOnboarding
              };
              
              // Repair the user data
              storedUsers[normalizedUsername] = {
                password: userData?.password || password,
                user: repairedUser,
                speechAnalyses: userData?.speechAnalyses || [],
                gameResults: userData?.gameResults || [],
                insights: userData?.insights || [],
                talkSessions: userData?.talkSessions || [],
                healthCards: userData?.healthCards || [],
                familyRequests: userData?.familyRequests || [],
                memorySessions: userData?.memorySessions || []
              };
              
              // Save repaired data
              localStorage.setItem('sage-users', JSON.stringify(storedUsers));
              
              // Use the repaired data
              const repairedData = storedUsers[normalizedUsername];
              
              // Clear any stale persist data first
              try {
                const persistData = JSON.parse(localStorage.getItem('sage-storage') || '{}');
                if (persistData.state && persistData.state.currentUserId !== normalizedUsername) {
                  // Clear stale data
                  localStorage.setItem('sage-storage', JSON.stringify({
                    state: {
                      isAuthenticated: false,
                      currentUserId: null
                    }
                  }));
                }
              } catch (e) {
                // Ignore errors clearing persist data
              }
              
              // Set state with repaired data
              set({
              isAuthenticated: true, 
              currentUserId: normalizedUsername,
                user: repairedData.user,
                speechAnalyses: repairedData.speechAnalyses || [],
                gameResults: repairedData.gameResults || [],
                insights: repairedData.insights || [],
                talkSessions: repairedData.talkSessions || [],
                healthCards: repairedData.healthCards || [],
                familyRequests: repairedData.familyRequests || [],
                memorySessions: repairedData.memorySessions || []
              });
              
              return true;
            }
            
            // User data is valid, proceed with normal login
            
            // Clear any stale persist data first
            try {
              const persistData = JSON.parse(localStorage.getItem('sage-storage') || '{}');
              if (persistData.state && persistData.state.currentUserId !== normalizedUsername) {
                // Clear stale data
                localStorage.setItem('sage-storage', JSON.stringify({
                  state: {
                    isAuthenticated: false,
                    currentUserId: null
                  }
                }));
              }
            } catch (e) {
              // Ignore errors clearing persist data
            }
            
            // CRITICAL: Ensure user has hasCompletedOnboarding field (migrate from legacy isOnboarded)
            let userToUse = userData.user;
            if (userToUse.hasCompletedOnboarding === undefined) {
              // Legacy migration: convert isOnboarded to hasCompletedOnboarding
              const legacyIsOnboarded = userData.isOnboarded !== undefined ? userData.isOnboarded : true;
              userToUse = {
                ...userToUse,
                hasCompletedOnboarding: legacyIsOnboarded
              };
              // Save the migration
              storedUsers[normalizedUsername].user = userToUse;
              localStorage.setItem('sage-users', JSON.stringify(storedUsers));
            }
            
            // CRITICAL: Validate preferredName exists for onboarded users
            if (userToUse.hasCompletedOnboarding && !userToUse.preferredName) {
              console.error('❌ CRITICAL: User has completed onboarding but preferredName is missing!', {
                userId: normalizedUsername,
                hasCompletedOnboarding: userToUse.hasCompletedOnboarding,
                preferredName: userToUse.preferredName
              });
              // This is a blocking error - but we'll allow login and let onboarding fix it
            }
            
            // Set the state directly
            set({
              isAuthenticated: true, 
              currentUserId: normalizedUsername,
              user: userToUse,
              speechAnalyses: userData.speechAnalyses || [],
              gameResults: userData.gameResults || [],
              insights: userData.insights || [],
              talkSessions: userData.talkSessions || [],
              healthCards: userData.healthCards || [],
              familyRequests: userData.familyRequests || [],
              memorySessions: userData.memorySessions || []
            });
            
            // Save user data to localStorage immediately to ensure consistency
            try {
              storedUsers[normalizedUsername] = {
                ...storedUsers[normalizedUsername],
                password: storedUsers[normalizedUsername].password,
                user: userToUse, // Save the migrated/validated user
                speechAnalyses: userData.speechAnalyses || [],
                gameResults: userData.gameResults || [],
                insights: userData.insights || [],
                talkSessions: userData.talkSessions || [],
                healthCards: userData.healthCards || [],
                familyRequests: userData.familyRequests || [],
                memorySessions: userData.memorySessions || []
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
          console.error('localStorage error during login:', e);
        }
        
        // User doesn't exist or password doesn't match
        return false;
      },
      
      signUp: async (username, password) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:430',message:'signUp called',data:{username,normalizedUsername:username.trim().toLowerCase()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Sign up only - creates new account
        const normalizedUsername = username.trim().toLowerCase();
        const displayUsername = username.trim();
        
        // Validate input
        if (!normalizedUsername || !password) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:437',message:'signUp invalid input',data:{normalizedUsername,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          console.warn('SignUp - Invalid input');
          return false;
        }

        // Try Supabase first if configured
        if (isSupabaseConfigured()) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:442',message:'Supabase configured, checking user',data:{normalizedUsername,isSupabaseConfigured:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          try {
            // Check if user already exists
            const existingUser = await userService.findByUsername(normalizedUsername);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:445',message:'findByUsername result',data:{normalizedUsername,found:!!existingUser,userId:existingUser?.id,username:existingUser?.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            if (existingUser) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:447',message:'USER EXISTS IN SUPABASE',data:{normalizedUsername,userId:existingUser.id,username:existingUser.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              console.error('SignUp - Username already exists:', normalizedUsername);
              return false;
            }

            // Create new user in Supabase
            const newUser = await userService.create(
              normalizedUsername,
              password,
              displayUsername,
              displayUsername.split(' ')[0]
            );

            // Set initial state - new users have NOT completed onboarding
            const initialUser = generateInitialUser(displayUsername);
            const appUser: User = {
              id: newUser.id,
              name: newUser.name,
              preferredName: '', // CRITICAL: Empty until onboarding is completed
              hasCompletedOnboarding: false, // CRITICAL: New users must complete onboarding
              familyMembers: newUser.family_members || [],
              cognitiveProfile: newUser.cognitive_profile || initialUser.cognitiveProfile,
              conversationSettings: initialUser.conversationSettings,
              createdAt: new Date(newUser.created_at)
            };

            set({
              isAuthenticated: true,
              currentUserId: newUser.id,
              user: appUser,
              talkSessions: [],
              healthCards: [],
              speechAnalyses: [],
              gameResults: [],
              insights: [],
              familyRequests: [],
              memorySessions: [],
              unreadInsights: 0
            });

            return true;
          } catch (error) {
            console.error('Supabase signup error:', error);
            // Fall through to localStorage fallback
          }
        }

        // Fallback to localStorage
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:493',message:'Falling back to localStorage',data:{normalizedUsername,isSupabaseConfigured:isSupabaseConfigured()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          // Force fresh read from localStorage - don't trust any cached data
          let storedUsers: Record<string, any> = {};
          try {
            const usersData = localStorage.getItem('sage-users');
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:498',message:'localStorage read',data:{normalizedUsername,hasData:!!usersData,dataLength:usersData?.length,dataPreview:usersData?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            console.log('SignUp - Raw localStorage data:', usersData);
            
            if (usersData && usersData.trim() !== '' && usersData !== '{}' && usersData !== 'null') {
              storedUsers = JSON.parse(usersData);
            } else {
              storedUsers = {};
            }
          } catch (e) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:507',message:'localStorage parse error',data:{normalizedUsername,error:e},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            console.warn('Error parsing sage-users, treating as empty:', e);
            storedUsers = {};
          }
        
        // Check if username already exists
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:511',message:'Checking localStorage for user',data:{normalizedUsername,storedUsersKeys:Object.keys(storedUsers),hasUser:!!storedUsers[normalizedUsername]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          if (storedUsers && typeof storedUsers === 'object' && Object.keys(storedUsers).length > 0) {
        if (storedUsers[normalizedUsername]) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:513',message:'USER EXISTS IN LOCALSTORAGE',data:{normalizedUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              console.error('SignUp - Username already exists:', normalizedUsername);
          return false; // Username already taken
            }
          }
          
          // Clear any stale persist data
          try {
            localStorage.setItem('sage-storage', JSON.stringify({
              state: {
                isAuthenticated: false,
                currentUserId: null,
                isOnboarded: false
              }
            }));
          } catch (e) {
            // Ignore errors
        }
        
          // Create new account - CRITICAL: hasCompletedOnboarding must be false
          const newUser = generateInitialUser(displayUsername);
          newUser.name = displayUsername;
          newUser.preferredName = ''; // CRITICAL: Empty until onboarding
          newUser.hasCompletedOnboarding = false; // CRITICAL: Must complete onboarding
          
        storedUsers[normalizedUsername] = {
          password: password,
          user: newUser,
          speechAnalyses: [],
          gameResults: [],
          insights: [],
            talkSessions: [],
            healthCards: [],
            familyRequests: [],
            memorySessions: []
          };
          localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          
          // Clear persist storage to prevent stale data
          try {
            localStorage.setItem('sage-storage', JSON.stringify({
              state: {
                isAuthenticated: false,
                currentUserId: null
              }
            }));
          } catch (e) {
            // Ignore
          }
          
        set({ 
          isAuthenticated: true, 
          currentUserId: normalizedUsername,
          user: newUser,
          speechAnalyses: [],
          gameResults: [],
          insights: [],
          talkSessions: [],
          healthCards: [],
          familyRequests: [],
          memorySessions: []
        });
        return true;
        } catch (e) {
          console.error('Error during signup:', e);
          return false;
        }
      },
      
      logout: () => {
        // CRITICAL: Save current user data before logging out (preserves hasCompletedOnboarding and preferredName)
        const state = useStore.getState();
        if (state.currentUserId && state.user) {
          try {
            const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          storedUsers[state.currentUserId] = {
            ...storedUsers[state.currentUserId],
            password: storedUsers[state.currentUserId]?.password || '',
              user: state.user, // CRITICAL: Save user with hasCompletedOnboarding and preferredName
            speechAnalyses: state.speechAnalyses,
            gameResults: state.gameResults,
            insights: state.insights,
              talkSessions: state.talkSessions,
              healthCards: state.healthCards,
              familyRequests: state.familyRequests
            };
            localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          } catch (e) {
            console.error('Error saving user data on logout:', e);
          }
        }
        
        // CRITICAL: Only clear session/auth state, NOT user data
        set({ 
          isAuthenticated: false, 
          currentUserId: null,
          user: null, // Clear from memory only
          isRecording: false,
          currentTranscript: '',
          currentEmotionalState: 'neutral',
          speechAnalyses: [],
          gameResults: [],
          insights: [],
          unreadInsights: 0,
          activeTab: 'home',
          talkSessions: [],
          healthCards: [],
          familyRequests: []
        });
        
        // CRITICAL: Redirect to home page after logout
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
      
      setUser: (user) => set({ user }),
      
      completeOnboarding: (name) => {
        const trimmedName = name.trim();
        
        // CRITICAL: Validate name is not empty
        if (!trimmedName || trimmedName.length === 0) {
          console.error('❌ CRITICAL: Cannot complete onboarding with empty name!');
          return;
        }

        const preferredName = trimmedName.split(' ')[0].trim();
        
        // CRITICAL: Validate preferredName is not empty
        if (!preferredName || preferredName.length === 0) {
          console.error('❌ CRITICAL: Cannot complete onboarding - preferredName is empty!');
          return;
        }

        set((state) => {
          if (!state.currentUserId) {
            console.error('❌ CRITICAL: No currentUserId during onboarding!');
            return state;
          }

          // Get existing user or create new one
          let finalUser: User;
          if (state.user) {
            // Update existing user
            finalUser = {
              ...state.user,
              name: trimmedName,
              preferredName: preferredName,
              hasCompletedOnboarding: true // CRITICAL: Mark onboarding as complete
            };
          } else {
            // Create new user with the provided name
            const newUser = generateInitialUser(state.currentUserId);
            finalUser = {
              ...newUser,
              name: trimmedName,
              preferredName: preferredName,
              hasCompletedOnboarding: true // CRITICAL: Mark onboarding as complete
            };
          }
        
        // If there's existing data, calculate profile from it
        if (state.speechAnalyses.length > 0 || state.gameResults.length > 0) {
          const calculatedProfile = calculateCognitiveProfile(
            state.speechAnalyses,
            state.gameResults,
              finalUser.cognitiveProfile
            );
            finalUser = { ...finalUser, cognitiveProfile: calculatedProfile };
          }

          // Save to Supabase if configured (async, but don't block)
          if (isSupabaseConfigured() && state.currentUserId) {
            userService.completeOnboarding(
              state.currentUserId,
              trimmedName,
              preferredName
            ).then(() => {
              console.log('✅ Onboarding completed and saved to Supabase');
            }).catch((error) => {
              console.error('Error saving onboarding to Supabase:', error);
            });
          }

          // Save to localStorage (always, as backup)
          try {
            const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
            if (storedUsers[state.currentUserId]) {
          storedUsers[state.currentUserId] = {
            ...storedUsers[state.currentUserId],
                user: finalUser, // CRITICAL: Save user with hasCompletedOnboarding: true
                speechAnalyses: state.speechAnalyses || [],
                gameResults: state.gameResults || [],
                insights: state.insights || [],
                talkSessions: state.talkSessions || [],
                healthCards: state.healthCards || [],
                familyRequests: state.familyRequests || []
              };
              localStorage.setItem('sage-users', JSON.stringify(storedUsers));
              console.log('✅ Onboarding completed and saved to localStorage');
            }
          } catch (e) {
            console.error('❌ CRITICAL: Error saving onboarding data:', e);
          }

          // CRITICAL: Verify the save was successful
          try {
            const verifyUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
            const verifyUser = verifyUsers?.[state.currentUserId]?.user;
            if (verifyUser && (!verifyUser.hasCompletedOnboarding || !verifyUser.preferredName)) {
              console.error('❌❌❌ CRITICAL: Onboarding save verification failed!', {
                hasCompletedOnboarding: verifyUser.hasCompletedOnboarding,
                preferredName: verifyUser.preferredName
              });
            } else {
              console.log('✅ Onboarding save verified:', {
                hasCompletedOnboarding: verifyUser?.hasCompletedOnboarding,
                preferredName: verifyUser?.preferredName
              });
            }
          } catch (e) {
            console.error('Error verifying onboarding save:', e);
          }

          return {
            user: finalUser // CRITICAL: Return user with hasCompletedOnboarding: true
          };
        });
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
      
      requestFamilyConnection: (username, name, relationship) => {
        set((state) => {
          if (!state.currentUserId || !state.user) return state;
        
        const normalizedUsername = username.trim().toLowerCase();
        const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
        
        // Check if user exists
        if (!storedUsers[normalizedUsername]) {
          alert('User not found. Please check the username.');
          return state;
        }
        
        // Create request
        const request: FamilyRequest = {
          id: crypto.randomUUID(),
          fromUsername: state.currentUserId,
          fromName: state.user.name,
          toUsername: normalizedUsername,
          relationship,
          timestamp: new Date(),
          status: 'pending'
        };
        
          // Add to current user's requests (outgoing)
          const updatedRequests = [...state.familyRequests, request];
          
          // Save to target user's localStorage
          const targetUserData = storedUsers[normalizedUsername];
          const targetRequests = targetUserData.familyRequests || [];
          targetRequests.push(request);
          storedUsers[normalizedUsername] = {
            ...targetUserData,
            familyRequests: targetRequests
          };
          localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          
          return {
            familyRequests: updatedRequests
          };
        });
      },
      
      acceptFamilyRequest: (requestId) => {
        set((state) => {
          if (!state.currentUserId || !state.user) return state;
        
          const request = state.familyRequests.find(r => r.id === requestId && r.status === 'pending');
          if (!request) return state;
          
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          const fromUserData = storedUsers[request.fromUsername];
          
          if (!fromUserData) return state;
          
          // Create family member for current user
          const newMember: FamilyMember = {
            id: crypto.randomUUID(),
            name: request.fromName,
            relationship: request.relationship,
            username: request.fromUsername,
            status: 'connected',
            messages: []
          };
          
          // Create family member for the requester
          const requesterMember: FamilyMember = {
            id: crypto.randomUUID(),
            name: state.user.name,
            relationship: request.relationship,
            username: state.currentUserId,
            status: 'connected',
            messages: []
          };
          
          // Update requester's data
          fromUserData.user = {
            ...fromUserData.user,
            familyMembers: [...(fromUserData.user?.familyMembers || []), requesterMember]
          };
          fromUserData.familyRequests = (fromUserData.familyRequests || []).map((r: FamilyRequest) =>
            r.id === requestId ? { ...r, status: 'accepted' } : r
          );
          storedUsers[request.fromUsername] = fromUserData;
          localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          
          // Update current user state
          return {
        user: state.user ? {
          ...state.user,
              familyMembers: [...state.user.familyMembers, newMember]
            } : null,
            familyRequests: state.familyRequests.map(r => 
              r.id === requestId ? { ...r, status: 'accepted' } : r
            )
          };
        });
      },
      
      rejectFamilyRequest: (requestId) => {
        set((state) => ({
          familyRequests: state.familyRequests.map(r => 
            r.id === requestId ? { ...r, status: 'rejected' } : r
          )
        }));
      },
      
      removeFamilyMember: (memberId) => {
        set((state) => {
          if (!state.currentUserId) return state;
          
          const updatedUser = state.user ? {
            ...state.user,
            familyMembers: state.user.familyMembers.filter(m => m.id !== memberId)
          } : null;
          
          // Save to localStorage
          try {
            const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
            if (storedUsers[state.currentUserId]) {
              storedUsers[state.currentUserId].user = updatedUser;
              localStorage.setItem('sage-users', JSON.stringify(storedUsers));
            }
          } catch (e) {
            console.error('Error saving family member removal:', e);
          }
          
          return {
            user: updatedUser
          };
        });
      },
      
      sendFamilyMessage: (toUsername, content) => {
        set((state) => {
          if (!state.currentUserId || !state.user) return state;
        
          const normalizedToUsername = toUsername.trim().toLowerCase();
          const message: FamilyMessage = {
            id: crypto.randomUUID(),
            fromUsername: state.currentUserId,
            fromName: state.user.name,
            toUsername: normalizedToUsername,
            content,
            timestamp: new Date(),
            read: false
          };
          
          // Save to target user's localStorage
          try {
            const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
            const targetUserData = storedUsers[normalizedToUsername];
            if (targetUserData && targetUserData.user) {
              targetUserData.user.familyMembers = targetUserData.user.familyMembers.map((m: FamilyMember) =>
                m.username?.toLowerCase() === state.currentUserId?.toLowerCase()
                  ? { ...m, messages: [...m.messages, message] }
                  : m
              );
              storedUsers[normalizedToUsername] = targetUserData;
              localStorage.setItem('sage-users', JSON.stringify(storedUsers));
            }
          } catch (e) {
            console.error('Error saving family message:', e);
          }
          
          // Update current user's family member messages
          return {
        user: state.user ? {
          ...state.user,
          familyMembers: state.user.familyMembers.map(m => 
                m.username?.toLowerCase() === normalizedToUsername
                  ? { ...m, messages: [...m.messages, message] }
              : m
          )
        } : null
          };
        });
      },
      
      markFamilyMessageRead: (messageId) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            familyMembers: state.user.familyMembers.map(m => ({
              ...m,
              messages: m.messages.map(msg =>
                msg.id === messageId ? { ...msg, read: true } : msg
              )
            }))
          } : null
        }));
      },
      
      // Talk actions
      addTalkSession: (session) => set((state) => ({
        talkSessions: [...state.talkSessions, session]
      })),
      
      addHealthCard: (card) => {
        const state = useStore.getState();
        if (!state.currentUserId) {
          console.error('Cannot add health card: no currentUserId');
          return;
        }

        // Update state immediately
        set({
          healthCards: [...state.healthCards, card]
        });

        // Save to Supabase if configured (async, don't block)
        if (isSupabaseConfigured()) {
          healthCardService.create(state.currentUserId, card)
            .then(() => {
              console.log('✅ Health card saved to Supabase');
            })
            .catch((error: unknown) => {
              console.error('Error saving health card to Supabase:', error);
            });
        }

        // Save to localStorage (always, as backup)
        try {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          if (storedUsers[state.currentUserId]) {
            const existingCards = storedUsers[state.currentUserId].healthCards || [];
            storedUsers[state.currentUserId] = {
              ...storedUsers[state.currentUserId],
              healthCards: [...existingCards, card]
            };
            localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          }
        } catch (e) {
          console.error('Error saving health card to localStorage:', e);
        }
      },
      
      confirmHealthCard: (cardId) => set((state) => ({
        healthCards: state.healthCards.map(card =>
          card.id === cardId ? { ...card, confirmed: true } : card
        )
      })),
      
      addMemorySession: (session) => {
        const state = useStore.getState();
        if (!state.currentUserId) {
          console.error('Cannot add memory session: no currentUserId');
          return;
        }

        // Update state immediately
        set({
          memorySessions: [...state.memorySessions, session]
        });

        // Save to Supabase if configured (async, don't block)
        if (isSupabaseConfigured()) {
          memorySessionService.create(state.currentUserId, session)
            .then(() => {
              console.log('✅ Memory session saved to Supabase');
            })
            .catch((error) => {
              console.error('Error saving memory session to Supabase:', error as Error);
            });
        }

        // Save to localStorage (always, as backup)
        try {
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          if (storedUsers[state.currentUserId]) {
            const existingSessions = storedUsers[state.currentUserId].memorySessions || [];
            storedUsers[state.currentUserId] = {
              ...storedUsers[state.currentUserId],
              memorySessions: [...existingSessions, session]
            };
            localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          }
        } catch (e) {
          console.error('Error saving memory session to localStorage:', e);
        }
      },
      
      reset: () => set({
        isAuthenticated: false,
        currentUserId: null,
        user: null,
        isRecording: false,
        currentTranscript: '',
        currentEmotionalState: 'neutral',
        speechAnalyses: [],
        gameResults: [],
        insights: [],
        unreadInsights: 0,
        activeTab: 'home',
        isDarkMode: false,
        talkSessions: [],
        healthCards: [],
        familyRequests: [],
        memorySessions: []
      }),
      
      clearAllAccounts: () => {
        // NUCLEAR CLEAR - Remove everything
        try {
          console.log('🚨 Starting NUCLEAR CLEAR...');
          
          // Step 1: Clear all localStorage keys
          const keysToRemove = [];
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key) {
              keysToRemove.push(key);
              localStorage.removeItem(key);
            }
          }
          console.log('Step 1: Cleared', keysToRemove.length, 'localStorage keys');
          
          // Step 2: Clear all sessionStorage
          const sessionKeys = [];
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key) {
              sessionKeys.push(key);
              sessionStorage.removeItem(key);
            }
          }
          console.log('Step 2: Cleared', sessionKeys.length, 'sessionStorage keys');
          
          // Step 3: Force remove sage keys 50 times (very aggressive)
          for (let i = 0; i < 50; i++) {
            localStorage.removeItem('sage-users');
            localStorage.removeItem('sage-storage');
            sessionStorage.removeItem('sage-users');
            sessionStorage.removeItem('sage-storage');
          }
          console.log('Step 3: Force removed sage keys 50 times');
          
          // Step 4: Use clear() method as backup
          try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Step 4: Used clear() method');
          } catch (e) {
            console.warn('clear() method failed:', e);
          }
          
          // Step 5: Final verification
          const finalCheck1 = localStorage.getItem('sage-users');
          const finalCheck2 = localStorage.getItem('sage-storage');
          const finalCheck3 = sessionStorage.getItem('sage-users');
          const finalCheck4 = sessionStorage.getItem('sage-storage');
          
          console.log('Final verification:');
          console.log('  sage-users in localStorage:', !!finalCheck1);
          console.log('  sage-storage in localStorage:', !!finalCheck2);
          console.log('  sage-users in sessionStorage:', !!finalCheck3);
          console.log('  sage-storage in sessionStorage:', !!finalCheck4);
          console.log('  All localStorage keys:', Object.keys(localStorage));
          console.log('  All sessionStorage keys:', Object.keys(sessionStorage));
          
          if (!finalCheck1 && !finalCheck2 && !finalCheck3 && !finalCheck4) {
            console.log('✅✅✅ NUCLEAR CLEAR SUCCESSFUL! ✅✅✅');
          } else {
            console.error('❌❌❌ WARNING: Data still exists after clearing!');
            console.error('This may be a browser caching issue. Please:');
            console.error('1. Close ALL browser tabs');
            console.error('2. Clear browser cache (Cmd+Shift+Delete)');
            console.error('3. Restart browser');
          }
          
          console.log('✅ NUCLEAR CLEAR complete');
        } catch (e) {
          console.error('Error clearing accounts:', e);
        }
        
        // Reset state
        set({
          isAuthenticated: false,
          currentUserId: null,
          user: null,
          isRecording: false,
          currentTranscript: '',
          currentEmotionalState: 'neutral',
          speechAnalyses: [],
          gameResults: [],
          insights: [],
          unreadInsights: 0,
          activeTab: 'home',
          isDarkMode: false,
          talkSessions: [],
          healthCards: [],
          familyRequests: [],
          memorySessions: []
        });
      },
      
      deleteAllAccounts: async () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1192',message:'deleteAllAccounts called',data:{isSupabaseConfigured:isSupabaseConfigured()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.log('🗑️ Starting DELETE ALL ACCOUNTS...');
        console.warn('⚠️ NOTE: If deletion fails, you may need to add a DELETE policy in Supabase SQL Editor:');
        console.warn('   CREATE POLICY "Users can delete own data" ON users FOR DELETE USING (true);');
        
        // Step 1: Delete from Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1197',message:'Fetching all users from Supabase',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            // First, get all users
            const { data: allUsers, error: fetchError } = await supabase
              .from('users')
              .select('id,username');
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1201',message:'Fetched users from Supabase',data:{userCount:allUsers?.length,users:allUsers?.map(u=>({id:u.id,username:u.username})),fetchError:fetchError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            if (fetchError) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1204',message:'ERROR fetching users',data:{error:fetchError.message,code:fetchError.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              console.error('Error fetching users from Supabase:', fetchError);
            } else if (allUsers && allUsers.length > 0) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1207',message:'Deleting users from Supabase',data:{userCount:allUsers.length,userIds:allUsers.map(u=>u.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              // Delete each user (cascade will handle related data)
              const deletePromises = allUsers.map(async (user) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1208',message:'Attempting delete',data:{userId:user.id,username:user.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                const result = await supabase.from('users').delete().eq('id', user.id);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1210',message:'Delete result',data:{userId:user.id,username:user.username,hasError:!!result.error,error:result.error?.message,dataCount:result.data?.length,status:result.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                return result;
              });
              
              const results = await Promise.all(deletePromises);
              const errors = results.filter(r => r.error);
              
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1215',message:'Delete results summary',data:{total:results.length,errors:errors.length,errorDetails:errors.map(e=>({message:e.error?.message,code:e.error?.code})),successCount:results.filter(r=>!r.error).length,deletedCount:results.reduce((sum,r)=>sum+(r.data?.length||0),0)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              
              if (errors.length > 0) {
                console.error('Some users failed to delete:', errors);
              } else {
                console.log(`✅ All ${allUsers.length} users deleted from Supabase`);
              }
            } else {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1221',message:'No users found in Supabase',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              console.log('✅ No users found in Supabase (already empty)');
            }
          } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1225',message:'Exception deleting from Supabase',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.error('Error deleting from Supabase:', error);
          }
        }
        
        // Step 2: Clear all localStorage
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1227',message:'Clearing localStorage',data:{beforeSageUsers:localStorage.getItem('sage-users')?.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          localStorage.clear();
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1230',message:'localStorage cleared',data:{afterSageUsers:localStorage.getItem('sage-users')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          console.log('✅ localStorage cleared');
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1232',message:'localStorage clear error',data:{error:e},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          console.error('Error clearing localStorage:', e);
        }
        
        // Step 3: Clear all sessionStorage
        try {
          sessionStorage.clear();
          console.log('✅ sessionStorage cleared');
        } catch (e) {
          console.error('Error clearing sessionStorage:', e);
        }
        
        // Step 4: Verify deletion by checking Supabase again
        if (isSupabaseConfigured()) {
          try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1243',message:'Verifying deletion - checking Supabase',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            const { data: verifyUsers } = await supabase
              .from('users')
              .select('id,username');
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1247',message:'Verification result',data:{remainingUsers:verifyUsers?.length,usernames:verifyUsers?.map(u=>u.username)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            if (verifyUsers && verifyUsers.length > 0) {
              console.error('❌ WARNING: Users still exist after deletion:', verifyUsers.map(u => u.username));
            } else {
              console.log('✅ Verification: No users remain in Supabase');
            }
          } catch (e) {
            console.warn('Could not verify deletion:', e);
          }
        }
        
        // Step 5: Reset state
        set({
        isAuthenticated: false,
        currentUserId: null,
        user: null,
        isRecording: false,
        currentTranscript: '',
        currentEmotionalState: 'neutral',
        speechAnalyses: [],
        gameResults: [],
        insights: [],
        unreadInsights: 0,
        activeTab: 'home',
        isDarkMode: false,
        talkSessions: [],
        healthCards: [],
        familyRequests: [],
        memorySessions: []
        });
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStore.ts:1270',message:'deleteAllAccounts completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.log('✅✅✅ ALL ACCOUNTS DELETED ✅✅✅');
        
        // Redirect to home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
      
      debugStorage: () => {
        // Debug function to see what's actually in storage
        console.log('=== STORAGE DEBUG ===');
        console.log('localStorage length:', localStorage.length);
        console.log('sessionStorage length:', sessionStorage.length);
        
        const allLocalKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            allLocalKeys.push(key);
            if (key.includes('sage') || key.includes('user')) {
              console.log('Found key:', key, '=', localStorage.getItem(key)?.substring(0, 100));
            }
          }
        }
        console.log('All localStorage keys:', allLocalKeys);
        
        const sageUsers = localStorage.getItem('sage-users');
        const sageStorage = localStorage.getItem('sage-storage');
        
        console.log('sage-users exists?', !!sageUsers);
        console.log('sage-storage exists?', !!sageStorage);
        
        if (sageUsers) {
          try {
            const parsed = JSON.parse(sageUsers);
            console.log('sage-users content:', Object.keys(parsed));
            console.log('sage-users full:', parsed);
          } catch (e) {
            console.error('Error parsing sage-users:', e);
          }
        }
        
        console.log('=== END DEBUG ===');
      }
    }),
    {
      name: 'sage-storage',
      partialize: (state) => ({
        // Only persist minimal auth state - user data is stored in sage-users
        isAuthenticated: state.isAuthenticated,
        currentUserId: state.currentUserId
        // CRITICAL: User data (including hasCompletedOnboarding) should always be loaded from sage-users, not from persist storage
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // After rehydration, if user is authenticated, load their actual data from sage-users
          // This ensures we use the correct user data and prevents stale data issues
        if (state?.isAuthenticated && state.currentUserId) {
            try {
              const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
              const normalizedUserId = state.currentUserId.trim().toLowerCase();
              const userData = storedUsers[normalizedUserId];
              
              // Validate user exists and has valid data
              if (userData && userData.user && typeof userData.user === 'object') {
            // Override rehydrated state with actual user data from storage
                // Always use userData from localStorage, never from rehydrated state
                
                // CRITICAL: Migrate legacy isOnboarded to hasCompletedOnboarding if needed
                let userToReturn = { ...userData.user };
                if (userToReturn.hasCompletedOnboarding === undefined) {
                  const legacyIsOnboarded = userData.isOnboarded !== undefined ? userData.isOnboarded : true;
                  userToReturn.hasCompletedOnboarding = legacyIsOnboarded;
                  // Save the migration
                  storedUsers[normalizedUserId].user = userToReturn;
                  localStorage.setItem('sage-users', JSON.stringify(storedUsers));
                }
                
                // CRITICAL: Validate preferredName exists for onboarded users
                if (userToReturn.hasCompletedOnboarding && !userToReturn.preferredName) {
                  console.error('❌ CRITICAL: User has completed onboarding but preferredName is missing after rehydration!');
                }
                
                return {
                  currentUserId: normalizedUserId, // Ensure normalized
                  user: userToReturn,
                  speechAnalyses: userData.speechAnalyses || [],
                  gameResults: userData.gameResults || [],
                  insights: userData.insights || [],
                  talkSessions: userData.talkSessions || [],
                  healthCards: userData.healthCards || [],
                  familyRequests: userData.familyRequests || [],
                  memorySessions: userData.memorySessions || []
                };
              } else {
                // User data doesn't exist or is corrupted - repair it or clear authentication
                if (userData && userData.password) {
                  // User exists but data is corrupted - repair it
                  console.warn('User data corrupted for:', normalizedUserId, '- repairing...');
                  const displayName = userData?.user?.name || normalizedUserId;
                  const repairedUser = generateInitialUser(displayName);
                  
                  // CRITICAL: Preserve hasCompletedOnboarding if it exists, otherwise use legacy isOnboarded
                  const existingHasCompletedOnboarding = userData?.user?.hasCompletedOnboarding ?? 
                                                          (userData?.isOnboarded === true);
                  repairedUser.hasCompletedOnboarding = existingHasCompletedOnboarding;
                  
                  const repairedData = {
                    ...userData,
                    user: repairedUser,
                    speechAnalyses: userData.speechAnalyses || [],
                    gameResults: userData.gameResults || [],
                    insights: userData.insights || [],
                    talkSessions: userData.talkSessions || [],
                    healthCards: userData.healthCards || [],
                    familyRequests: userData.familyRequests || [],
                    memorySessions: userData.memorySessions || []
                  };
                  
                  // Save repaired data
                  const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
                  storedUsers[normalizedUserId] = repairedData;
                  localStorage.setItem('sage-users', JSON.stringify(storedUsers));
                  
                  // Return repaired state
                  return {
                    currentUserId: normalizedUserId,
                    user: repairedUser, // Contains hasCompletedOnboarding
                    speechAnalyses: repairedData.speechAnalyses,
                    gameResults: repairedData.gameResults,
                    insights: repairedData.insights,
                    talkSessions: repairedData.talkSessions,
                    healthCards: repairedData.healthCards,
                    familyRequests: repairedData.familyRequests,
                    memorySessions: repairedData.memorySessions
                  };
                } else {
                  // User doesn't exist - clear authentication
                  console.warn('User data not found for:', normalizedUserId, '- clearing authentication');
                  return {
                    isAuthenticated: false,
                    currentUserId: null,
                    user: null
                  };
                }
              }
            } catch (e) {
              console.error('Error during rehydration:', e);
              // On error, clear authentication to prevent invalid state
              return {
                isAuthenticated: false,
                currentUserId: null,
                user: null
              };
            }
          } else {
            // Not authenticated - ensure clean state
            return {
              isAuthenticated: false,
              currentUserId: null,
              user: null
            };
          }
        };
      }
    }
  )
);

