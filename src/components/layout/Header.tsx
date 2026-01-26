'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Logo, Settings, TimeOfDayIcon, LogOut, Sun, Moon } from '@/components/icons';
import { getTimeOfDay } from '@/lib/speechAnalysis';

export function Header() {
  const { user, isDarkMode, toggleDarkMode, setActiveTab, logout } = useStore();
  const timeOfDay = getTimeOfDay();
  
  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning': return 'Good morning';
      case 'afternoon': return 'Good afternoon';
      case 'evening': return 'Good evening';
      case 'night': return 'Good night';
    }
  };

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
                {getGreeting()}, {user?.preferredName || user?.name || 'Friend'}
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

