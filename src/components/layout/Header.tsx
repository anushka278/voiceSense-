'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Logo, Settings, TimeOfDayIcon, LogOut, Sun, Moon } from '@/components/icons';
import { getTimeOfDay } from '@/lib/speechAnalysis';

export function Header() {
  const { user, isDarkMode, toggleDarkMode, setActiveTab, logout, currentUserId } = useStore();
  const timeOfDay = getTimeOfDay();
  
  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning': return 'Good morning';
      case 'afternoon': return 'Good afternoon';
      case 'evening': return 'Good evening';
      case 'night': return 'Good night';
    }
  };

  // CRITICAL: Get preferredName from user object or persistent storage
  // preferredName is the ONLY name that may be displayed
  const getPreferredName = (): string => {
    // First, try to get from user object
    if (user?.preferredName && user.preferredName.trim().length > 0) {
      return user.preferredName;
    }

    // Fallback: Try to read from localStorage (persistent storage)
    if (currentUserId) {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('sage-users') || '{}');
        const userData = storedUsers[currentUserId];
        if (userData?.user?.preferredName && userData.user.preferredName.trim().length > 0) {
          return userData.user.preferredName;
        }
      } catch (e) {
        console.error('Error reading preferredName from localStorage:', e);
      }
    }

    // CRITICAL: If preferredName is missing, this is a blocking error
    // Do NOT fall back to username, name, or any other value
    console.error('❌ CRITICAL: preferredName is missing! This should never happen after onboarding.');
    return ''; // Return empty string - this will cause an error that must be fixed
  };

  const preferredName = getPreferredName();
  
  // CRITICAL: If preferredName is empty, this is a blocking error
  if (!preferredName || preferredName.trim().length === 0) {
    console.error('❌❌❌ BLOCKING ERROR: preferredName is missing or empty!', {
      userId: currentUserId,
      userObject: user,
      hasCompletedOnboarding: user?.hasCompletedOnboarding
    });
  }

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 px-4 pt-4 pb-2"
    >
      <div className="glass rounded-2xl soft-shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
                {preferredName ? `${getGreeting()}, ${preferredName}` : getGreeting()}
              </h1>
              <div className="flex items-center gap-1 text-sm text-[var(--color-stone)]">
                <TimeOfDayIcon time={timeOfDay} size={14} />
                <span className="capitalize">{timeOfDay} session</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                isDarkMode 
                  ? 'bg-[var(--color-charcoal)] text-yellow-300' 
                  : 'bg-[var(--color-sand)] text-[var(--color-terracotta)] hover:bg-[var(--color-sage-light)]'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 360 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </motion.div>
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-sage-light)] transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-agitated)]/10 hover:text-[var(--color-agitated)] transition-colors"
              title="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

