'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo, Mic, Brain, Heart, Users, ChevronRight, Sparkles } from '@/components/icons';

const steps = [
  {
    title: "Welcome to Sage",
    description: "Your personal companion for cognitive wellness through natural conversation.",
    icon: <Logo size="lg" />,
    content: (
      <div className="space-y-4 text-center">
        <p className="text-[var(--color-stone)]">
          Sage uses gentle conversations and engaging activities to help 
          track cognitive health over time—without intrusive testing.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <div className="p-4 bg-[var(--color-sand)] rounded-2xl">
            <Mic size={32} className="text-[var(--color-sage)]" />
          </div>
          <div className="p-4 bg-[var(--color-sand)] rounded-2xl">
            <Brain size={32} className="text-[var(--color-terracotta)]" />
          </div>
          <div className="p-4 bg-[var(--color-sand)] rounded-2xl">
            <Heart size={32} className="text-[var(--color-calm)]" />
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Natural Conversations",
    description: "Just speak naturally. Sage learns from everyday dialogue.",
    icon: <Mic size={48} className="text-[var(--color-sage)]" />,
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-[var(--color-sand)] rounded-xl">
          <p className="text-sm text-[var(--color-stone)] mb-2">What we measure:</p>
          <ul className="space-y-2 text-[var(--color-charcoal)]">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
              Language complexity and vocabulary
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
              Speech patterns and fluency
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
              Emotional tone and engagement
            </li>
          </ul>
        </div>
        <p className="text-sm text-[var(--color-stone)] text-center">
          All insights are private and shared only with your chosen caregivers.
        </p>
      </div>
    )
  },
  {
    title: "Gentle Brain Games",
    description: "Fun activities that feel like conversation, not tests.",
    icon: <Brain size={48} className="text-[var(--color-terracotta)]" />,
    content: (
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[var(--color-sand)] rounded-xl text-center">
          <span className="text-2xl">📖</span>
          <p className="text-sm mt-2 text-[var(--color-charcoal)]">Memory Stories</p>
        </div>
        <div className="p-3 bg-[var(--color-sand)] rounded-xl text-center">
          <span className="text-2xl">🎯</span>
          <p className="text-sm mt-2 text-[var(--color-charcoal)]">Attention Tasks</p>
        </div>
        <div className="p-3 bg-[var(--color-sand)] rounded-xl text-center">
          <span className="text-2xl">💬</span>
          <p className="text-sm mt-2 text-[var(--color-charcoal)]">Word Games</p>
        </div>
        <div className="p-3 bg-[var(--color-sand)] rounded-xl text-center">
          <span className="text-2xl">⚡</span>
          <p className="text-sm mt-2 text-[var(--color-charcoal)]">Quick Naming</p>
        </div>
      </div>
    )
  },
  {
    title: "Family Connection",
    description: "Share memories and stay connected with loved ones.",
    icon: <Users size={48} className="text-[var(--color-calm)]" />,
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-[var(--color-sand)] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[var(--color-sage-light)] flex items-center justify-center text-xl">
            👨‍👩‍👧
          </div>
          <div className="flex-1">
            <p className="font-medium text-[var(--color-charcoal)]">Family Memory Hub</p>
            <p className="text-sm text-[var(--color-stone)]">Photos, stories, and updates</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-[var(--color-sand)] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[var(--color-terracotta-light)] flex items-center justify-center text-xl">
            📊
          </div>
          <div className="flex-1">
            <p className="font-medium text-[var(--color-charcoal)]">Caregiver Dashboard</p>
            <p className="text-sm text-[var(--color-stone)]">Clear, non-clinical insights</p>
          </div>
        </div>
      </div>
    )
  }
];

export function Onboarding() {
  const { completeOnboarding } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Ensure currentStep is within valid bounds
  const safeStep = Math.max(0, Math.min(currentStep, steps.length - 1));
  const currentStepData = steps[safeStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowNameInput(true);
    }
  };

  const handleComplete = () => {
    if (userName.trim()) {
      completeOnboarding(userName.trim());
    }
  };

  // Safety check - return early if step data is not available
  if (!currentStepData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-stone)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {!showNameInput ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="text-center">
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep 
                        ? 'w-8 bg-[var(--color-sage)]' 
                        : idx < currentStep 
                          ? 'bg-[var(--color-sage-light)]'
                          : 'bg-[var(--color-sand)]'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="p-6 bg-[var(--color-sand)] rounded-3xl"
                >
                  {currentStepData.icon}
                </motion.div>
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-[var(--color-stone)] mb-6">
                {currentStepData.description}
              </p>

              {/* Step content */}
              <div className="mb-8">
                {currentStepData.content}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button 
                    variant="secondary" 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button onClick={handleNext} fullWidth>
                  {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center"
              >
                <Sparkles size={36} className="text-white" />
              </motion.div>

              <h1 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
                What should I call you?
              </h1>
              <p className="text-[var(--color-stone)] mb-6">
                I'll use this name to greet you personally.
              </p>

              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && userName && handleComplete()}
                placeholder="Enter your name..."
                className="w-full p-4 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none text-lg text-center mb-6"
                autoFocus
              />

              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowNameInput(false)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={!userName.trim()}
                  fullWidth
                >
                  Start Sage
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

