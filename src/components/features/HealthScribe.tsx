'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Mic, MicOff, MessageCircle, Share2, X } from '@/components/icons';
import { processSpeechResult } from '@/lib/punctuationProcessor';
import type { HealthEntry, HealthIntent } from '@/types';

const SAGE_INITIAL = "How can I help you today? Please tell me about any health concerns.";
const USER_RESPONSE_1 = "my knees are hurting";
const SAGE_RESPONSE_1 = "I'm sorry about the knee pain. Have your knees been hurting for a long time, or is this more recent?";
const USER_RESPONSE_2 = "it started this morning";
const SAGE_RESPONSE_2 = "Is the pain worse when you walk or stand, or is it there even when you're resting?";
const USER_RESPONSE_3 = "it hurts when they start to walk";
const SAGE_RESPONSE_3 = "Oh, I'm sorry about that. I hope it gets better soon. In the meantime, it would be beneficial for you to tell your caregiver or doctor.";

type ConversationStep = 'initial' | 'response1' | 'response2' | 'response3' | 'complete';

export function HealthScribe() {
  const { user, addHealthEntry, shareHealthEntryToFamily } = useStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversationStep, setConversationStep] = useState<ConversationStep>('initial');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [healthEntry, setHealthEntry] = useState<HealthEntry | null>(null);
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
    
    if (finalTranscript.length > 0) {
      // Store the response
      const newResponses = [...userResponses, finalTranscript];
      setUserResponses(newResponses);
      
      // Move to next conversation step
      if (conversationStep === 'initial') {
        setConversationStep('response1');
      } else if (conversationStep === 'response1') {
        setConversationStep('response2');
      } else if (conversationStep === 'response2') {
        setConversationStep('response3');
      } else if (conversationStep === 'response3') {
        setConversationStep('complete');
      }
      
      // Clear transcript for next step
      setCurrentTranscript('');
      transcriptBuilderRef.current = '';
    }
  }, [conversationStep, userResponses]);

  const handleEndConversation = useCallback(async () => {
    // Stop recording if active
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }

    // Create structured health entry from conversation
    if (userResponses.length > 0) {
      setIsProcessing(true);
      
      const primaryConcern = userResponses[0] || '';
      const followUpQuestions = [];
      
      // First follow-up: How long has it been hurting?
      if (userResponses.length >= 2) {
        followUpQuestions.push({
          question: SAGE_RESPONSE_1,
          response: userResponses[1] || '',
          timestamp: new Date()
        });
      }
      
      // Second follow-up: When does it occur?
      if (userResponses.length >= 3) {
        followUpQuestions.push({
          question: SAGE_RESPONSE_2,
          response: userResponses[2] || '',
          timestamp: new Date()
        });
      }
      
      const healthEntry: HealthEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        intent: 'pain' as HealthIntent,
        primaryConcern: primaryConcern,
        followUpQuestions: followUpQuestions,
        painLevel: undefined,
        notes: '',
        tags: ['knee pain', 'joint pain']
      };
      
      addHealthEntry(healthEntry);
      setHealthEntry(healthEntry);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsProcessing(false);
      
      // Show summary
      setShowSummary(true);
    } else {
      // If no responses, just reset
      setConversationStep('initial');
      setCurrentTranscript('');
      transcriptBuilderRef.current = '';
      setUserResponses([]);
      setStartTime(null);
    }
  }, [userResponses, addHealthEntry]);

  const formatShareText = useCallback((entry: HealthEntry | null, responses: string[]) => {
    const userName = user?.preferredName || user?.name || 'User';
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let shareText = `Health Update for ${userName}\n`;
    shareText += `Date: ${date}\n\n`;
    shareText += `PRIMARY CONCERN:\n${responses[0] || entry?.primaryConcern || 'Not specified'}\n\n`;
    
    if (entry && entry.followUpQuestions.length > 0) {
      entry.followUpQuestions.forEach((qa) => {
        shareText += `QUESTION: ${qa.question}\n`;
        shareText += `RESPONSE: ${qa.response}\n\n`;
      });
    } else if (responses.length >= 2) {
      shareText += `QUESTION: ${SAGE_RESPONSE_1}\n`;
      shareText += `RESPONSE: ${responses[1]}\n\n`;
      
      if (responses.length >= 3) {
        shareText += `QUESTION: ${SAGE_RESPONSE_2}\n`;
        shareText += `RESPONSE: ${responses[2]}\n\n`;
      }
    }

    shareText += `\nRECOMMENDATION:\nPlease share this information with your caregiver or doctor.\n`;
    shareText += `Generated by Sage Health Scribe`;

    return shareText;
  }, [user]);

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleShareToFamilyMember = useCallback((memberUsername: string) => {
    if (!healthEntry) return;
    
    shareHealthEntryToFamily(healthEntry, memberUsername);
    setShowShareModal(false);
    alert('Health entry shared successfully!');
  }, [healthEntry, shareHealthEntryToFamily]);

  const connectedFamilyMembers = user?.familyMembers?.filter(m => m.username) || [];

  const handleBackToConversation = () => {
    setShowSummary(false);
    setHealthEntry(null);
    setConversationStep('initial');
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    setUserResponses([]);
    setStartTime(null);
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
    } else if (conversationStep === 'response2') {
      return SAGE_RESPONSE_2;
    } else if (conversationStep === 'response3' || conversationStep === 'complete') {
      return SAGE_RESPONSE_3;
    }
    return '';
  };

  const sageMessage = getSageMessage();

  // Show summary if available
  if (showSummary && healthEntry) {
    const shareText = formatShareText(healthEntry, userResponses);
    
    return (
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
            Health Summary
          </h2>
          <p className="text-[var(--color-stone)]">
            Your health information has been saved. Share it with your family member or caregiver.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[var(--color-charcoal)] mb-2">Primary Concern</h3>
              <p className="text-[var(--color-stone)]">{healthEntry.primaryConcern}</p>
            </div>

            {healthEntry.followUpQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-[var(--color-charcoal)] mb-2">Follow-up Questions</h3>
                {healthEntry.followUpQuestions.map((qa, index) => (
                  <div key={index} className="p-4 bg-[var(--color-sand)] rounded-xl">
                    <p className="text-sm font-medium text-[var(--color-stone)] mb-2">{qa.question}</p>
                    <p className="text-[var(--color-charcoal)]">{qa.response}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sand)] rounded-xl">
              <p className="text-sm font-medium text-[var(--color-charcoal)] mb-2">Recommendation</p>
              <p className="text-[var(--color-stone)]">Please share this information with your caregiver or doctor.</p>
            </div>
          </div>
        </Card>

        {/* Share Button */}
        <Button
          onClick={handleShareClick}
          className="w-full"
          size="lg"
          disabled={connectedFamilyMembers.length === 0}
        >
          <Share2 size={20} className="mr-2" />
          Share with Family Member
        </Button>

        {connectedFamilyMembers.length === 0 && (
          <Card className="p-4 bg-[var(--color-sand)]">
            <p className="text-sm text-[var(--color-stone)]">
              No connected family members found. Add a family member with their username to enable sharing.
            </p>
          </Card>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-bold text-[var(--color-charcoal)]">
                  Share with Family Member
                </h3>
                <button onClick={() => setShowShareModal(false)}>
                  <X size={20} className="text-[var(--color-stone)]" />
                </button>
              </div>
              
              <div className="space-y-3">
                {connectedFamilyMembers.map((member) => (
                  <Button
                    key={member.id}
                    onClick={() => handleShareToFamilyMember(member.username!)}
                    className="w-full"
                    variant="secondary"
                  >
                    Share with {member.name} ({member.relationship})
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Back Button */}
        <Button
          onClick={handleBackToConversation}
          className="w-full"
          variant="secondary"
          size="lg"
        >
          Start New Conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
          Health Scribe
        </h2>
        <p className="text-[var(--color-stone)]">
          Your intelligent health diary. I'll help track your well-being and create a record for your doctors.
        </p>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <Card className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--color-sage)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-stone)]">Saving your health entry...</p>
        </Card>
      )}

      {/* Sage's Messages */}
      {!isProcessing && (
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
      )}

      {/* User Response Area */}
      {!isProcessing && (
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
      )}

      {/* End Conversation Button */}
      {!isProcessing && (
        <Button
          onClick={handleEndConversation}
          className="w-full"
          variant="secondary"
          size="lg"
        >
          End Conversation
        </Button>
      )}

      {/* Info Card */}
      {!isProcessing && (
        <Card className="p-4 bg-[var(--color-sand)]">
          <p className="text-sm text-[var(--color-stone)]">
            Share your health concerns and I'll create a structured record that you can easily share with your family members or healthcare providers.
          </p>
        </Card>
      )}
    </div>
  );
}
