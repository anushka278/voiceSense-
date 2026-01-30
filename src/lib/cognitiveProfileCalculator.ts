import type { SpeechAnalysis, CognitiveGameResult, CognitiveProfile, EmotionalState } from '@/types';

/**
 * Calculates cognitive profile metrics from actual speech analyses and game results
 */
export function calculateCognitiveProfile(
  speechAnalyses: SpeechAnalysis[],
  gameResults: CognitiveGameResult[],
  existingProfile?: CognitiveProfile
): CognitiveProfile {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter recent data (last 7 days)
  const recentAnalyses = speechAnalyses.filter(a => 
    new Date(a.timestamp) >= oneWeekAgo
  );
  const recentGames = gameResults.filter(g => 
    new Date(g.timestamp) >= oneWeekAgo
  );
  
  // Calculate Language Complexity from speech analyses
  const languageScores = recentAnalyses.map(a => a.metrics.vocabularyComplexity);
  const languageCurrent = languageScores.length > 0
    ? Math.round(languageScores.reduce((a, b) => a + b, 0) / languageScores.length)
    : (existingProfile?.languageComplexity?.current ?? null);
  
  const languageWeekly = languageScores.length > 0
    ? Math.round(languageScores.reduce((a, b) => a + b, 0) / languageScores.length)
    : (existingProfile?.languageComplexity?.weeklyAverage ?? null);
  
  const languageTrend = existingProfile?.languageComplexity?.current !== null && existingProfile?.languageComplexity?.current !== undefined && languageCurrent !== null
    ? languageCurrent - (existingProfile.languageComplexity?.current ?? 0)
    : null;
  
  // Calculate Memory Recall from memory game results
  const memoryGames = recentGames.filter(g => g.gameType === 'memory_recall');
  const memoryScores = memoryGames.map(g => g.accuracy);
  const memoryCurrent = memoryScores.length > 0
    ? Math.round(memoryScores.reduce((a, b) => a + b, 0) / memoryScores.length)
    : (existingProfile?.memoryRecall?.current ?? null);
  
  const memoryWeekly = memoryScores.length > 0
    ? Math.round(memoryScores.reduce((a, b) => a + b, 0) / memoryScores.length)
    : (existingProfile?.memoryRecall?.weeklyAverage ?? null);
  
  const memoryTrend = existingProfile?.memoryRecall?.current !== null && existingProfile?.memoryRecall?.current !== undefined && memoryCurrent !== null
    ? memoryCurrent - (existingProfile.memoryRecall?.current ?? 0)
    : null;
  
  // Calculate Attention from attention game results
  const attentionGames = recentGames.filter(g => g.gameType === 'attention_focus');
  const attentionScores = attentionGames.map(g => g.accuracy);
  const attentionCurrent = attentionScores.length > 0
    ? Math.round(attentionScores.reduce((a, b) => a + b, 0) / attentionScores.length)
    : (existingProfile?.attention?.current ?? null);
  
  const attentionWeekly = attentionScores.length > 0
    ? Math.round(attentionScores.reduce((a, b) => a + b, 0) / attentionScores.length)
    : (existingProfile?.attention?.weeklyAverage ?? null);
  
  const attentionTrend = existingProfile?.attention?.current !== null && existingProfile?.attention?.current !== undefined && attentionCurrent !== null
    ? attentionCurrent - (existingProfile.attention?.current ?? 0)
    : null;
  
  // Calculate Processing Speed from processing speed game results
  const processingGames = recentGames.filter(g => g.gameType === 'processing_speed');
  const processingScores = processingGames.map(g => g.accuracy);
  const processingCurrent = processingScores.length > 0
    ? Math.round(processingScores.reduce((a, b) => a + b, 0) / processingScores.length)
    : (existingProfile?.processingSpeed?.current ?? null);
  
  const processingWeekly = processingScores.length > 0
    ? Math.round(processingScores.reduce((a, b) => a + b, 0) / processingScores.length)
    : (existingProfile?.processingSpeed?.weeklyAverage ?? null);
  
  const processingTrend = existingProfile?.processingSpeed?.current !== null && existingProfile?.processingSpeed?.current !== undefined && processingCurrent !== null
    ? processingCurrent - (existingProfile.processingSpeed?.current ?? 0)
    : null;
  
  // Calculate Emotional Patterns from speech analyses
  const emotionalStates = recentAnalyses.map(a => a.emotionalState);
  let dominant: EmotionalState | null = null;
  let emotionalFrequency: Record<EmotionalState, number> | null = null;
  
  if (emotionalStates.length > 0) {
    emotionalFrequency = {
      calm: 0,
      happy: 0,
      anxious: 0,
      sad: 0,
      agitated: 0,
      neutral: 0
    };
    
    emotionalStates.forEach(state => {
      emotionalFrequency![state] = (emotionalFrequency![state] || 0) + 1;
    });
    
    // Calculate percentages
    const totalEmotions = emotionalStates.length || 1;
    Object.keys(emotionalFrequency).forEach(key => {
      emotionalFrequency![key as EmotionalState] = Math.round(
        (emotionalFrequency![key as EmotionalState] / totalEmotions) * 100
      );
    });
    
    // Find dominant emotion
    dominant = Object.entries(emotionalFrequency).reduce((a, b) => 
      emotionalFrequency![a[0] as EmotionalState] > emotionalFrequency![b[0] as EmotionalState] ? a : b
    )[0] as EmotionalState;
  }
  
  // Calculate Peak Cognition Time
  let peakCognitionTime: 'morning' | 'afternoon' | 'evening' | null = null;
  
  if (recentAnalyses.length > 0) {
    const timeOfDayCounts: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    recentAnalyses.forEach(a => {
      timeOfDayCounts[a.timeOfDay] = (timeOfDayCounts[a.timeOfDay] || 0) + 1;
    });
    
    peakCognitionTime = Object.entries(timeOfDayCounts).reduce((a, b) => 
      timeOfDayCounts[a[0]] > timeOfDayCounts[b[0]] ? a : b
    )[0] as 'morning' | 'afternoon' | 'evening';
  }
  
  // Calculate Overall Trend - more sensitive to actual changes
  const trends = [languageTrend, memoryTrend, attentionTrend, processingTrend].filter(t => t !== null) as number[];
  let overallTrend: 'stable' | 'improving' | 'declining' | 'variable' | null = null;
  
  if (trends.length > 0) {
    const totalTrend = trends.reduce((a, b) => a + b, 0);
    const positiveTrends = trends.filter(t => t > 0).length;
    const negativeTrends = trends.filter(t => t < 0).length;
    const significantPositive = trends.filter(t => t >= 3).length; // Significant improvement
    const significantNegative = trends.filter(t => t <= -3).length; // Significant decline
    
    // If there are significant changes, use those
    if (significantPositive >= 2 || (significantPositive >= 1 && totalTrend > 5)) {
      overallTrend = 'improving';
    } else if (significantNegative >= 2 || (significantNegative >= 1 && totalTrend < -5)) {
      overallTrend = 'declining';
    } else if (positiveTrends > negativeTrends && positiveTrends >= 2 && totalTrend > 2) {
      overallTrend = 'improving';
    } else if (negativeTrends > positiveTrends && negativeTrends >= 2 && totalTrend < -2) {
      overallTrend = 'declining';
    } else if (Math.abs(totalTrend) < 3 && positiveTrends === negativeTrends) {
      overallTrend = 'stable';
    } else {
      overallTrend = 'variable';
    }
  }
  
  return {
    userId: existingProfile?.userId || crypto.randomUUID(),
    lastUpdated: now,
    overallTrend,
    languageComplexity: {
      current: languageCurrent,
      trend: languageTrend,
      weeklyAverage: languageWeekly
    },
    memoryRecall: {
      current: memoryCurrent,
      trend: memoryTrend,
      weeklyAverage: memoryWeekly
    },
    attention: {
      current: attentionCurrent,
      trend: attentionTrend,
      weeklyAverage: attentionWeekly
    },
    processingSpeed: {
      current: processingCurrent,
      trend: processingTrend,
      weeklyAverage: processingWeekly
    },
    emotionalPatterns: {
      dominant,
      frequency: emotionalFrequency
    },
    peakCognitionTime,
    recentInsights: existingProfile?.recentInsights || []
  };
}

