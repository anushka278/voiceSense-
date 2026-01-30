'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo, Mic, Brain, Heart, BarChart3 } from '@/components/icons';

interface AuthHomeProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function AuthHome({ onLogin, onSignUp }: AuthHomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[var(--color-sand)]/30 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        {/* Premium Header: Logo and Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between pt-8 pb-16 sm:pt-12 sm:pb-24"
        >
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--color-charcoal)] tracking-tight">
              Sage
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={onLogin}
              size="lg"
              variant="secondary"
              className="rounded-full"
            >
              Log In
            </Button>
            
            <Button
              onClick={onSignUp}
              size="lg"
              className="rounded-full"
            >
              Sign Up
            </Button>
          </div>
        </motion.div>

        {/* Premium Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl font-display font-semibold text-[var(--color-charcoal)] mb-8 leading-[1.2] tracking-tight max-w-2xl mx-auto"
          >
            Your personal companion for cognitive wellness
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-[var(--color-stone)] leading-relaxed max-w-xl mx-auto font-light"
          >
            Track your cognitive health through natural conversation, gentle activities, and meaningful insights—all designed with care and respect.
          </motion.p>
        </div>

        {/* Premium Feature Cards */}
        <div className="max-w-5xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Primary Feature - Natural Conversations (highlighted) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 lg:row-span-2"
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-white rounded-2xl p-9 border border-black/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300"
              >
                <div className="flex flex-col h-full gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-sage)]/15 to-[var(--color-sage)]/5 flex items-center justify-center">
                    <Mic size={28} className="text-[var(--color-sage)]" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-[var(--color-charcoal)] leading-tight">
                    Natural Conversations
                  </h3>
                  <p className="text-lg text-[var(--color-charcoal)] leading-relaxed opacity-75">
                    Just speak naturally. Sage learns from everyday dialogue to track language complexity, speech patterns, and emotional tone—helping you understand your cognitive wellness journey.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Secondary Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-white rounded-2xl p-8 border border-black/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-terracotta)]/15 to-[var(--color-terracotta)]/5 flex items-center justify-center mb-4">
                  <Brain size={22} className="text-[var(--color-terracotta)]" />
                </div>
                <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-3 leading-tight">
                  Gentle Brain Games
                </h3>
                <p className="text-base text-[var(--color-charcoal)] leading-relaxed opacity-70">
                  Engaging activities that measure memory, attention, language, and processing speed.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-white rounded-2xl p-8 border border-black/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-calm)]/15 to-[var(--color-calm)]/5 flex items-center justify-center mb-4">
                  <Heart size={22} className="text-[var(--color-calm)]" />
                </div>
                <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-3 leading-tight">
                  Emotional Support
                </h3>
                <p className="text-base text-[var(--color-charcoal)] leading-relaxed opacity-70">
                  Detects emotional states and automatically adjusts conversation style with care and understanding.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2"
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-white rounded-2xl p-8 border border-black/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-sage)]/15 to-[var(--color-sage)]/5 flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={22} className="text-[var(--color-sage)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-3 leading-tight">
                      Insights Dashboard
                    </h3>
                    <p className="text-base text-[var(--color-charcoal)] leading-relaxed opacity-70">
                      Clear, non-clinical visualizations of cognitive trends, helping you and your family understand changes over time.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

