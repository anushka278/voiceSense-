'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { isSupabaseConfigured } from '@/lib/supabaseHelper';
import { 
  talkSessionService, 
  healthCardService, 
  speechAnalysisService, 
  gameResultService, 
  insightService, 
  familyRequestService,
  memorySessionService,
  userService
} from '@/lib/supabaseService';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { AuthHome } from '@/components/auth/AuthHome';
import { Login } from '@/components/auth/Login';
import { SignUp } from '@/components/auth/SignUp';
import { HomePage } from '@/components/features/HomePage';
import { BrainGames } from '@/components/features/BrainGames';
import { FamilyHub } from '@/components/features/FamilyHub';
import { InsightsDashboard } from '@/components/features/InsightsDashboard';
import { Settings } from '@/components/features/Settings';
import { Talk } from '@/components/features/Talk';
import { motion, AnimatePresence } from 'framer-motion';

function MainContent() {
  const { activeTab } = useStore();
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="px-4 pb-32"
      >
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'games' && <BrainGames />}
        {activeTab === 'family' && <FamilyHub />}
        {activeTab === 'insights' && <InsightsDashboard />}
        {activeTab === 'talk' && <Talk />}
        {activeTab === 'settings' && <Settings />}
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  const { isAuthenticated, currentUserId, isDarkMode, user, speechAnalyses, gameResults, insights, talkSessions, healthCards, familyRequests, memorySessions, activeTab, setActiveTab } = useStore();
  const [authView, setAuthView] = useState<'home' | 'login' | 'signup'>('home');
  const hasSetInitialTab = useRef(false);

  // Ensure landing page (AuthHome) is shown when not authenticated (only on auth state change, not on view change)
  useEffect(() => {
    if (!isAuthenticated && authView !== 'home') {
      setAuthView('home');
    }
  }, [isAuthenticated]); // Only run when authentication state changes, not when authView changes

  // Ensure home screen is shown when app loads (authenticated and onboarded users)
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset ref when user logs out so it works correctly on next login
      hasSetInitialTab.current = false;
    } else if (!hasSetInitialTab.current && user?.hasCompletedOnboarding) {
      setActiveTab('home');
      hasSetInitialTab.current = true;
    }
  }, [isAuthenticated, user?.hasCompletedOnboarding, setActiveTab]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save user data to Supabase whenever it changes
  useEffect(() => {
    if (isAuthenticated && currentUserId && user && isSupabaseConfigured()) {
      const saveUserData = async () => {
        try {
          const state = useStore.getState();
          
          // Save user data to Supabase
          try {
            // Only update fields that are actually defined
            const updates: any = {};
            if (state.user?.name !== undefined) updates.name = state.user.name;
            if (state.user?.preferredName !== undefined) updates.preferredName = state.user.preferredName;
            if (state.user?.hasCompletedOnboarding !== undefined) updates.hasCompletedOnboarding = state.user.hasCompletedOnboarding;
            
            // Handle cognitiveProfile - serialize Date objects
            if (state.user?.cognitiveProfile) {
              updates.cognitiveProfile = {
                ...state.user.cognitiveProfile,
                lastUpdated: state.user.cognitiveProfile.lastUpdated instanceof Date 
                  ? state.user.cognitiveProfile.lastUpdated.toISOString() 
                  : state.user.cognitiveProfile.lastUpdated,
                recentInsights: state.user.cognitiveProfile.recentInsights?.map(insight => ({
                  ...insight,
                  timestamp: insight.timestamp instanceof Date ? insight.timestamp.toISOString() : insight.timestamp
                }))
              };
            }
            
            // Handle familyMembers
            if (state.user?.familyMembers !== undefined) {
              updates.familyMembers = state.user.familyMembers;
            }
            
            // Only update if we have something to update
            if (Object.keys(updates).length > 0) {
              await userService.update(currentUserId, updates);
            }
          } catch (userError: any) {
            console.error('Error updating user in Supabase:', {
              error: userError,
              message: userError?.message,
              code: userError?.code,
              details: userError?.details,
              hint: userError?.hint,
              userId: currentUserId
            });
            // Don't throw - allow other saves to continue
          }
          
          // Save all data arrays to Supabase
          // Note: Individual items are saved when added via store actions,
          // but we sync the full arrays here to ensure consistency
          
          // Save talk sessions (only new ones that aren't already saved)
          try {
            const existingSessions = await talkSessionService.findByUserId(currentUserId);
            const existingSessionIds = new Set(existingSessions.map(s => s.id));
            for (const session of state.talkSessions) {
              if (!existingSessionIds.has(session.id)) {
                await talkSessionService.create(currentUserId, session).catch(err => 
                  console.error('Error saving talk session:', err)
                );
              }
            }
          } catch (err: any) {
            console.error('Error syncing talk sessions:', err);
          }
          
          // Save health cards (only new ones)
          try {
            const existingCards = await healthCardService.findByUserId(currentUserId);
            const existingCardIds = new Set(existingCards.map(c => c.id));
            for (const card of state.healthCards) {
              if (!existingCardIds.has(card.id)) {
                await healthCardService.create(currentUserId, card).catch(err => 
                  console.error('Error saving health card:', err)
                );
              }
            }
          } catch (err: any) {
            console.error('Error syncing health cards:', err);
          }
          
          // Save speech analyses (only new ones)
          try {
            const existingAnalyses = await speechAnalysisService.findByUserId(currentUserId);
            const existingAnalysisIds = new Set(existingAnalyses.map(a => a.id));
            for (const analysis of state.speechAnalyses) {
              if (!existingAnalysisIds.has(analysis.id)) {
                await speechAnalysisService.create(currentUserId, analysis).catch(err => 
                  console.error('Error saving speech analysis:', err)
                );
              }
            }
          } catch (err: any) {
            console.error('Error syncing speech analyses:', err);
          }
          
          // Save game results (only new ones)
          // Skip if table doesn't exist (graceful degradation)
          try {
            let existingResults;
            try {
              existingResults = await gameResultService.findByUserId(currentUserId);
            } catch (findError: any) {
              const errorMessage = findError?.message || String(findError);
              if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
                console.warn('⚠️ Game results table does not exist in Supabase. Skipping sync. Please run the schema.sql file in your Supabase dashboard.');
                return; // Skip syncing if table doesn't exist
              }
              throw findError;
            }
            
            const existingResultIds = new Set(existingResults.map(r => r.id));
            for (const result of state.gameResults) {
              if (!existingResultIds.has(result.id)) {
                await gameResultService.create(currentUserId, result).catch(err => {
                  const errorMessage = err?.message || String(err);
                  if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
                    console.warn('⚠️ Game results table does not exist in Supabase. Skipping save. Please run the schema.sql file in your Supabase dashboard.');
                    return; // Stop trying to save if table doesn't exist
                  }
                  console.error('Error saving game result:', {
                    error: err,
                    message: err?.message || String(err),
                    code: err?.code,
                    details: err?.details,
                    hint: err?.hint,
                    resultId: result.id,
                    userId: currentUserId
                  });
                });
              }
            }
          } catch (err: any) {
            const errorMessage = err?.message || String(err);
            if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
              console.warn('⚠️ Game results table does not exist in Supabase. Skipping sync. Please run the schema.sql file in your Supabase dashboard.');
              return; // Skip syncing if table doesn't exist
            }
            console.error('Error syncing game results:', {
              error: err,
              message: err?.message || String(err),
              code: err?.code,
              details: err?.details,
              hint: err?.hint,
              userId: currentUserId
            });
          }
          
          // Save insights (only new ones)
          try {
            const existingInsights = await insightService.findByUserId(currentUserId);
            const existingInsightIds = new Set(existingInsights.map(i => i.id));
            for (const insight of state.insights) {
              if (!existingInsightIds.has(insight.id)) {
                await insightService.create(currentUserId, insight).catch(err => 
                  console.error('Error saving insight:', err)
                );
              }
            }
          } catch (err: any) {
            console.error('Error syncing insights:', err);
          }
          
          // Save memory sessions (only new ones)
          // Skip if table doesn't exist (graceful degradation)
          try {
            let existingMemorySessions;
            try {
              existingMemorySessions = await memorySessionService.findByUserId(currentUserId);
            } catch (findError: any) {
              // Check if error is due to missing table
              const errorMessage = findError?.message || String(findError);
              if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
                console.warn('⚠️ Memory sessions table does not exist in Supabase. Skipping sync. Please run the schema.sql file in your Supabase dashboard.');
                return; // Skip syncing memory sessions if table doesn't exist
              }
              // Re-throw other errors
              throw findError;
            }
            
            const existingMemorySessionIds = new Set(existingMemorySessions.map(m => m.id));
            
            for (const session of state.memorySessions) {
              if (!existingMemorySessionIds.has(session.id)) {
                // Validate session structure before saving
                if (!session.id || !session.chapter || !session.timestamp) {
                  console.error('Invalid memory session structure:', {
                    session,
                    hasId: !!session.id,
                    hasChapter: !!session.chapter,
                    hasTimestamp: !!session.timestamp
                  });
                  continue;
                }
                
                try {
                  await memorySessionService.create(currentUserId, session);
                } catch (createError: any) {
                  const errorMessage = createError?.message || String(createError);
                  // Check if error is due to missing table
                  if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
                    console.warn('⚠️ Memory sessions table does not exist in Supabase. Skipping save. Please run the schema.sql file in your Supabase dashboard.');
                    return; // Stop trying to save if table doesn't exist
                  }
                  console.error('Error saving memory session:', {
                    error: createError,
                    message: createError?.message,
                    code: createError?.code,
                    details: createError?.details,
                    hint: createError?.hint,
                    sessionId: session.id,
                    userId: currentUserId
                  });
                }
              }
            }
          } catch (err: any) {
            const errorMessage = err?.message || String(err);
            // Check if error is due to missing table
            if (errorMessage.includes('Could not find the table') || errorMessage.includes('does not exist')) {
              console.warn('⚠️ Memory sessions table does not exist in Supabase. Skipping sync. Please run the schema.sql file in your Supabase dashboard.');
              return; // Skip syncing if table doesn't exist
            }
            console.error('Error syncing memory sessions:', {
              error: err,
              message: err?.message,
              code: err?.code,
              details: err?.details,
              hint: err?.hint,
              userId: currentUserId
            });
          }
          
        } catch (e: any) {
          console.error('Error saving user data to Supabase:', {
            error: e,
            message: e?.message,
            code: e?.code,
            details: e?.details,
            hint: e?.hint,
            stack: e?.stack,
            userId: currentUserId
          });
        }
      };

      // Save whenever user data changes (debounced to avoid too many saves)
      const timeoutId = setTimeout(() => {
        saveUserData();
      }, 1000); // Wait 1 second after last change before saving
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, currentUserId, user, speechAnalyses, gameResults, insights, talkSessions, healthCards, familyRequests, memorySessions]);

  // CRITICAL: Always show Home page first, then redirect based on auth state
  // This ensures there's never a blank root route
  
  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    if (authView === 'login') {
      return <Login onBack={() => setAuthView('home')} />;
    }
    if (authView === 'signup') {
      return <SignUp onBack={() => setAuthView('home')} />;
    }
    return (
      <AuthHome
        onLogin={() => setAuthView('login')}
        onSignUp={() => setAuthView('signup')}
      />
    );
  }

  // CRITICAL: Onboarding logic - driven exclusively by persisted user state
  // Check user.hasCompletedOnboarding from persistent storage
  // If user is authenticated but hasCompletedOnboarding is false, show onboarding
  // If user is authenticated and hasCompletedOnboarding is true, skip onboarding
  const hasCompletedOnboarding = user?.hasCompletedOnboarding ?? false;
  
  // CRITICAL: If user has completed onboarding, they must have a preferredName
  if (hasCompletedOnboarding && !user?.preferredName) {
    console.error('❌ CRITICAL: User has completed onboarding but preferredName is missing!');
    // This is a blocking error - but we'll allow them to proceed and fix it
  }
  
  // CRITICAL: Only show onboarding if user has NOT completed it
  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="pt-2">
        <MainContent />
      </main>
      <Navigation />
    </div>
  );
}

