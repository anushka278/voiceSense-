'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button, FloatingButton } from '@/components/ui/Button';
import { Mic, MicOff, VoiceWave, EmotionIcon, Play, Pause, RefreshCw, Info, Share2, X } from '@/components/icons';
import { analyzeSpeech, calculateLanguageComplexityScore } from '@/lib/speechAnalysis';
import { detectHealthIntent } from '@/lib/healthIntentDetection';
import { processSpeechResult } from '@/lib/punctuationProcessor';
import type { SpeechAnalysis, EmotionalState } from '@/types';

// Removed hardcoded transcript - using real voice recognition only

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
    user,
    speechAnalyses
  } = useStore();
  
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<SpeechAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAnalysisInfo, setShowAnalysisInfo] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBuilderRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  
  // Check if Web Speech API is supported
  const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  // Share transcript function
  const shareTranscript = useCallback(async (transcript: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sage Transcript',
          text: transcript,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(transcript);
        alert('Transcript copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy transcript:', error);
      }
    }
  }, []);

  // Start recording with Web Speech API or fallback
  const startRecording = useCallback(async () => {
    // Stop any ongoing speech
    
    // Reset all state for a new recording
    setIsRecording(true);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    setDuration(0);
    setShowResults(false);
    setErrorMessage(null);
    setLastAnalysis(null);
    
    // Clear any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Start timer
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    
    // Check if Web Speech API is supported
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage('Your browser does not support voice recognition. Please use Chrome, Edge, or Safari.');
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    // Use Web Speech API
    setUseFallback(false);
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show results as you speak
    recognition.lang = 'en-US'; // Language
    
    // Handle results
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Process with punctuation
      if (finalTranscript) {
        // Get the current text before adding new final transcript
        const existingText = transcriptBuilderRef.current;
        // Process the new final transcript with punctuation
        const processedFinal = processSpeechResult(finalTranscript.trim(), '', existingText);
        transcriptBuilderRef.current = processedFinal;
      }
      
      // Combine with interim transcript for display
      const displayText = processSpeechResult('', interimTranscript, transcriptBuilderRef.current);
      setCurrentTranscript(displayText);
    };
    
    // Handle errors
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMsg = 'Speech recognition error occurred.';
      switch (event.error) {
        case 'no-speech':
          errorMsg = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMsg = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMsg = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          // User stopped, not really an error
          return;
        default:
          errorMsg = `Speech recognition error: ${event.error}`;
      }
      
      setErrorMessage(errorMsg);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Auto-stop after error
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Ignore errors when stopping
          }
        }
      }, 100);
    };
    
    // Handle end - only update state if we're actually recording
    recognition.onend = () => {
      // Don't automatically set isRecording to false here
      // Let the user control it via the stop button
      if (timerRef.current) clearInterval(timerRef.current);
    };
    
    // Start recognition
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setErrorMessage('Failed to start speech recognition. Please try again.');
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [setIsRecording, setCurrentTranscript]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    
    // Stop Web Speech API recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop fallback simulation
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
    }
    
    // Use the final transcript from the ref
    const finalTranscript = transcriptBuilderRef.current || currentTranscript;
    
    if (finalTranscript.trim().length < 10) {
      setErrorMessage('Please speak for at least a few seconds.');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use final transcript for analysis
    const transcriptToAnalyze = finalTranscript;
    const analysisData = analyzeSpeech(transcriptToAnalyze, duration);
    const analysis: SpeechAnalysis = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...analysisData
    };
    
    setLastAnalysis(analysis);
    setCurrentEmotionalState(analysis.emotionalState);
    addSpeechAnalysis(analysis);
    
    // Detect health intent and suggest Health Scribe
    const healthIntent = detectHealthIntent(transcriptToAnalyze);
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
    setErrorMessage(null);
  }, [currentTranscript, duration, setIsRecording, setCurrentEmotionalState, addSpeechAnalysis, addInsight, setIsHealthMode, setActiveTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (transcriptIntervalRef.current) clearInterval(transcriptIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
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
              : isSpeechRecognitionSupported()
                ? "Tap the microphone to start a conversation"
                : "Your browser doesn't support voice recording. Using demo mode."}
          </p>
          
          {/* Error message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[var(--color-agitated)]/10 border border-[var(--color-agitated)] rounded-xl"
            >
              <p className="text-sm text-[var(--color-agitated)]">{errorMessage}</p>
            </motion.div>
          )}
          
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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
                    Analysis Complete
                  </h3>
                  <button
                    onClick={() => setShowAnalysisInfo(true)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-sage)]/10 text-[var(--color-sage)] hover:bg-[var(--color-sage)]/20 transition-colors"
                    title="How is this calculated?"
                  >
                    <Info size={14} />
                  </button>
                </div>
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[var(--color-stone)]">
                  Full Transcript
                </h3>
                <button
                  onClick={() => shareTranscript(lastAnalysis.transcript)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-sage-light)] transition-colors"
                  title="Share transcript"
                >
                  <Share2 size={16} />
                </button>
              </div>
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
                  setLastAnalysis(null);
                  transcriptBuilderRef.current = '';
                  setDuration(0);
                  setErrorMessage(null);
                  // Reset recognition ref to allow new recording
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch (e) {
                      // Ignore
                    }
                    recognitionRef.current = null;
                  }
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

      {/* Analysis Info Modal */}
      <AnimatePresence>
        {showAnalysisInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnalysisInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-bold text-[var(--color-charcoal)]">
                  How Analysis is Calculated
                </h3>
                <button
                  onClick={() => setShowAnalysisInfo(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-sage-light)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-[var(--color-charcoal)]">
                <div>
                  <h4 className="font-semibold mb-2">Language Complexity Score (0-100)</h4>
                  <p className="text-sm text-[var(--color-stone)]">
                    Calculated using Flesch-Kincaid Grade Level, vocabulary complexity, and grammar consistency. 
                    Higher scores indicate more complex language use.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Vocabulary Complexity</h4>
                  <p className="text-sm text-[var(--color-stone)]">
                    Measures the ratio of unique words, complex words (longer than 6 characters), and average word length. 
                    More diverse vocabulary = higher score.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Grammar Consistency</h4>
                  <p className="text-sm text-[var(--color-stone)]">
                    Analyzes sentence structure, proper use of grammar rules, and consistency in language patterns.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Speech Rate (WPM)</h4>
                  <p className="text-sm text-[var(--color-stone)]">
                    Calculated by dividing total words spoken by the duration of the recording in minutes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Repetitions</h4>
                  <p className="text-sm text-[var(--color-stone)]">
                    Counts repeated 3-word phrases within the transcript. Higher counts may indicate memory or attention challenges.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Emotional State</h4>
                  <p className="text-sm text-[var(--color-stone)]">
                    Detected through keyword analysis, speech patterns, and sentiment indicators in your words.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

