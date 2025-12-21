'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Mic, MicOff, RefreshCw, CheckCircle2, Clock } from '@/components/icons';
import { processBiographyFromTranscript, generateFollowUpQuestions } from '@/lib/biographyProcessor';
import type { LifeChapter, MemorySession, BiographyEntry } from '@/types';

const lifeChapters: { value: LifeChapter; label: string; icon: string }[] = [
  { value: 'childhood', label: 'Childhood', icon: '👶' },
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'marriage', label: 'Marriage', icon: '💍' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'hobbies', label: 'Hobbies', icon: '🎨' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'achievements', label: 'Achievements', icon: '🏆' },
  { value: 'lessons', label: 'Life Lessons', icon: '📚' }
];

// Demo responses for simulation
const demoResponses: Record<LifeChapter, string[]> = {
  childhood: [
    "I grew up in a small town in the countryside. We had a big garden and I loved playing outside with my siblings.",
    "My mother was a teacher and my father worked at the local factory. We didn't have much, but we were happy.",
    "I remember walking to school every day, rain or shine. It was about a mile away, and I'd meet my friends along the way."
  ],
  career: [
    "I used to be in the military. The work was demanding and structured, and it taught me discipline, teamwork, and resilience. It was a tough chapter of my life, but it shaped who I am today.",
    "I enjoyed the sense of purpose and the strong bond with the people I served with the most. Knowing everyone had each other's backs made even the hardest days manageable."
  ],
  marriage: [
    "We met at a dance in 1965. He asked me to dance and we talked all night. I knew he was special right away.",
    "We got married two years later in the spring. It was a beautiful ceremony with all our family and friends.",
    "We've been together for over 50 years now. Through good times and bad, we've always supported each other."
  ],
  family: [
    "We have three wonderful children. They've all grown up to be kind, successful adults, and I'm so proud of them.",
    "Our grandchildren bring so much joy to our lives. We love spending time with them and watching them grow.",
    "Family has always been the most important thing to me. I'm grateful for every moment we have together."
  ],
  hobbies: [
    "I've always loved gardening. There's something peaceful about working with the earth and watching things grow.",
    "I enjoy reading, especially mystery novels. I can get lost in a good book for hours.",
    "Cooking has been a passion of mine. I love trying new recipes and sharing meals with family and friends."
  ],
  travel: [
    "We traveled to Europe in the 1980s. It was our first big trip together and we saw so many amazing places.",
    "I've always wanted to visit Japan. The culture and history fascinate me, though I haven't made it there yet.",
    "Some of my favorite memories are from road trips with the family. We'd pack up the car and just drive."
  ],
  achievements: [
    "I'm proud of raising three wonderful children who are all doing well in their lives.",
    "I helped organize our community garden, which has brought so many neighbors together.",
    "I learned to use a computer in my 60s, which opened up a whole new world for me."
  ],
  lessons: [
    "I've learned that kindness is the most important thing. A little compassion goes a long way.",
    "Don't be afraid to try new things, even when you're older. You're never too old to learn.",
    "Family and friends are what matter most. Material things come and go, but relationships last forever."
  ]
};

export function BiographyCapture() {
  const {
    user,
    memorySessions,
    biography,
    addMemorySession,
    updateMemorySession,
    addBiographyEntry
  } = useStore();

  const [selectedChapter, setSelectedChapter] = useState<LifeChapter | null>(null);
  const [currentSession, setCurrentSession] = useState<MemorySession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptBuilderRef = useRef<string>('');

  // Proactively suggest memory sessions
  useEffect(() => {
    if (!selectedChapter && memorySessions.length === 0) {
      // Auto-suggest starting a session after 5 seconds
      const timer = setTimeout(() => {
        // Suggest a chapter that hasn't been covered
        const coveredChapters = new Set(memorySessions.map(s => s.chapter));
        const availableChapters = lifeChapters.filter(c => !coveredChapters.has(c.value));
        if (availableChapters.length > 0) {
          // This would trigger a gentle prompt in the UI
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedChapter, memorySessions]);

  const startMemorySession = useCallback((chapter: LifeChapter) => {
    const session: MemorySession = {
      id: crypto.randomUUID(),
      chapter,
      timestamp: new Date(),
      transcript: '',
      questions: [],
      status: 'active'
    };
    
    addMemorySession(session);
    setCurrentSession(session);
    setSelectedChapter(chapter);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    setFollowUpQuestions([]);
    setCurrentQuestionIndex(0);
  }, [addMemorySession]);

  const startRecording = useCallback(() => {
    if (!currentSession) return;
    
    setIsRecording(true);
    setCurrentTranscript('');
    transcriptBuilderRef.current = '';
    
    // Simulate transcript generation
    const responses = demoResponses[currentSession.chapter] || [];
    let selectedResponse: string;
    
    if (currentSession.chapter === 'career') {
      // Check the current question to match specific responses
      const currentQuestion = followUpQuestions[currentQuestionIndex] || 
                              currentSession.questions[currentSession.questions.length]?.question || '';
      const questionLower = currentQuestion.toLowerCase();
      
      // Match specific question to specific response
      // MUST use second response for "What did you enjoy most about that work?"
      if (questionLower.includes('what did you enjoy most') || 
          questionLower.includes('enjoy most') ||
          questionLower.includes('enjoy about') ||
          questionLower.includes('enjoy most about')) {
        // Use the second response: "I enjoyed the sense of purpose..."
        selectedResponse = responses[1] || responses[0];
      } else {
        // Use the first response for initial questions: "I used to be in the military..."
        selectedResponse = responses[0] || '';
      }
    } else {
      // Random selection for other chapters
      selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    }
    
    const words = selectedResponse.split(' ');
    let currentWordIndex = 0;
    
    // 110 wpm = ~545ms per word
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
    }, 545); // ~110 wpm (60 seconds / 110 words = 0.545 seconds per word)
  }, [currentSession, currentQuestionIndex, followUpQuestions]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    
    if (!currentSession || !currentTranscript) return;
    
    // Update session with transcript
    updateMemorySession(currentSession.id, {
      transcript: currentTranscript,
      questions: [
        ...currentSession.questions,
        {
          question: followUpQuestions[currentQuestionIndex] || 'Tell me about this chapter of your life',
          response: currentTranscript,
          timestamp: new Date()
        }
      ]
    });
    
    // Generate empathetic follow-up questions
    const questions = generateFollowUpQuestions(currentSession.chapter, [currentTranscript]);
    setFollowUpQuestions(questions);
    
    setCurrentTranscript('');
  }, [currentSession, currentTranscript, followUpQuestions, currentQuestionIndex, updateMemorySession]);

  const completeSession = useCallback(async () => {
    if (!currentSession) return;
    
    setIsProcessing(true);
    
    // Process the entire session transcript into biography entry
    const fullTranscript = currentSession.questions
      .map(q => `Q: ${q.question}\nA: ${q.response}`)
      .join('\n\n');
    
    const biographyEntry = await processBiographyFromTranscript(
      fullTranscript,
      currentSession.chapter
    );
    
    addBiographyEntry(biographyEntry);
    updateMemorySession(currentSession.id, { status: 'completed' });
    
    setIsProcessing(false);
    setCurrentSession(null);
    setSelectedChapter(null);
    setCurrentTranscript('');
    setFollowUpQuestions([]);
  }, [currentSession, addBiographyEntry, updateMemorySession]);

  const getChapterIcon = (chapter: LifeChapter) => {
    return lifeChapters.find(c => c.value === chapter)?.icon || '📖';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
          Capture Your Life Story
        </h2>
        <p className="text-[var(--color-stone)]">
          Let's preserve your memories together. I'll ask gentle questions to help you share your story.
        </p>
      </div>

      {!currentSession && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-4">
              Choose a chapter to explore
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {lifeChapters.map((chapter) => {
                const hasSession = memorySessions.some(s => s.chapter === chapter.value && s.status === 'completed');
                return (
                  <button
                    key={chapter.value}
                    onClick={() => startMemorySession(chapter.value)}
                    className="p-4 rounded-xl border-2 border-[var(--color-sand)] hover:border-[var(--color-sage)] transition-all text-left"
                  >
                    <div className="text-2xl mb-2">{chapter.icon}</div>
                    <div className="font-medium text-[var(--color-charcoal)]">{chapter.label}</div>
                    {hasSession && (
                      <div className="text-xs text-[var(--color-sage)] mt-1">✓ Completed</div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {biography && biography.entries.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
                  Your Biography Progress
                </h3>
                <span className="text-sm text-[var(--color-stone)]">
                  {biography.entries.length} chapters
                </span>
              </div>
              <div className="space-y-2">
                {biography.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 p-2 bg-[var(--color-sand)] rounded-lg">
                    <span>{getChapterIcon(entry.chapter)}</span>
                    <span className="text-sm text-[var(--color-charcoal)] capitalize">
                      {entry.chapter}
                    </span>
                    <span className="text-xs text-[var(--color-stone)] ml-auto">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {currentSession && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
                  {getChapterIcon(currentSession.chapter)} {lifeChapters.find(c => c.value === currentSession.chapter)?.label}
                </h3>
                <p className="text-sm text-[var(--color-stone)]">
                  Memory Session
                </p>
              </div>
              <Button
                onClick={() => {
                  setCurrentSession(null);
                  setSelectedChapter(null);
                  setCurrentTranscript('');
                }}
                variant="secondary"
                size="sm"
              >
                Back
              </Button>
            </div>

            {currentSession.questions.length > 0 && (
              <div className="mb-4 space-y-2">
                {currentSession.questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-[var(--color-sand)] rounded-lg">
                    <p className="text-sm font-medium text-[var(--color-charcoal)] mb-1">
                      {q.question}
                    </p>
                    <p className="text-sm text-[var(--color-stone)]">{q.response}</p>
                  </div>
                ))}
              </div>
            )}

            {followUpQuestions.length > 0 && currentQuestionIndex < followUpQuestions.length && (
              <div className="mb-4 p-4 bg-[var(--color-sage)]/10 rounded-xl border-2 border-[var(--color-sage)]">
                <p className="text-sm text-[var(--color-stone)] mb-2">Next question:</p>
                <p className="text-lg font-medium text-[var(--color-charcoal)]">
                  {followUpQuestions[currentQuestionIndex]}
                </p>
              </div>
            )}

            {!isRecording && !currentTranscript && (
              <div className="text-center py-4">
                <p className="text-[var(--color-stone)] mb-4">
                  {currentSession.questions.length === 0
                    ? "I'd love to hear about this chapter of your life. When you're ready, start speaking."
                    : "Ready for the next question? Start speaking when you're ready."}
                </p>
                <Button onClick={startRecording} icon={<Mic size={20} />}>
                  Start Speaking
                </Button>
              </div>
            )}

            {isRecording && (
              <div className="space-y-4">
                <Card className="bg-[var(--color-sage)]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-[var(--color-agitated)] rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-[var(--color-charcoal)]">Recording...</span>
                  </div>
                  <p className="text-[var(--color-charcoal)] leading-relaxed">
                    {currentTranscript || 'Listening...'}
                    <span className="inline-block w-2 h-5 bg-[var(--color-sage)] ml-1 animate-pulse" />
                  </p>
                </Card>
                <Button onClick={stopRecording} variant="secondary" icon={<MicOff size={20} />} fullWidth>
                  Stop Recording
                </Button>
              </div>
            )}

            {currentTranscript && !isRecording && (
              <div className="space-y-4">
                <Card>
                  <p className="text-[var(--color-charcoal)] leading-relaxed">{currentTranscript}</p>
                </Card>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      stopRecording();
                      if (currentQuestionIndex < followUpQuestions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      }
                    }}
                    variant="secondary"
                    fullWidth
                  >
                    Continue
                  </Button>
                  <Button
                    onClick={completeSession}
                    fullWidth
                    icon={<CheckCircle2 size={18} />}
                  >
                    Complete Session
                  </Button>
                </div>
              </div>
            )}

            {isProcessing && (
              <Card className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-[var(--color-sage)] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-[var(--color-stone)]">Processing your story...</p>
              </Card>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

