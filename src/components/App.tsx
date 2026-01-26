'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
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
  const { isAuthenticated, isOnboarded, currentUserId, isDarkMode, user, speechAnalyses, gameResults, insights, talkSessions, healthCards, familyRequests } = useStore();
  const [authView, setAuthView] = useState<'home' | 'login' | 'signup'>('home');

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

  // Save user data whenever it changes
  
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      const saveUserData = () => {
        try {
          const state = useStore.getState();
          const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
          if (storedUsers[currentUserId]) {
            storedUsers[currentUserId] = {
              ...storedUsers[currentUserId],
              password: storedUsers[currentUserId].password,
              user: state.user,
              isOnboarded: state.isOnboarded,
              speechAnalyses: state.speechAnalyses,
              gameResults: state.gameResults,
              insights: state.insights,
              talkSessions: state.talkSessions,
              healthCards: state.healthCards,
              familyRequests: state.familyRequests || []
            };
            localStorage.setItem('sage-users', JSON.stringify(storedUsers));
          }
        } catch (e) {
          // localStorage not available, skip saving
          console.warn('localStorage not available, data not saved');
        }
      };

      // Save whenever user data changes
      saveUserData();
    }
  }, [isAuthenticated, currentUserId, user, isOnboarded, speechAnalyses, gameResults, insights, talkSessions, healthCards, familyRequests]);

  // Check authentication first
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

  // Logic: If user successfully logged in, they should go to home page
  // Only show onboarding for new signups (where isOnboarded is explicitly false)
  // If localStorage is unavailable or user data is missing, assume they've completed onboarding
  // since they were able to log in successfully
  const shouldShowOnboarding = isOnboarded === false;
  
  if (shouldShowOnboarding) {
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

