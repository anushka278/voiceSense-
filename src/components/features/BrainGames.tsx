'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Brain, BookOpen, Target, Zap, CheckCircle2, 
  Play, RefreshCw, ChevronRight, Clock 
} from '@/components/icons';
import { 
  getRandomMemoryGame, 
  getRandomAttentionGame, 
  getRandomLanguageGame,
  getRandomProcessingSpeedGame,
  getRandomCategorySortingGame,
  getRandomPatternCompletionGame
} from '@/lib/gameData';
import type { 
  MemoryGame, 
  AttentionGame, 
  LanguageGame, 
  ProcessingSpeedGame,
  CategorySortingGame,
  PatternCompletionGame,
  CognitiveGameResult 
} from '@/types';

type GameType = 'memory_recall' | 'attention_focus' | 'language_formation' | 'processing_speed' | 'category_sorting' | 'pattern_completion';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function GameCard({ title, description, icon, color, onClick }: GameCardProps) {
  return (
    <Card hover onClick={onClick}>
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)]">{title}</h3>
          <p className="text-sm text-[var(--color-stone)]">{description}</p>
        </div>
        <ChevronRight className="text-[var(--color-stone)]" />
      </div>
    </Card>
  );
}

// Memory Game Component
function MemoryGamePlay({ 
  game, 
  onComplete 
}: { 
  game: MemoryGame; 
  onComplete: (result: Partial<CognitiveGameResult>) => void;
}) {
  const [phase, setPhase] = useState<'story' | 'questions' | 'complete'>('story');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [inputValue, setInputValue] = useState('');

  const handleSubmitAnswer = () => {
    const newAnswers = [...userAnswers, inputValue.toLowerCase().trim()];
    setUserAnswers(newAnswers);
    setInputValue('');
    
    if (currentQuestion < game.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate results
      const correctCount = newAnswers.filter((answer, idx) => 
        game.questions[idx].correctAnswer.toLowerCase().includes(answer) ||
        answer.includes(game.questions[idx].correctAnswer.toLowerCase())
      ).length;
      
      const accuracy = Math.round((correctCount / game.questions.length) * 100);
      const responseTime = (Date.now() - startTime) / game.questions.length;
      
      setPhase('complete');
      onComplete({
        accuracy,
        responseTime,
        repetitionsNeeded: 0,
        frustrationDetected: false,
        completed: true
      });
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === 'story' && (
          <motion.div
            key="story"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-4">
                Listen to this story
              </h3>
              <p className="text-lg text-[var(--color-charcoal)] leading-relaxed mb-6">
                {game.content}
              </p>
              <Button onClick={() => setPhase('questions')} fullWidth>
                I'm ready for questions
              </Button>
            </Card>
          </motion.div>
        )}

        {phase === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--color-stone)]">
                  Question {currentQuestion + 1} of {game.questions.length}
                </span>
                <div className="flex gap-1">
                  {game.questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx < currentQuestion 
                          ? 'bg-[var(--color-sage)]' 
                          : idx === currentQuestion 
                            ? 'bg-[var(--color-terracotta)]'
                            : 'bg-[var(--color-sand)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-6">
                {game.questions[currentQuestion].question}
              </h3>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleSubmitAnswer()}
                placeholder="Type your answer..."
                className="w-full p-4 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none text-lg mb-4"
                autoFocus
              />
              
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!inputValue} 
                fullWidth
              >
                Submit Answer
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Attention Game Component
function AttentionGamePlay({ 
  game, 
  onComplete 
}: { 
  game: AttentionGame; 
  onComplete: (result: Partial<CognitiveGameResult>) => void;
}) {
  const [phase, setPhase] = useState<'listen' | 'answer' | 'complete'>('listen');
  const [userCount, setUserCount] = useState('');
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    const userAnswer = parseInt(userCount) || 0;
    const accuracy = userAnswer === game.correctCount ? 100 : 
                     Math.max(0, 100 - Math.abs(userAnswer - game.correctCount) * 20);
    
    setPhase('complete');
    onComplete({
      accuracy,
      responseTime: Date.now() - startTime,
      repetitionsNeeded: 0,
      frustrationDetected: false,
      completed: true
    });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === 'listen' && (
          <motion.div
            key="listen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)] mb-2">
                Listen carefully
              </h3>
              <p className="text-sm text-[var(--color-stone)] mb-4">
                Count how many times you hear the word: <strong>"{game.targetWord}"</strong>
              </p>
              <p className="text-lg text-[var(--color-charcoal)] leading-relaxed mb-6 p-4 bg-[var(--color-sand)] rounded-xl">
                {game.content}
              </p>
              <Button onClick={() => setPhase('answer')} fullWidth>
                I've counted them
              </Button>
            </Card>
          </motion.div>
        )}

        {phase === 'answer' && (
          <motion.div
            key="answer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-4">
                How many times did you hear "{game.targetWord}"?
              </h3>
              <input
                type="number"
                value={userCount}
                onChange={(e) => setUserCount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && userCount && handleSubmit()}
                placeholder="Enter number..."
                className="w-full p-4 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none text-2xl text-center mb-4"
                min="0"
                autoFocus
              />
              <Button onClick={handleSubmit} disabled={!userCount} fullWidth>
                Submit Answer
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Language Game Component
function LanguageGamePlay({ 
  game, 
  onComplete 
}: { 
  game: LanguageGame; 
  onComplete: (result: Partial<CognitiveGameResult>) => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    const userWords = userAnswer.toLowerCase().split(/[\s,]+/).filter(w => w.length > 0);
    const matchedWords = userWords.filter(word => 
      game.expectedResponses.some(expected => 
        expected.toLowerCase().includes(word) || word.includes(expected.toLowerCase())
      )
    );
    
    const minExpected = game.type === 'naming' ? 3 : 1;
    const accuracy = Math.min(100, Math.round((matchedWords.length / minExpected) * 100));
    
    onComplete({
      accuracy,
      responseTime: Date.now() - startTime,
      repetitionsNeeded: 0,
      frustrationDetected: false,
      completed: true
    });
  };

  return (
    <Card>
      <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-6">
        {game.prompt}
      </h3>
      
      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder={game.type === 'naming' ? "Type your answers separated by commas..." : "Type your answer..."}
        className="w-full p-4 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none text-lg mb-4 min-h-[120px] resize-none"
        autoFocus
      />
      
      <Button onClick={handleSubmit} disabled={!userAnswer} fullWidth>
        Submit Answer
      </Button>
    </Card>
  );
}

// Processing Speed Game Component
function ProcessingSpeedGamePlay({ 
  game, 
  onComplete 
}: { 
  game: ProcessingSpeedGame; 
  onComplete: (result: Partial<CognitiveGameResult>) => void;
}) {
  const AUTO_SUBMIT_TIME = 25; // Auto-submit at 25 seconds
  const [timeLeft, setTimeLeft] = useState(AUTO_SUBMIT_TIME);
  const [userAnswer, setUserAnswer] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const handleSubmit = useCallback(() => {
    const answers = userAnswer.split(/[\s,]+/).filter(w => w.length > 0);
    const accuracy = Math.min(100, Math.round((answers.length / game.minimumResponses) * 100));
    
    onComplete({
      accuracy,
      responseTime: Date.now() - startTime,
      repetitionsNeeded: 0,
      frustrationDetected: timeLeft === 0 && answers.length < game.minimumResponses,
      completed: true
    });
  }, [userAnswer, game.minimumResponses, startTime, timeLeft, onComplete]);

  useEffect(() => {
    if (!isStarted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, handleSubmit]);


  if (!isStarted) {
    return (
      <Card className="text-center">
        <Clock size={48} className="mx-auto text-[var(--color-terracotta)] mb-4" />
        <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-2">
          Ready?
        </h3>
        <p className="text-[var(--color-stone)] mb-4">
          Name as many <strong>{game.category}</strong> as you can in {AUTO_SUBMIT_TIME} seconds.
        </p>
        <p className="text-sm text-[var(--color-stone)] mb-6">
          Goal: At least {game.minimumResponses} items
        </p>
        <Button onClick={() => { setIsStarted(true); setStartTime(Date.now()); }} fullWidth>
          Start!
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-[var(--color-charcoal)]">
          Name {game.category}
        </h3>
        <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-[var(--color-agitated)]' : 'text-[var(--color-sage)]'}`}>
          {timeLeft}s
        </span>
      </div>
      
      <div className="h-2 bg-[var(--color-sand)] rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / AUTO_SUBMIT_TIME) * 100}%` }}
          className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-[var(--color-agitated)]' : 'bg-[var(--color-sage)]'}`}
        />
      </div>
      
      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Type answers separated by commas..."
        className="w-full p-4 rounded-xl border-2 border-[var(--color-sand)] focus:border-[var(--color-sage)] outline-none text-lg mb-4 min-h-[120px] resize-none"
        autoFocus
      />
      
      <Button onClick={handleSubmit} fullWidth>
        Done
      </Button>
    </Card>
  );
}

// Category Sorting Game Component
function CategorySortingGamePlay({ 
  game, 
  onComplete 
}: { 
  game: CategorySortingGame; 
  onComplete: (result: Partial<CognitiveGameResult>) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer.toLowerCase() === game.correctAnswer.toLowerCase();
    const accuracy = isCorrect ? 100 : 0;
    
    onComplete({
      accuracy,
      responseTime: Date.now() - startTime,
      repetitionsNeeded: 0,
      frustrationDetected: false,
      completed: true
    });
  };

  return (
    <Card>
      <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-6">
        {game.question}
      </h3>
      
      <div className="space-y-3 mb-6">
        {game.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedAnswer(option)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedAnswer === option
                ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10'
                : 'border-[var(--color-sand)] hover:border-[var(--color-sage)]/50'
            }`}
          >
            <span className="text-lg text-[var(--color-charcoal)]">{option}</span>
          </button>
        ))}
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={!selectedAnswer} 
        fullWidth
      >
        Submit Answer
      </Button>
    </Card>
  );
}

// Pattern Completion Game Component
function PatternCompletionGamePlay({ 
  game, 
  onComplete 
}: { 
  game: PatternCompletionGame; 
  onComplete: (result: Partial<CognitiveGameResult>) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer.toLowerCase() === game.correctAnswer.toLowerCase();
    const accuracy = isCorrect ? 100 : 0;
    
    onComplete({
      accuracy,
      responseTime: Date.now() - startTime,
      repetitionsNeeded: 0,
      frustrationDetected: false,
      completed: true
    });
  };

  // Display pattern with blank for missing item
  const displayPattern = [...game.pattern];
  // If missingIndex is beyond the pattern length, add blank at the end
  if (game.missingIndex >= displayPattern.length) {
    displayPattern.push('___');
  } else {
    displayPattern[game.missingIndex] = '___';
  }

  return (
    <Card>
      <h3 className="text-xl font-display font-semibold text-[var(--color-charcoal)] mb-4">
        Complete the pattern
      </h3>
      
      <div className="mb-6 p-4 bg-[var(--color-sand)] rounded-xl">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {displayPattern.map((item, index) => (
            <span 
              key={index}
              className={`text-xl font-semibold ${
                item === '___'
                  ? 'text-[var(--color-terracotta)]' 
                  : 'text-[var(--color-charcoal)]'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-[var(--color-stone)] mb-4 text-center">
        What comes next?
      </p>
      
      <div className="space-y-3 mb-6">
        {game.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedAnswer(option)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedAnswer === option
                ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10'
                : 'border-[var(--color-sand)] hover:border-[var(--color-sage)]/50'
            }`}
          >
            <span className="text-lg text-[var(--color-charcoal)]">{option}</span>
          </button>
        ))}
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={!selectedAnswer} 
        fullWidth
      >
        Submit Answer
      </Button>
    </Card>
  );
}

// Results Component
function GameResults({ 
  result, 
  gameType, 
  onPlayAgain 
}: { 
  result: Partial<CognitiveGameResult>; 
  gameType: GameType;
  onPlayAgain: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-sage)';
    if (score >= 60) return 'var(--color-terracotta)';
    return 'var(--color-agitated)';
  };

  const getMessage = (score: number) => {
    if (score >= 80) return "Excellent work! Your mind is sharp today.";
    if (score >= 60) return "Good effort! Keep practicing.";
    return "That's okay! Every attempt helps build cognitive strength.";
  };

  return (
    <Card className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ backgroundColor: getScoreColor(result.accuracy || 0) }}
      >
        <CheckCircle2 size={48} className="text-white" />
      </motion.div>
      
      <h3 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
        {result.accuracy}% Accuracy
      </h3>
      
      <p className="text-[var(--color-stone)] mb-6">
        {getMessage(result.accuracy || 0)}
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-[var(--color-sand)] rounded-xl">
          <p className="text-xs text-[var(--color-stone)]">Response Time</p>
          <p className="text-lg font-semibold text-[var(--color-charcoal)]">
            {Math.round((result.responseTime || 0) / 1000)}s
          </p>
        </div>
        <div className="p-3 bg-[var(--color-sand)] rounded-xl">
          <p className="text-xs text-[var(--color-stone)]">Game Type</p>
          <p className="text-lg font-semibold text-[var(--color-charcoal)] capitalize">
            {gameType.replace('_', ' ')}
          </p>
        </div>
      </div>
      
      <Button onClick={onPlayAgain} variant="secondary" fullWidth icon={<RefreshCw size={18} />}>
        Try Another Game
      </Button>
    </Card>
  );
}

// Main Brain Games Component
export function BrainGames() {
  const { addGameResult, addInsight } = useStore();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [currentGame, setCurrentGame] = useState<MemoryGame | AttentionGame | LanguageGame | ProcessingSpeedGame | CategorySortingGame | PatternCompletionGame | null>(null);
  const [gameResult, setGameResult] = useState<Partial<CognitiveGameResult> | null>(null);

  const startGame = (type: GameType) => {
    setSelectedGame(type);
    setGameResult(null);
    
    switch (type) {
      case 'memory_recall':
        setCurrentGame(getRandomMemoryGame());
        break;
      case 'attention_focus':
        setCurrentGame(getRandomAttentionGame());
        break;
      case 'language_formation':
        setCurrentGame(getRandomLanguageGame());
        break;
      case 'processing_speed':
        setCurrentGame(getRandomProcessingSpeedGame());
        break;
      case 'category_sorting':
        setCurrentGame(getRandomCategorySortingGame());
        break;
      case 'pattern_completion':
        setCurrentGame(getRandomPatternCompletionGame());
        break;
    }
  };

  const handleGameComplete = useCallback((result: Partial<CognitiveGameResult>) => {
    setGameResult(result);
    
    const fullResult: CognitiveGameResult = {
      id: crypto.randomUUID(),
      gameType: selectedGame!,
      timestamp: new Date(),
      accuracy: result.accuracy || 0,
      responseTime: result.responseTime || 0,
      repetitionsNeeded: result.repetitionsNeeded || 0,
      frustrationDetected: result.frustrationDetected || false,
      completed: result.completed || true
    };
    
    addGameResult(fullResult);
    
    // Generate insight for notable performance
    if (result.accuracy && result.accuracy >= 90) {
      addInsight({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: selectedGame === 'memory_recall' ? 'memory' : 'attention',
        severity: 'info',
        title: 'Excellent Performance!',
        description: `Achieved ${result.accuracy}% accuracy in ${selectedGame?.replace('_', ' ')} activity.`,
        recommendation: 'Great work! Consider trying more challenging activities.'
      });
    }
  }, [selectedGame, addGameResult, addInsight]);

  const resetGame = () => {
    setSelectedGame(null);
    setCurrentGame(null);
    setGameResult(null);
  };

  if (gameResult) {
    return (
      <div className="space-y-4">
        <button 
          onClick={resetGame}
          className="text-[var(--color-sage)] font-medium flex items-center gap-1"
        >
          ← Back to games
        </button>
        <GameResults 
          result={gameResult} 
          gameType={selectedGame!} 
          onPlayAgain={resetGame} 
        />
      </div>
    );
  }

  if (selectedGame && currentGame) {
    return (
      <div className="space-y-4">
        <button 
          onClick={resetGame}
          className="text-[var(--color-sage)] font-medium flex items-center gap-1"
        >
          ← Back to games
        </button>
        
        {selectedGame === 'memory_recall' && (
          <MemoryGamePlay 
            game={currentGame as MemoryGame} 
            onComplete={handleGameComplete} 
          />
        )}
        {selectedGame === 'attention_focus' && (
          <AttentionGamePlay 
            game={currentGame as AttentionGame} 
            onComplete={handleGameComplete} 
          />
        )}
        {selectedGame === 'language_formation' && (
          <LanguageGamePlay 
            game={currentGame as LanguageGame} 
            onComplete={handleGameComplete} 
          />
        )}
        {selectedGame === 'processing_speed' && (
          <ProcessingSpeedGamePlay 
            game={currentGame as ProcessingSpeedGame} 
            onComplete={handleGameComplete} 
          />
        )}
        {selectedGame === 'category_sorting' && (
          <CategorySortingGamePlay 
            game={currentGame as CategorySortingGame} 
            onComplete={handleGameComplete} 
          />
        )}
        {selectedGame === 'pattern_completion' && (
          <PatternCompletionGamePlay 
            game={currentGame as PatternCompletionGame} 
            onComplete={handleGameComplete} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)] mb-2">
          Brain Games
        </h2>
        <p className="text-[var(--color-stone)]">
          Gentle activities to keep your mind active. Choose a game to begin.
        </p>
      </div>

      <div className="space-y-3 stagger-children">
        <GameCard
          title="Memory Recall"
          description="Listen to stories and answer questions"
          icon={<BookOpen size={24} />}
          color="var(--color-sage)"
          onClick={() => startGame('memory_recall')}
        />
        
        <GameCard
          title="Attention & Focus"
          description="Count words and identify patterns"
          icon={<Target size={24} />}
          color="var(--color-terracotta)"
          onClick={() => startGame('attention_focus')}
        />
        
        <GameCard
          title="Language Formation"
          description="Complete sentences and name items"
          icon={<Brain size={24} />}
          color="var(--color-calm)"
          onClick={() => startGame('language_formation')}
        />
        
        <GameCard
          title="Processing Speed"
          description="Quick naming challenges"
          icon={<Zap size={24} />}
          color="var(--color-happy)"
          onClick={() => startGame('processing_speed')}
        />
        
        <GameCard
          title="Category Sorting"
          description="Choose the item that belongs"
          icon={<Target size={24} />}
          color="var(--color-calm)"
          onClick={() => startGame('category_sorting')}
        />
        
        <GameCard
          title="Pattern Completion"
          description="Complete the sequence"
          icon={<Brain size={24} />}
          color="var(--color-sage)"
          onClick={() => startGame('pattern_completion')}
        />
      </div>
    </div>
  );
}

