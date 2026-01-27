'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Mic, MicOff, Send } from '@/components/icons';
import { processSpeechResult } from '@/lib/punctuationProcessor';
import { extractHealthInfo, createHealthCard } from '@/lib/healthExtraction';
import { calculateCLIScore } from '@/lib/cliScoring';
import { generateSageResponse } from '@/lib/openaiApi';
import { speakText, waitForVoices } from '@/lib/textToSpeech';
import type { TalkMessage, TalkSession, HealthCard } from '@/types';

const SAGE_INITIAL = "Hi! How are you doing today?";

export function Talk() {
  const { 
    addTalkSession, 
    setActiveTab,
    addHealthCard,
    confirmHealthCard
  } = useStore();
  
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [messages, setMessages] = useState<TalkMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<TalkSession | null>(null);
  const [pendingHealthCard, setPendingHealthCard] = useState<{ id: string; category: string; description: string } | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  
  const transcriptBuilderRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const lastSageMessageTimeRef = useRef<number | null>(null);

  // Check if Web Speech API is supported
  const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  // Start conversation
  const startConversation = useCallback(async () => {
    setIsConversationStarted(true);
    
    // Create initial session
    const sessionId = crypto.randomUUID();
    const initialMessage: TalkMessage = {
      id: crypto.randomUUID(),
      role: 'sage',
      content: SAGE_INITIAL,
      timestamp: new Date(),
      spoken: false
    };
    
    const newSession: TalkSession = {
      id: sessionId,
      timestamp: new Date(),
      messages: [initialMessage],
      transcript: SAGE_INITIAL,
      cliScore: null,
      cliBreakdown: null,
      status: 'active',
      duration: 0
    };
    
    setCurrentSession(newSession);
    setMessages([initialMessage]);
    sessionStartTimeRef.current = Date.now();
    lastSageMessageTimeRef.current = Date.now();
    
    // Speak initial message via TTS
    try {
      await waitForVoices();
      await speakText(SAGE_INITIAL);
      // Mark as spoken
      initialMessage.spoken = true;
    } catch (error) {
      console.error('Error speaking initial message:', error);
    }
  }, []);


  const startRecording = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    setIsRecording(true);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

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

      if (finalTranscript) {
        const existingText = transcriptBuilderRef.current;
        const processedFinal = processSpeechResult(finalTranscript.trim(), '', existingText);
        transcriptBuilderRef.current = processedFinal;
      }

      const displayText = processSpeechResult('', interimTranscript, transcriptBuilderRef.current);
      setCurrentTranscript(displayText.trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }

    const finalTranscript = transcriptBuilderRef.current.trim();
    
    if (finalTranscript.length > 0 && currentSession) {
      // Add user message
      const userMessage: TalkMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: finalTranscript,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Extract health information
      const healthInfo = extractHealthInfo(finalTranscript);
      
      if (healthInfo.length > 0 && !pendingHealthCard) {
        // Create pending health card for first detected health info
        const healthCardData = createHealthCard(healthInfo[0], currentSession.id);
        const healthCardId = crypto.randomUUID();
        setPendingHealthCard({
          id: healthCardId,
          category: healthInfo[0].category,
          description: healthInfo[0].description
        });
        // Health card will be confirmed/rejected by user
      }
      
      // Generate Sage response using OpenAI API
      setIsGeneratingResponse(true);
      try {
        // Build conversation history for context
        const conversationHistory = updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Call OpenAI API
        const sageResponse = await generateSageResponse(finalTranscript, conversationHistory);
        
        const sageMessage: TalkMessage = {
          id: crypto.randomUUID(),
          role: 'sage',
          content: sageResponse,
          timestamp: new Date(),
          spoken: false
        };
        
        const finalMessages = [...updatedMessages, sageMessage];
        setMessages(finalMessages);
        
        // Update session
        const updatedSession: TalkSession = {
          ...currentSession,
          messages: finalMessages,
          transcript: finalMessages.map(m => `${m.role === 'sage' ? 'Sage' : 'User'}: ${m.content}`).join('\n')
        };
        setCurrentSession(updatedSession);
        
        // Speak Sage response via TTS
        try {
          await waitForVoices();
          await speakText(sageResponse);
          sageMessage.spoken = true;
        } catch (error) {
          console.error('Error speaking response:', error);
        }
        
        lastSageMessageTimeRef.current = Date.now();
      } catch (error) {
        console.error('Error generating Sage response:', error);
        // Fallback response if API fails
        const fallbackMessage: TalkMessage = {
          id: crypto.randomUUID(),
          role: 'sage',
          content: "I'm sorry, I'm having trouble responding right now. Could you try again?",
          timestamp: new Date(),
          spoken: false
        };
        const finalMessages = [...updatedMessages, fallbackMessage];
        setMessages(finalMessages);
        setCurrentSession({
          ...currentSession,
          messages: finalMessages,
          transcript: finalMessages.map(m => `${m.role === 'sage' ? 'Sage' : 'User'}: ${m.content}`).join('\n')
        });
      } finally {
        setIsGeneratingResponse(false);
      }
      
      // Clear transcript for next turn
      setCurrentTranscript('');
      transcriptBuilderRef.current = '';
    }
  }, [currentSession, messages, pendingHealthCard]);

  const handleEndConversation = useCallback(() => {
    setIsRecording(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    if (currentSession && sessionStartTimeRef.current) {
      // Calculate final CLI score
      const duration = (Date.now() - sessionStartTimeRef.current) / 1000;
      const cliResult = calculateCLIScore(
        currentSession.messages,
        duration,
        0, // pauses - would need to track this
        0  // filler words - would need to track this
      );
      
      // Complete session
      const completedSession: TalkSession = {
        ...currentSession,
        status: 'completed',
        duration,
        cliScore: cliResult.overall,
        cliBreakdown: cliResult.breakdown
      };
      
      addTalkSession(completedSession);
      
      // Reset state
      setCurrentSession(null);
      setMessages([]);
      setIsConversationStarted(false);
      setCurrentTranscript('');
      transcriptBuilderRef.current = '';
      setPendingHealthCard(null);
      
      // Redirect to home
      setActiveTab('home');
    }
  }, [currentSession, addTalkSession, setActiveTab]);

  const handleConfirmHealthCard = useCallback(() => {
    if (pendingHealthCard && currentSession) {
      const healthInfo = extractHealthInfo(pendingHealthCard.description);
      
      if (healthInfo.length > 0) {
        const healthCardData = createHealthCard(healthInfo[0], currentSession.id);
        addHealthCard({
          ...healthCardData,
          id: pendingHealthCard.id,
          confirmed: true
        });
      }
      
      setPendingHealthCard(null);
    }
  }, [pendingHealthCard, currentSession, addHealthCard]);

  const handleRejectHealthCard = useCallback(() => {
    setPendingHealthCard(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up recognition:', error);
        }
      }
    };
  }, []);

  if (!isConversationStarted) {
    return (
      <div className="space-y-6 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
            Talk
          </h2>
          <p className="text-[var(--color-stone)]">
            Have a natural conversation with Sage. Just talk about whatever is on your mind.
          </p>
        </div>

        <Card className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center">
            <MessageCircle size={40} className="text-white" />
          </div>
          <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-2">
            Ready to chat?
          </h3>
          <p className="text-[var(--color-stone)] mb-6">
            Start a conversation and talk about anything you'd like.
          </p>
          <Button
            onClick={startConversation}
            size="lg"
            className="w-full"
          >
            Start Conversation
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
          Talk
        </h2>
        <p className="text-[var(--color-stone)]">
          Having a conversation with Sage
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-4 ${message.role === 'sage' ? 'bg-[var(--color-sand)]' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'sage' 
                      ? 'bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)]'
                      : 'bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)]'
                  }`}>
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[var(--color-charcoal)] mb-1">
                      {message.role === 'sage' ? 'Sage' : 'You'}
                    </p>
                    <p className="text-[var(--color-stone)] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pending Health Card Confirmation */}
      {pendingHealthCard && (
        <Card className="p-4 bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sand)] border-2 border-[var(--color-sage)]">
          <p className="text-sm text-[var(--color-charcoal)] mb-3">
            You mentioned something about <strong>{pendingHealthCard.category}</strong>. 
            Is it okay if I remember that?
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleConfirmHealthCard}
              size="sm"
              className="flex-1"
            >
              Yes, remember it
            </Button>
            <Button
              onClick={handleRejectHealthCard}
              size="sm"
              variant="secondary"
              className="flex-1"
            >
              No, don't save
            </Button>
          </div>
        </Card>
      )}

      {/* User Response Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[var(--color-charcoal)]">Your Response</h3>
            {isRecording && (
              <div className="flex items-center gap-2 text-[var(--color-sage)]">
                <div className="w-2 h-2 rounded-full bg-[var(--color-sage)] animate-pulse" />
                <span className="text-sm">Listening...</span>
              </div>
            )}
            {isGeneratingResponse && (
              <div className="flex items-center gap-2 text-[var(--color-terracotta)]">
                <div className="w-2 h-2 rounded-full bg-[var(--color-terracotta)] animate-pulse" />
                <span className="text-sm">Sage is thinking...</span>
              </div>
            )}
          </div>

          {currentTranscript ? (
            <div className="p-4 bg-[var(--color-sand)] rounded-xl">
              <p className="text-[var(--color-charcoal)]">{currentTranscript}</p>
            </div>
          ) : (
            <div className="p-4 bg-[var(--color-sand)] rounded-xl min-h-[60px] flex items-center justify-center">
              <p className="text-[var(--color-stone)] text-sm">
                {isRecording ? 'Speak now...' : 'Click the microphone to start speaking'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="flex-1"
                size="lg"
                disabled={isGeneratingResponse}
              >
                <Mic size={20} className="mr-2" />
                Speak
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="flex-1"
                size="lg"
                variant="secondary"
              >
                <MicOff size={20} className="mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* End Conversation Button */}
      <Button
        onClick={handleEndConversation}
        className="w-full"
        variant="secondary"
        size="lg"
      >
        End Conversation
      </Button>
    </div>
  );
}
