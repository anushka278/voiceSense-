'use client';

import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { HomePage } from '@/components/features/HomePage';
import { VoiceRecorder } from '@/components/features/VoiceRecorder';
import { BrainGames } from '@/components/features/BrainGames';
import { FamilyHub } from '@/components/features/FamilyHub';
import { InsightsDashboard } from '@/components/features/InsightsDashboard';
import { BiographyCapture } from '@/components/features/BiographyCapture';
import { HealthScribe } from '@/components/features/HealthScribe';
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
        {activeTab === 'speak' && <VoiceRecorder />}
        {activeTab === 'games' && <BrainGames />}
        {activeTab === 'family' && <FamilyHub />}
        {activeTab === 'insights' && <InsightsDashboard />}
        {activeTab === 'biography' && <BiographyCapture />}
        {activeTab === 'health' && <HealthScribe />}
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  const { isOnboarded } = useStore();

  if (!isOnboarded) {
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

