'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo, Mic, Brain, Heart, Users, BarChart3 } from '@/components/icons';

interface AuthHomeProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function AuthHome({ onLogin, onSignUp }: AuthHomeProps) {
  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-[var(--color-sand)] via-white to-[var(--color-sage-light)]">
      <div className="max-w-6xl mx-auto">
        {/* Header: Title on left, buttons on right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-16"
        >
          {/* Left: Title and tagline */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo size="md" />
              <h1 className="text-3xl font-display font-bold text-[var(--color-charcoal)]">
                Sage
              </h1>
            </div>
            <p className="text-lg text-[var(--color-stone)]">
              Your personal companion for cognitive wellness through natural conversation
            </p>
          </div>

          {/* Right: Login/Signup buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onLogin}
              size="lg"
            >
              Log In
            </Button>
            
            <Button
              onClick={onSignUp}
              size="lg"
              variant="secondary"
            >
              Sign Up
            </Button>
          </div>
        </motion.div>

        {/* Middle: Feature cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card delay={0.2} className="p-10 h-full">
            <div className="flex flex-col items-center text-center gap-6 h-full">
              <div className="p-5 bg-[var(--color-sage)]/10 rounded-xl">
                <Mic size={40} className="text-[var(--color-sage)]" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-display font-semibold text-xl text-[var(--color-charcoal)] mb-4">
                  Natural Conversations
                </h3>
                <p className="text-base text-[var(--color-stone)] leading-relaxed">
                  Just speak naturally. Sage learns from everyday dialogue to track language complexity, speech patterns, and emotional tone.
                </p>
              </div>
            </div>
          </Card>

          <Card delay={0.3} className="p-10 h-full">
            <div className="flex flex-col items-center text-center gap-6 h-full">
              <div className="p-5 bg-[var(--color-terracotta)]/10 rounded-xl">
                <Brain size={40} className="text-[var(--color-terracotta)]" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-display font-semibold text-xl text-[var(--color-charcoal)] mb-4">
                  Gentle Brain Games
                </h3>
                <p className="text-base text-[var(--color-stone)] leading-relaxed">
                  Engaging activities that measure memory, attention, language, and processing speed—all through gentle, conversational games.
                </p>
              </div>
            </div>
          </Card>

          <Card delay={0.4} className="p-10 h-full">
            <div className="flex flex-col items-center text-center gap-6 h-full">
              <div className="p-5 bg-[var(--color-calm)]/10 rounded-xl">
                <Heart size={40} className="text-[var(--color-calm)]" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-display font-semibold text-xl text-[var(--color-charcoal)] mb-4">
                  Emotional Support
                </h3>
                <p className="text-base text-[var(--color-stone)] leading-relaxed">
                  Detects emotional states and automatically adjusts conversation style. Tracks patterns over time for better understanding.
                </p>
              </div>
            </div>
          </Card>

          <Card delay={0.5} className="p-10 h-full">
            <div className="flex flex-col items-center text-center gap-6 h-full">
              <div className="p-5 bg-[var(--color-sage)]/10 rounded-xl">
                <BarChart3 size={40} className="text-[var(--color-sage)]" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-display font-semibold text-xl text-[var(--color-charcoal)] mb-4">
                  Insights Dashboard
                </h3>
                <p className="text-base text-[var(--color-stone)] leading-relaxed">
                  Clear, non-clinical visualizations of cognitive trends, helping you and your family understand changes over time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

