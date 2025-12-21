'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Mic, MicOff, Activity, AlertCircle, CheckCircle2 } from '@/components/icons';
import { detectHealthIntent, generateHealthFollowUpQuestions, extractPainLevel } from '@/lib/healthIntentDetection';
import type { HealthEntry, HealthIntent } from '@/types';

// Demo responses for health-related conversations
const healthDemoResponses: Record<HealthIntent, string[]> = {
  symptom: [
    "I've been feeling a bit dizzy this morning. It started after breakfast.",
    "I feel nauseous and haven't been able to eat much today.",
    "I've had a headache for the past few hours. It's not too bad though."
  ],
  medication: [
    "Did I take my blood pressure pill this morning? I can't remember.",
    "I think I forgot to take my medication. What time was I supposed to take it?",
    "I took my morning pills, but I'm not sure if I took the evening ones."
  ],
  pain: [
    "My back has been hurting. It's about a 6 out of 10.",
    "I have some pain in my knee. Maybe a 4 or 5.",
    "The pain isn't too bad, maybe a 3. It comes and goes."
  ],
  appointment: [
    "I have a doctor's appointment next week. I should write that down.",
    "When is my next checkup? I think it's coming up soon.",
    "I need to call the doctor about my test results."
  ],
  mood: [
    "I've been feeling a bit anxious lately. Not sure why.",
    "I'm feeling good today, much better than yesterday.",
    "I've been a bit down. Maybe it's the weather."
  ],
  sleep: [
    "I didn't sleep well last night. Maybe 4 or 5 hours.",
    "I slept great! Got a full 8 hours for once.",
    "I keep waking up during the night. It's frustrating."
  ],
  nutrition: [
    "I haven't eaten much today. Just some toast for breakfast.",
    "I had a good lunch. Chicken and vegetables.",
    "My appetite has been off lately. Nothing sounds good."
  ],
  general: [
    "I'm feeling okay overall, just a bit tired.",
    "Everything seems fine. No complaints really.",
    "I've been taking care of myself, eating well and resting."
  ]
};

export function HealthScribe() {
  const {
    user,
    medicalJournal,
    isHealthMode,
    setIsHealthMode,
    addHealthEntry
  } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<HealthIntent | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [followUpResponses, setFollowUpResponses] = useState<{ question: string; response: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptBuilderRef = useRef<string>('');

  // Monitor transcript for health intents
  useEffect(() => {
    if (currentTranscript.length > 20) {
      const intent = detectHealthIntent(currentTranscript);
      if (intent && !isHealthMode) {
        setDetectedIntent(intent);
        setIsHealthMode(true);
        const questions = generateHealthFollowUpQuestions(intent);
        setFollowUpQuestions(questions);
        setCurrentQuestionIndex(0);
      }
    }
  }, [currentTranscript, isHealthMode, setIsHealthMode]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    setDetectedIntent(null);
    setFollowUpQuestions([]);
    setCurrentQuestionIndex(0);
    setFollowUpResponses([]);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    if (!currentTranscript) return;
    
    // Detect intent if not already detected
    if (!detectedIntent) {
      const intent = detectHealthIntent(currentTranscript);
      if (intent) {
        setDetectedIntent(intent);
        setIsHealthMode(true);
        const questions = generateHealthFollowUpQuestions(intent);
        setFollowUpQuestions(questions);
      }
    }
  }, [currentTranscript, detectedIntent, setIsHealthMode]);

  const answerFollowUp = useCallback(async () => {
    if (!detectedIntent || currentQuestionIndex >= followUpQuestions.length) {
      // Save health entry
      const painLevel = extractPainLevel(currentTranscript);
      
      const healthEntry: HealthEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        intent: detectedIntent || 'general',
        primaryConcern: currentTranscript,
        followUpQuestions: followUpResponses.map(r => ({
          question: r.question,
          response: r.response,
          timestamp: new Date()
        })),
        painLevel,
        notes: '',
        tags: []
      };
      
      addHealthEntry(healthEntry);
      setIsProcessing(true);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsProcessing(false);
      setIsHealthMode(false);
      setCurrentTranscript('');
      setDetectedIntent(null);
      setFollowUpQuestions([]);
      setCurrentQuestionIndex(0);
      setFollowUpResponses([]);
      return;
    }
    
    // Add response and move to next question
    const currentQuestion = followUpQuestions[currentQuestionIndex];
    setFollowUpResponses(prev => [
      ...prev,
      { question: currentQuestion, response: currentTranscript }
    ]);
    
    setCurrentQuestionIndex(prev => prev + 1);
    setCurrentTranscript('');
    setIsRecording(true);
    
    // Simulate next question response
    const responses = healthDemoResponses[detectedIntent] || [];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const words = randomResponse.split(' ');
    let currentWordIndex = 0;
    
    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        transcriptBuilderRef.current = transcriptBuilderRef.current 
          + (transcriptBuilderRef.current ? ' ' : '') 
          + words[currentWordIndex];
        setCurrentTranscript(transcriptBuilderRef.current);
        currentWordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 300);
  }, [detectedIntent, currentQuestionIndex, followUpQuestions, currentTranscript, followUpResponses, addHealthEntry, setIsHealthMode]);

  const getIntentIcon = (intent: HealthIntent) => {
    switch (intent) {
      case 'symptom':
      case 'pain':
        return <AlertCircle size={24} className="text-[var(--color-agitated)]" />;
      case 'medication':
        return <Activity size={24} className="text-[var(--color-terracotta)]" />;
      default:
        return <Heart size={24} className="text-[var(--color-sage)]" />;
    }
  };

  const getIntentLabel = (intent: HealthIntent): string => {
    const labels: Record<HealthIntent, string> = {
      symptom: 'Symptom Report',
      medication: 'Medication Inquiry',
      pain: 'Pain Assessment',
      appointment: 'Appointment',
      mood: 'Mood Check',
      sleep: 'Sleep Quality',
      nutrition: 'Nutrition',
      general: 'General Health'
    };
    return labels[intent];
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
          Health Scribe
        </h2>
        <p className="text-[var(--color-stone)]">
          Your intelligent health diary. I'll help track your well-being and create a record for your doctors.
        </p>
      </div>

      {isHealthMode && (
        <Card className="border-2 border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5">
          <div className="flex items-center gap-3 mb-2">
            {detectedIntent && getIntentIcon(detectedIntent)}
            <div>
              <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
                Clinician Support Mode Active
              </h3>
              <p className="text-sm text-[var(--color-stone)]">
                {detectedIntent && getIntentLabel(detectedIntent)} detected
              </p>
            </div>
          </div>
          <p className="text-sm text-[var(--color-stone)]">
            I've detected a health-related topic. I'll ask some follow-up questions to create a complete record.
          </p>
        </Card>
      )}

      {!isRecording && !isHealthMode && (
        <Card className="text-center py-8">
          <Heart size={48} className="mx-auto text-[var(--color-sage)] mb-4" />
          <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-2">
            Ready to track your health
          </h3>
          <p className="text-[var(--color-stone)] mb-6">
            Start speaking about how you're feeling, any symptoms, medications, or health concerns.
            I'll automatically detect health topics and ask helpful follow-up questions.
          </p>
          <Button onClick={startRecording} icon={<Mic size={20} />} size="lg">
            Start Health Check
          </Button>
        </Card>
      )}

      {isRecording && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-[var(--color-agitated)] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-charcoal)]">Recording...</span>
          </div>
          
          {followUpQuestions.length > 0 && currentQuestionIndex < followUpQuestions.length && (
            <div className="mb-4 p-4 bg-[var(--color-terracotta)]/10 rounded-xl border-2 border-[var(--color-terracotta)]">
              <p className="text-sm text-[var(--color-stone)] mb-2">Question {currentQuestionIndex + 1} of {followUpQuestions.length}:</p>
              <p className="text-lg font-medium text-[var(--color-charcoal)]">
                {followUpQuestions[currentQuestionIndex]}
              </p>
            </div>
          )}
          
          <div className="p-4 bg-[var(--color-sand)] rounded-xl mb-4">
            <p className="text-[var(--color-charcoal)] leading-relaxed">
              {currentTranscript || 'Listening...'}
              <span className="inline-block w-2 h-5 bg-[var(--color-sage)] ml-1 animate-pulse" />
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={stopRecording}
              variant="secondary"
              icon={<MicOff size={20} />}
              fullWidth
            >
              Stop Recording
            </Button>
          </div>
        </Card>
      )}

      {!isRecording && currentTranscript && isHealthMode && (
        <Card>
          <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-4">
            Your Response
          </h3>
          
          <div className="p-4 bg-[var(--color-sand)] rounded-xl mb-4">
            <p className="text-[var(--color-charcoal)] leading-relaxed">{currentTranscript}</p>
          </div>
          
          {followUpResponses.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-[var(--color-stone)] mb-2">Previous responses:</p>
              {followUpResponses.map((r, idx) => (
                <div key={idx} className="p-3 bg-[var(--color-sand)] rounded-lg">
                  <p className="text-xs text-[var(--color-stone)] mb-1">{r.question}</p>
                  <p className="text-sm text-[var(--color-charcoal)]">{r.response}</p>
                </div>
              ))}
            </div>
          )}
          
          <Button
            onClick={answerFollowUp}
            fullWidth
            icon={currentQuestionIndex >= followUpQuestions.length ? <CheckCircle2 size={18} /> : undefined}
          >
            {currentQuestionIndex >= followUpQuestions.length 
              ? 'Save Health Entry' 
              : 'Continue to Next Question'}
          </Button>
        </Card>
      )}

      {isProcessing && (
        <Card className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--color-sage)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-stone)]">Saving your health entry...</p>
        </Card>
      )}

      {medicalJournal && medicalJournal.entries.length > 0 && (
        <Card>
          <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-4">
            Recent Health Entries
          </h3>
          <div className="space-y-3">
            {medicalJournal.entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="p-4 bg-[var(--color-sand)] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getIntentIcon(entry.intent)}
                    <span className="font-medium text-[var(--color-charcoal)]">
                      {getIntentLabel(entry.intent)}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-stone)]">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-charcoal)] mb-2">{entry.primaryConcern}</p>
                {entry.painLevel && (
                  <div className="text-xs text-[var(--color-stone)]">
                    Pain level: {entry.painLevel}/10
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

