'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Home, Mic, Brain, Users, BarChart3, BookOpen, Heart, Clock } from '@/components/icons';

const navItems = [
  { id: 'home' as const, icon: Home, label: 'Home' },
  { id: 'games' as const, icon: Brain, label: 'Games' },
  { id: 'speak' as const, icon: Mic, label: 'Speak' },
  { id: 'biography' as const, icon: BookOpen, label: 'Story' },
  { id: 'timeline' as const, icon: Clock, label: 'Timeline' },
  { id: 'health' as const, icon: Heart, label: 'Health' },
  { id: 'family' as const, icon: Users, label: 'Family' },
  { id: 'insights' as const, icon: BarChart3, label: 'Insights' },
];

export function Navigation() {
  const { activeTab, setActiveTab, unreadInsights } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div className="glass rounded-3xl soft-shadow p-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all flex-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] rounded-2xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-[var(--color-stone)]'
                  }`}>
                    <Icon size={24} />
                    {item.id === 'insights' && unreadInsights > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-terracotta)] text-white text-xs rounded-full flex items-center justify-center">
                        {unreadInsights > 9 ? '9+' : unreadInsights}
                      </span>
                    )}
                  </span>
                  <span className={`relative z-10 text-xs mt-1 font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-[var(--color-stone)]'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

