'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Mic, MicOff } from '@/components/icons';
import { analyzeSpeech } from '@/lib/speechAnalysis';
import { processSpeechResult } from '@/lib/punctuationProcessor';
import type { SpeechAnalysis } from '@/types';

const SAGE_INITIAL = "How is your day going? What are your plans?";
const SAGE_RESPONSE_1 = "That sounds like fun. What movie are you watching?";
const SAGE_RESPONSE_2 = "Home Alone is a great movie! I hope you have lots of fun";

type ConversationStep = 'initial' | 'response1' | 'response2' | 'complete';

export function Speak() {
  const { addSpeechAnalysis, setActiveTab } = useStore();
  const [conversationStep, setConversationStep] = useState<ConversationStep>('initial');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const transcriptBuilderRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);

  // Check if Web Speech API is supported
  const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  const startRecording = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    setIsRecording(true);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    setStartTime(Date.now());

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

  const stopRecording = useCallback(() => {
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
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    if (finalTranscript.length > 0 && duration > 0) {
      // Analyze the speech and save it (will show in Insights)
      const analysisData = analyzeSpeech(finalTranscript, duration);
      const newAnalysis: SpeechAnalysis = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...analysisData
      };
      
      addSpeechAnalysis(newAnalysis);

      // Move to next conversation step
      if (conversationStep === 'initial') {
        setConversationStep('response1');
      } else if (conversationStep === 'response1') {
        setConversationStep('complete');
      }
      
      // Clear transcript for next step
      setCurrentTranscript('');
      transcriptBuilderRef.current = '';
    }
  }, [conversationStep, startTime, addSpeechAnalysis]);

  const handleEndConversation = () => {
    setIsRecording(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    // Redirect to home page
    setActiveTab('home');
  };

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

  const getSageMessage = () => {
    if (conversationStep === 'initial') {
      return SAGE_INITIAL;
    } else if (conversationStep === 'response1') {
      return SAGE_RESPONSE_1;
    } else if (conversationStep === 'response2' || conversationStep === 'complete') {
      return SAGE_RESPONSE_2;
    }
    return '';
  };

  const sageMessage = getSageMessage();

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
          Speak
        </h2>
        <p className="text-[var(--color-stone)]">
          Share your thoughts and memories. Sage listens and analyzes your speech patterns.
        </p>
      </div>

      {/* Sage's Messages */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[var(--color-charcoal)] mb-1">Sage</p>
            <p className="text-[var(--color-stone)] leading-relaxed">{sageMessage}</p>
          </div>
        </div>
      </Card>

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
                >
                  <Mic size={20} className="mr-2" />
                  Start Speaking
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="flex-1"
                  size="lg"
                  variant="secondary"
                >
                  <MicOff size={20} className="mr-2" />
                  Stop Recording
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

      {/* Info Card */}
      <Card className="p-4 bg-[var(--color-sand)]">
        <p className="text-sm text-[var(--color-stone)]">
          As you speak, Sage analyzes speech patterns like the number of words and syllables in each sentence, 
          inspired by the Flesch-Kincaid grade level. This allows the app to track subtle changes through 
          everyday conversation rather than formal testing. View your speech analysis in the Insights tab.
        </p>
      </Card>
    </div>
  );
}
