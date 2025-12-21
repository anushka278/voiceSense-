'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button, FloatingButton } from '@/components/ui/Button';
import { Mic, MicOff, VoiceWave, EmotionIcon, Play, Pause, RefreshCw } from '@/components/icons';
import { analyzeSpeech, calculateLanguageComplexityScore } from '@/lib/speechAnalysis';
import { detectHealthIntent } from '@/lib/healthIntentDetection';
import type { SpeechAnalysis, EmotionalState } from '@/types';

// Hardcoded transcript script
const HARDCODED_TRANSCRIPT = "I had a wonderful morning today. I ate breakfast and then went for a walk, but partway through, my knee started to hurt.";

export function VoiceRecorder() {
  const { 
    isRecording, 
    setIsRecording, 
    currentTranscript, 
    setCurrentTranscript,
    currentEmotionalState,
    setCurrentEmotionalState,
    addSpeechAnalysis,
    addInsight,
    setIsHealthMode,
    setActiveTab,
    user
  } = useStore();
  
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<SpeechAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBuilderRef = useRef<string>('');

  // Simulate recording with demo transcripts
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    setDuration(0);
    setShowResults(false);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    
    // Simulate transcript generation with hardcoded script
    // Target: 110 words per minute = ~545ms per word
    const words = HARDCODED_TRANSCRIPT.split(' ');
    let currentWordIndex = 0;
    
    transcriptIntervalRef.current = setInterval(() => {
      if (currentWordIndex < words.length) {
        transcriptBuilderRef.current = transcriptBuilderRef.current 
          + (transcriptBuilderRef.current ? ' ' : '') 
          + words[currentWordIndex];
        setCurrentTranscript(transcriptBuilderRef.current);
        currentWordIndex++;
      }
    }, 545); // ~110 wpm (60 seconds / 110 words = 0.545 seconds per word)
  }, [setIsRecording, setCurrentTranscript]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
    }
    
    if (currentTranscript.length < 10) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysisData = analyzeSpeech(currentTranscript, duration);
    const analysis: SpeechAnalysis = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...analysisData
    };
    
    setLastAnalysis(analysis);
    setCurrentEmotionalState(analysis.emotionalState);
    addSpeechAnalysis(analysis);
    
    // Detect health intent and suggest Health Scribe
    const healthIntent = detectHealthIntent(currentTranscript);
    if (healthIntent) {
      addInsight({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'pattern',
        severity: 'info',
        title: 'Health Topic Detected',
        description: `I noticed you mentioned something about ${healthIntent}. Would you like to use Health Scribe to track this?`,
        recommendation: 'Health Scribe can help create a detailed record for your doctors.'
      });
      // Optionally auto-switch to health mode
      // setIsHealthMode(true);
      // setActiveTab('health');
    }
    
    // Generate insight if notable patterns detected
    if (analysis.metrics.repetitionCount > 2) {
      addInsight({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'language',
        severity: 'notable',
        title: 'Increased Repetition Detected',
        description: `${analysis.metrics.repetitionCount} repeated phrases were detected in this conversation.`,
        recommendation: 'This is common and may indicate topic emphasis or mild memory loop.'
      });
    }
    
    setIsProcessing(false);
    setShowResults(true);
  }, [currentTranscript, duration, setIsRecording, setCurrentEmotionalState, addSpeechAnalysis, addInsight, setIsHealthMode, setActiveTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (transcriptIntervalRef.current) clearInterval(transcriptIntervalRef.current);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'var(--color-sage)';
    if (score >= 50) return 'var(--color-terracotta)';
    return 'var(--color-agitated)';
  };

  return (
    <div className="space-y-6">
      {/* Main recording interface */}
      <Card className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
            {isRecording ? "I'm listening..." : "Ready to listen"}
          </h2>
          <p className="text-[var(--color-stone)] mb-8">
            {isRecording 
              ? "Speak naturally, take your time" 
              : "Tap the microphone to start a conversation"}
          </p>
          
          {/* Voice visualization */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={isRecording ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 2 }}
              className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isRecording 
                  ? 'bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)]' 
                  : 'bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)]'
              }`}
            >
              {isRecording ? (
                <VoiceWave isActive={true} size="lg" />
              ) : (
                <Mic size={48} className="text-white" />
              )}
            </motion.div>
          </div>
          
          {/* Duration */}
          {isRecording && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-display font-bold text-[var(--color-charcoal)] mb-6"
            >
              {formatDuration(duration)}
            </motion.p>
          )}
          
          {/* Control buttons */}
          <div className="flex justify-center gap-4">
            {!isRecording && !isProcessing && !showResults && (
              <Button
                onClick={startRecording}
                size="lg"
                icon={<Mic size={24} />}
              >
                Start Speaking
              </Button>
            )}
            
            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="secondary"
                size="lg"
                icon={<MicOff size={24} />}
              >
                Stop Recording
              </Button>
            )}
            
            {isProcessing && (
              <Button disabled loading size="lg">
                Analyzing speech...
              </Button>
            )}
          </div>
        </motion.div>
      </Card>
      
      {/* Live transcript */}
      <AnimatePresence>
        {(isRecording || currentTranscript) && !showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <h3 className="text-sm font-medium text-[var(--color-stone)] mb-2">
                Live Transcript
              </h3>
              <p className="text-lg text-[var(--color-charcoal)] leading-relaxed">
                {currentTranscript || "Listening..."}
                {isRecording && (
                  <span className="inline-block w-2 h-5 bg-[var(--color-sage)] ml-1 animate-pulse" />
                )}
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Results */}
      <AnimatePresence>
        {showResults && lastAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
                  Analysis Complete
                </h3>
                <span className="flex items-center gap-2 text-sm text-[var(--color-stone)]">
                  <EmotionIcon emotion={lastAnalysis.emotionalState} size={20} />
                  <span className="capitalize">{lastAnalysis.emotionalState}</span>
                </span>
              </div>
              
              {/* Complexity Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--color-stone)]">Language Complexity</span>
                  <span 
                    className="text-2xl font-display font-bold"
                    style={{ color: getScoreColor(calculateLanguageComplexityScore(lastAnalysis)) }}
                  >
                    {calculateLanguageComplexityScore(lastAnalysis)}
                  </span>
                </div>
                <div className="h-3 bg-[var(--color-sand)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateLanguageComplexityScore(lastAnalysis)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getScoreColor(calculateLanguageComplexityScore(lastAnalysis)) }}
                  />
                </div>
              </div>
              
              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--color-sand)] rounded-xl">
                  <p className="text-xs text-[var(--color-stone)]">Speech Rate</p>
                  <p className="text-lg font-semibold text-[var(--color-charcoal)]">
                    {lastAnalysis.metrics.speechRate} <span className="text-xs">wpm</span>
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-sand)] rounded-xl">
                  <p className="text-xs text-[var(--color-stone)]">Vocabulary</p>
                  <p className="text-lg font-semibold text-[var(--color-charcoal)]">
                    {lastAnalysis.metrics.vocabularyComplexity}%
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-sand)] rounded-xl">
                  <p className="text-xs text-[var(--color-stone)]">Grammar</p>
                  <p className="text-lg font-semibold text-[var(--color-charcoal)]">
                    {lastAnalysis.metrics.grammarConsistency}%
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-sand)] rounded-xl">
                  <p className="text-xs text-[var(--color-stone)]">Repetitions</p>
                  <p className="text-lg font-semibold text-[var(--color-charcoal)]">
                    {lastAnalysis.metrics.repetitionCount}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Transcript card */}
            <Card>
              <h3 className="text-sm font-medium text-[var(--color-stone)] mb-2">
                Full Transcript
              </h3>
              <p className="text-[var(--color-charcoal)] leading-relaxed">
                {lastAnalysis.transcript}
              </p>
            </Card>
            
            {/* New session button */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setShowResults(false);
                  setCurrentTranscript('');
                  setDuration(0);
                }}
                variant="secondary"
                icon={<RefreshCw size={18} />}
              >
                New Conversation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

