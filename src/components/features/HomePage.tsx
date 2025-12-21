'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card, StatCard, ProgressCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Mic, Brain, Users, BarChart3, Sparkles, TrendIndicator,
  ChevronRight, Calendar, Clock, MessageCircle, BookOpen, Heart
} from '@/components/icons';
import { getTimeOfDay } from '@/lib/speechAnalysis';

export function HomePage() {
  const { user, setActiveTab, speechAnalyses, gameResults } = useStore();
  const profile = user?.cognitiveProfile;
  const timeOfDay = getTimeOfDay();
  
  const todaysSessions = speechAnalyses.filter(s => {
    const today = new Date();
    const sessionDate = new Date(s.timestamp);
    return sessionDate.toDateString() === today.toDateString();
  }).length;
  
  const todaysGames = gameResults.filter(g => {
    const today = new Date();
    const gameDate = new Date(g.timestamp);
    return gameDate.toDateString() === today.toDateString();
  }).length;

  const getTimeOfDayMessage = () => {
    switch (timeOfDay) {
      case 'morning':
        return "Your mind is typically sharpest in the morning. Great time for activities!";
      case 'afternoon':
        return "Afternoon is a good time for conversation and gentle activities.";
      case 'evening':
        return "Take it easy this evening. Relaxing activities work best now.";
      case 'night':
        return "Winding down for the night. Maybe a calming chat?";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card delay={0.1}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-[var(--color-charcoal)] mb-1">
              Welcome back!
            </h2>
            <p className="text-sm text-[var(--color-stone)]">
              {getTimeOfDayMessage()}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card delay={0.15}>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-[var(--color-sage)]">
              {todaysSessions}
            </p>
            <p className="text-sm text-[var(--color-stone)]">Conversations today</p>
          </div>
        </Card>
        <Card delay={0.2}>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-[var(--color-terracotta)]">
              {todaysGames}
            </p>
            <p className="text-sm text-[var(--color-stone)]">Games played</p>
          </div>
        </Card>
      </div>

      {/* Cognitive Summary */}
      <Card delay={0.25}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
            Cognitive Summary
          </h3>
          <button 
            onClick={() => setActiveTab('insights')}
            className="text-sm text-[var(--color-sage)] font-medium flex items-center"
          >
            View details <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-stone)]">Language</span>
              <span className="font-semibold text-[var(--color-charcoal)]">
                {profile?.languageComplexity.current || 75}
              </span>
            </div>
            <div className="h-2 bg-[var(--color-sand)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.languageComplexity.current || 75}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full rounded-full bg-[var(--color-sage)]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-stone)]">Memory</span>
              <span className="font-semibold text-[var(--color-charcoal)]">
                {profile?.memoryRecall.current || 72}
              </span>
            </div>
            <div className="h-2 bg-[var(--color-sand)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.memoryRecall.current || 72}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-full rounded-full bg-[var(--color-terracotta)]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-stone)]">Attention</span>
              <span className="font-semibold text-[var(--color-charcoal)]">
                {profile?.attention.current || 78}
              </span>
            </div>
            <div className="h-2 bg-[var(--color-sand)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.attention.current || 78}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-full rounded-full bg-[var(--color-calm)]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-stone)]">Processing</span>
              <span className="font-semibold text-[var(--color-charcoal)]">
                {profile?.processingSpeed.current || 70}
              </span>
            </div>
            <div className="h-2 bg-[var(--color-sand)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.processingSpeed.current || 70}%` }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="h-full rounded-full bg-[var(--color-happy)]"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--color-sand)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-stone)]">Overall Trend:</span>
            <TrendIndicator value={profile?.languageComplexity.trend || 0} />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-lg text-[var(--color-charcoal)]">
          Quick Actions
        </h3>
        
        <Card hover onClick={() => setActiveTab('speak')} delay={0.3}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center">
              <Mic size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base text-[var(--color-charcoal)]">Start a Conversation</h4>
              <p className="text-sm text-[var(--color-stone)]">Speak naturally, I'm here to listen</p>
            </div>
            <ChevronRight className="text-[var(--color-stone)]" />
          </div>
        </Card>
        
        <Card hover onClick={() => setActiveTab('games')} delay={0.35}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)] flex items-center justify-center">
              <Brain size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base text-[var(--color-charcoal)]">Play Brain Games</h4>
              <p className="text-sm text-[var(--color-stone)]">Gentle activities for your mind</p>
            </div>
            <ChevronRight className="text-[var(--color-stone)]" />
          </div>
        </Card>
        
        <Card hover onClick={() => setActiveTab('family')} delay={0.4}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-calm)] to-[var(--color-sage)] flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base text-[var(--color-charcoal)]">Family Hub</h4>
              <p className="text-sm text-[var(--color-stone)]">See updates from loved ones</p>
            </div>
            <ChevronRight className="text-[var(--color-stone)]" />
          </div>
        </Card>
        
        <Card hover onClick={() => setActiveTab('biography')} delay={0.45}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)] flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base text-[var(--color-charcoal)]">Capture Your Story</h4>
              <p className="text-sm text-[var(--color-stone)]">Preserve your life memories</p>
            </div>
            <ChevronRight className="text-[var(--color-stone)]" />
          </div>
        </Card>
        
        <Card hover onClick={() => setActiveTab('health')} delay={0.5}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] flex items-center justify-center">
              <Heart size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base text-[var(--color-charcoal)]">Health Scribe</h4>
              <p className="text-sm text-[var(--color-stone)]">Track your health and well-being</p>
            </div>
            <ChevronRight className="text-[var(--color-stone)]" />
          </div>
        </Card>
      </div>

      {/* Daily Tip */}
      <Card className="bg-gradient-to-br from-[var(--color-sage-light)] to-[var(--color-sand)]" delay={0.45}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-medium text-[var(--color-charcoal)] mb-1">Today's Tip</h4>
            <p className="text-sm text-[var(--color-stone)]">
              Regular conversations help maintain cognitive health. Try to have at least 
              one meaningful chat each day, whether with VoiceSense or a loved one.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

