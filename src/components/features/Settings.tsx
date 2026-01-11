'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Sun, Moon, User, Volume2, LogOut, ChevronRight, Info
} from '@/components/icons';

export function Settings() {
  const { 
    user, 
    isDarkMode, 
    toggleDarkMode, 
    updateConversationSettings,
    logout 
  } = useStore();
  
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
          Settings
        </h2>
        <p className="text-[var(--color-stone)]">
          Customize your Sage experience
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
              {user?.name || 'User'}
            </h3>
            <p className="text-sm text-[var(--color-stone)]">
              Preferred name: {user?.preferredName || 'Not set'}
            </p>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-lg text-[var(--color-charcoal)]">
          Appearance
        </h3>
        
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon size={24} className="text-[var(--color-sage)]" /> : <Sun size={24} className="text-[var(--color-terracotta)]" />}
              <div>
                <p className="font-medium text-[var(--color-charcoal)]">Dark Mode</p>
                <p className="text-sm text-[var(--color-stone)]">
                  {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                isDarkMode ? 'bg-[var(--color-sage)]' : 'bg-[var(--color-sand)]'
              }`}
            >
              <motion.div
                animate={{ x: isDarkMode ? 24 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
              />
            </button>
          </div>
        </Card>
      </div>

      {/* Accessibility */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-lg text-[var(--color-charcoal)]">
          Accessibility
        </h3>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Volume2 size={24} className="text-[var(--color-sage)]" />
              <div>
                <p className="font-medium text-[var(--color-charcoal)]">Speech Rate</p>
                <p className="text-sm text-[var(--color-stone)]">
                  Adjust how fast the app speaks
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((rate) => (
                <button
                  key={rate}
                  onClick={() => updateConversationSettings({ speechRate: rate })}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    user?.conversationSettings.speechRate === rate
                      ? 'bg-[var(--color-sage)] text-white'
                      : 'bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-sage-light)]'
                  }`}
                >
                  {rate.charAt(0).toUpperCase() + rate.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium text-[var(--color-charcoal)]">Sentence Complexity</p>
                <p className="text-sm text-[var(--color-stone)]">
                  Adjust language complexity
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['simple', 'moderate', 'complex'] as const).map((complexity) => (
                <button
                  key={complexity}
                  onClick={() => updateConversationSettings({ sentenceComplexity: complexity })}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    user?.conversationSettings.sentenceComplexity === complexity
                      ? 'bg-[var(--color-sage)] text-white'
                      : 'bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-sage-light)]'
                  }`}
                >
                  {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-lg text-[var(--color-charcoal)]">
          Preferences
        </h3>
        
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <div>
                <p className="font-medium text-[var(--color-charcoal)]">Use Familiar Names</p>
                <p className="text-sm text-[var(--color-stone)]">
                  Reference family members by name
                </p>
              </div>
            </div>
            <button
              onClick={() => updateConversationSettings({ 
                usesFamiliarNames: !user?.conversationSettings.usesFamiliarNames 
              })}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                user?.conversationSettings.usesFamiliarNames ? 'bg-[var(--color-sage)]' : 'bg-[var(--color-sand)]'
              }`}
            >
              <motion.div
                animate={{ x: user?.conversationSettings.usesFamiliarNames ? 24 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
              />
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔁</span>
              <div>
                <p className="font-medium text-[var(--color-charcoal)]">Enable Repetition</p>
                <p className="text-sm text-[var(--color-stone)]">
                  Repeat important information
                </p>
              </div>
            </div>
            <button
              onClick={() => updateConversationSettings({ 
                repetitionEnabled: !user?.conversationSettings.repetitionEnabled 
              })}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                user?.conversationSettings.repetitionEnabled ? 'bg-[var(--color-sage)]' : 'bg-[var(--color-sand)]'
              }`}
            >
              <motion.div
                animate={{ x: user?.conversationSettings.repetitionEnabled ? 24 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
              />
            </button>
          </div>
        </Card>
      </div>

      {/* About */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-lg text-[var(--color-charcoal)]">
          About
        </h3>
        
        <Card hover onClick={() => setShowAbout(!showAbout)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info size={24} className="text-[var(--color-sage)]" />
              <div>
                <p className="font-medium text-[var(--color-charcoal)]">About Sage</p>
                <p className="text-sm text-[var(--color-stone)]">Version 1.0.0</p>
              </div>
            </div>
            <ChevronRight size={20} className={`text-[var(--color-stone)] transition-transform ${showAbout ? 'rotate-90' : ''}`} />
          </div>
          
          {showAbout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-[var(--color-sand)]"
            >
              <p className="text-sm text-[var(--color-stone)]">
                Sage is a companion app designed to support cognitive health 
                through gentle conversation, brain games, and memory preservation. 
                Built with care for seniors and their families.
              </p>
            </motion.div>
          )}
        </Card>
      </div>

      {/* Log Out */}
      <Card className="border-2 border-[var(--color-agitated)]/20">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-[var(--color-agitated)] font-medium py-2"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </Card>
    </div>
  );
}

