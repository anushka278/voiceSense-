'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card, StatCard, ProgressCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendIndicator, EmotionIcon, TimeOfDayIcon,
  Brain, MessageCircle, Target, Activity, Calendar, Info, AlertCircle,
  Download, Filter, ChevronRight, ChevronLeft, X
} from '@/components/icons';
import { 
  generateMonthlyCognitiveTrends,
  generateTimeOfDayPerformance,
  generateEmotionalDistribution,
  generateWeeklyTrends
} from '@/lib/mockData';
import { sampleInsights } from '@/lib/gameData';
import type { Insight } from '@/types';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

type ViewMode = 'overview' | 'language' | 'cognitive' | 'emotional';
type DateRange = '7d' | '30d' | '90d' | 'all' | 'custom';
type ExportFormat = 'csv' | 'json' | 'pdf';

interface DateFilter {
  range: DateRange;
  startDate?: Date;
  endDate?: Date;
}

const tabItems = [
  { id: 'overview' as const, label: 'Overview' },
  { id: 'language' as const, label: 'Language' },
  { id: 'cognitive' as const, label: 'Cognitive' },
  { id: 'emotional' as const, label: 'Emotional' },
];

// Date range options
const dateRangeOptions = [
  { value: '7d' as const, label: 'Last 7 Days' },
  { value: '30d' as const, label: 'Last 30 Days' },
  { value: '90d' as const, label: 'Last 90 Days' },
  { value: 'all' as const, label: 'All Time' },
  { value: 'custom' as const, label: 'Custom Range' },
];

// Helper function to filter data by date range
function filterByDateRange<T extends { timestamp?: Date; date?: Date | string }>(
  data: T[],
  filter: DateFilter
): T[] {
  if (filter.range === 'all') return data;
  
  const now = new Date();
  let startDate: Date;
  
  switch (filter.range) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      if (filter.startDate && filter.endDate) {
        return data.filter(item => {
          const itemDate = item.timestamp || (typeof item.date === 'string' ? new Date(item.date) : item.date);
          return itemDate && itemDate >= filter.startDate! && itemDate <= filter.endDate!;
        });
      }
      return data;
    default:
      return data;
  }
  
  return data.filter(item => {
    const itemDate = item.timestamp || (typeof item.date === 'string' ? new Date(item.date) : item.date);
    return itemDate && itemDate >= startDate;
  });
}

// Export functions
function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      if (value instanceof Date) return value.toISOString();
      return JSON.stringify(value);
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
}

function exportToPDF(data: any[], filename: string) {
  // Simple PDF export using window.print() for now
  // In production, you'd use a library like jsPDF or pdfkit
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #8BA888; color: white; }
        </style>
      </head>
      <body>
        <h1>${filename}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(val => `<td>${val instanceof Date ? val.toLocaleString() : val}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function InsightCard({ insight }: { insight: Insight }) {
  const severityColors = {
    info: 'border-l-[var(--color-sage)]',
    notable: 'border-l-[var(--color-terracotta)]',
    significant: 'border-l-[var(--color-agitated)]'
  };
  
  const severityIcons = {
    info: <Info size={18} className="text-[var(--color-sage)]" />,
    notable: <AlertCircle size={18} className="text-[var(--color-terracotta)]" />,
    significant: <AlertCircle size={18} className="text-[var(--color-agitated)]" />
  };

  return (
    <Card className={`border-l-4 ${severityColors[insight.severity]}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[var(--color-sand)] rounded-lg">
          {severityIcons[insight.severity]}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-[var(--color-charcoal)]">{insight.title}</h4>
          <p className="text-sm text-[var(--color-stone)] mt-1">{insight.description}</p>
          {insight.recommendation && (
            <p className="text-sm text-[var(--color-sage)] mt-2 italic">
              💡 {insight.recommendation}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function OverviewTab({ dateFilter }: { dateFilter: DateFilter }) {
  const { user, speechAnalyses, gameResults, insights } = useStore();
  const profile = user?.cognitiveProfile;
  
  // Generate filtered data
  const filteredAnalyses = filterByDateRange(speechAnalyses, dateFilter);
  const filteredGames = filterByDateRange(gameResults, dateFilter);
  const filteredInsights = filterByDateRange(insights, dateFilter);
  
  // Create detailed trend data from actual data
  const trendData = useMemo(() => {
    const data: { date: string; overall: number; language: number; memory: number; attention: number }[] = [];
    const dateMap = new Map<string, { language: number[]; memory: number[]; attention: number[] }>();
    
    // Group by date
    filteredAnalyses.forEach(a => {
      const date = new Date(a.timestamp).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, { language: [], memory: [], attention: [] });
      }
      const dayData = dateMap.get(date)!;
      dayData.language.push(a.metrics.vocabularyComplexity);
    });
    
    filteredGames.forEach(g => {
      const date = new Date(g.timestamp).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, { language: [], memory: [], attention: [] });
      }
      const dayData = dateMap.get(date)!;
      if (g.gameType === 'memory_recall') {
        dayData.memory.push(g.accuracy);
      } else if (g.gameType === 'attention_focus') {
        dayData.attention.push(g.accuracy);
      }
    });
    
    // Convert to array and calculate averages
    Array.from(dateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .forEach(([date, values]) => {
        const avgLanguage = values.language.length > 0 
          ? values.language.reduce((a, b) => a + b, 0) / values.language.length 
          : profile?.languageComplexity.current || 75;
        const avgMemory = values.memory.length > 0 
          ? values.memory.reduce((a, b) => a + b, 0) / values.memory.length 
          : profile?.memoryRecall.current || 72;
        const avgAttention = values.attention.length > 0 
          ? values.attention.reduce((a, b) => a + b, 0) / values.attention.length 
          : profile?.attention.current || 78;
        
        data.push({
          date,
          overall: Math.round((avgLanguage + avgMemory + avgAttention) / 3),
          language: Math.round(avgLanguage),
          memory: Math.round(avgMemory),
          attention: Math.round(avgAttention)
        });
      });
    
    // If no data, use mock data
    if (data.length === 0) {
      return generateMonthlyCognitiveTrends();
    }
    
    return data;
  }, [filteredAnalyses, filteredGames, profile]);
  
  return (
    <div className="space-y-4">
      {/* Cognitive Scores */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Language"
          value={profile?.languageComplexity.current ?? 'N/A'}
          trend={profile?.languageComplexity.current !== null ? <TrendIndicator value={profile?.languageComplexity.trend || 0} /> : null}
          icon={<MessageCircle size={20} className="text-[var(--color-sage)]" />}
          color="sage"
          delay={0.1}
        />
        <StatCard
          title="Memory"
          value={profile?.memoryRecall.current ?? 'N/A'}
          trend={profile?.memoryRecall.current !== null ? <TrendIndicator value={profile?.memoryRecall.trend || 0} /> : null}
          icon={<Brain size={20} className="text-[var(--color-terracotta)]" />}
          color="terracotta"
          delay={0.15}
        />
        <StatCard
          title="Attention"
          value={profile?.attention.current ?? 'N/A'}
          trend={profile?.attention.current !== null ? <TrendIndicator value={profile?.attention.trend || 0} /> : null}
          icon={<Target size={20} className="text-[var(--color-calm)]" />}
          color="calm"
          delay={0.2}
        />
        <StatCard
          title="Processing"
          value={profile?.processingSpeed.current ?? 'N/A'}
          trend={profile?.processingSpeed.current !== null ? <TrendIndicator value={profile?.processingSpeed.trend || 0} /> : null}
          icon={<Activity size={20} className="text-[var(--color-stone)]" />}
          delay={0.25}
        />
      </div>
      
      {/* Overall Trend Chart - Enhanced */}
      <Card delay={0.3}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
            Cognitive Trend
          </h3>
          <span className="text-xs text-[var(--color-stone)]">
            {trendData.length} data points
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sage)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-sage)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLanguage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-terracotta)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-terracotta)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
                tickLine={false}
                interval={Math.max(1, Math.floor(trendData.length / 10))}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[50, 100]}
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-stone)' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-warm-white)', 
                  border: '1px solid var(--color-sand)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  padding: '8px 12px'
                }}
                formatter={(value: any, name: string) => [value, name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area 
                type="monotone" 
                dataKey="overall" 
                stroke="var(--color-sage)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOverall)" 
                name="Overall Score"
                dot={{ r: 3, fill: 'var(--color-sage)' }}
                activeDot={{ r: 5 }}
              />
              <Area 
                type="monotone" 
                dataKey="language" 
                stroke="var(--color-terracotta)" 
                strokeWidth={1.5}
                fillOpacity={0.5} 
                fill="url(#colorLanguage)" 
                name="Language"
                dot={{ r: 2, fill: 'var(--color-terracotta)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[var(--color-stone)]">
          <div>Avg Overall: {Math.round(trendData.reduce((sum, d) => sum + d.overall, 0) / trendData.length || 0)}</div>
          <div>Avg Language: {Math.round(trendData.reduce((sum, d) => sum + d.language, 0) / trendData.length || 0)}</div>
          <div>Data Points: {trendData.length}</div>
        </div>
      </Card>
      
      {/* Peak Time & Dominant Emotion */}
      <div className="grid grid-cols-2 gap-3">
        <Card delay={0.35}>
          <p className="text-sm text-[var(--color-stone)] mb-2">Peak Cognition</p>
          <div className="flex items-center gap-2">
            <TimeOfDayIcon time={profile?.peakCognitionTime || 'morning'} size={28} />
            <span className="text-xl font-display font-bold text-[var(--color-charcoal)] capitalize">
              {profile?.peakCognitionTime || 'Morning'}
            </span>
          </div>
        </Card>
        <Card delay={0.4}>
          <p className="text-sm text-[var(--color-stone)] mb-2">Dominant Mood</p>
          <div className="flex items-center gap-2">
            <EmotionIcon emotion={profile?.emotionalPatterns.dominant || 'calm'} size={28} />
            <span className="text-xl font-display font-bold text-[var(--color-charcoal)] capitalize">
              {profile?.emotionalPatterns.dominant || 'Calm'}
            </span>
          </div>
        </Card>
      </div>
      
      {/* Recent Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
            Recent Insights
          </h3>
          <span className="text-xs text-[var(--color-stone)]">
            {filteredInsights.length} total
          </span>
        </div>
        <div className="space-y-3">
          {(filteredInsights.length > 0 ? filteredInsights : sampleInsights).slice(0, 5).map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
          {filteredInsights.length === 0 && (
            <Card>
              <p className="text-center text-[var(--color-stone)] py-4">
                No insights for the selected date range.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function LanguageTab({ dateFilter }: { dateFilter: DateFilter }) {
  const { speechAnalyses } = useStore();
  const filteredAnalyses = filterByDateRange(speechAnalyses, dateFilter);
  
  // Create detailed language data
  const languageTrendData = useMemo(() => {
    if (filteredAnalyses.length === 0) {
      return generateMonthlyCognitiveTrends();
    }
    
    const dateMap = new Map<string, { complexity: number[]; grammar: number[]; rate: number[] }>();
    
    filteredAnalyses.forEach(a => {
      const date = new Date(a.timestamp).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, { complexity: [], grammar: [], rate: [] });
      }
      const dayData = dateMap.get(date)!;
      dayData.complexity.push(a.metrics.vocabularyComplexity);
      dayData.grammar.push(a.metrics.grammarConsistency);
      dayData.rate.push(a.metrics.speechRate);
    });
    
    return Array.from(dateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, values]) => ({
        date,
        language: Math.round(values.complexity.reduce((a, b) => a + b, 0) / values.complexity.length),
        grammar: Math.round(values.grammar.reduce((a, b) => a + b, 0) / values.grammar.length),
        speechRate: Math.round(values.rate.reduce((a, b) => a + b, 0) / values.rate.length)
      }));
  }, [filteredAnalyses]);
  
  // Time of day analysis
  const timeOfDayData = useMemo(() => {
    const timeMap = { morning: [] as number[], afternoon: [] as number[], evening: [] as number[] };
    
    filteredAnalyses.forEach(a => {
      const time = a.timeOfDay;
      if (time === 'morning' || time === 'afternoon' || time === 'evening') {
        timeMap[time].push(a.metrics.vocabularyComplexity);
      }
    });
    
    return [
      { 
        time: 'Morning', 
        language: timeMap.morning.length > 0 
          ? Math.round(timeMap.morning.reduce((a, b) => a + b, 0) / timeMap.morning.length)
          : 75
      },
      { 
        time: 'Afternoon', 
        language: timeMap.afternoon.length > 0 
          ? Math.round(timeMap.afternoon.reduce((a, b) => a + b, 0) / timeMap.afternoon.length)
          : 70
      },
      { 
        time: 'Evening', 
        language: timeMap.evening.length > 0 
          ? Math.round(timeMap.evening.reduce((a, b) => a + b, 0) / timeMap.evening.length)
          : 65
      }
    ];
  }, [filteredAnalyses]);
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[var(--color-charcoal)]">
            Language Complexity Over Time
          </h3>
          <span className="text-xs text-[var(--color-stone)]">
            {languageTrendData.length} sessions
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={languageTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
                interval={Math.max(1, Math.floor(languageTrendData.length / 8))}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[50, 100]}
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-stone)' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-warm-white)', 
                  border: '1px solid var(--color-sand)',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'speechRate') return [`${value} wpm`, 'Speech Rate'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="language" 
                stroke="var(--color-sage)" 
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-sage)' }}
                activeDot={{ r: 6 }}
                name="Vocabulary Complexity"
              />
              {languageTrendData.some(d => 'grammar' in d) && (
                <Line 
                  type="monotone" 
                  dataKey="grammar" 
                  stroke="var(--color-terracotta)" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-terracotta)' }}
                  name="Grammar Consistency"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-stone)]">
          <div>Avg Complexity: {Math.round(languageTrendData.reduce((sum, d) => sum + d.language, 0) / languageTrendData.length || 0)}</div>
          <div>Avg Grammar: {languageTrendData.some(d => 'grammar' in d) 
            ? Math.round(languageTrendData.filter(d => 'grammar' in d).reduce((sum, d: any) => sum + d.grammar, 0) / languageTrendData.filter(d => 'grammar' in d).length || 0)
            : 'N/A'}
          </div>
        </div>
      </Card>
      
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4">
          Language by Time of Day
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeOfDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: 'var(--color-stone)' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-warm-white)', 
                  border: '1px solid var(--color-sand)',
                  borderRadius: '12px'
                }}
              />
              <Bar 
                dataKey="language" 
                fill="var(--color-sage)" 
                radius={[8, 8, 0, 0]}
                name="Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-[var(--color-stone)] mt-3 text-center">
          📊 Language clarity is highest in the morning
        </p>
      </Card>
      
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4">
          Language Insight
        </h3>
        <div className="p-4 bg-[var(--color-sand)] rounded-xl">
          <p className="text-[var(--color-charcoal)]">
            "Language complexity has gradually declined during evening conversations, 
            with increased repetition after 5 PM. Morning conversations show 15% 
            higher vocabulary diversity."
          </p>
        </div>
      </Card>
    </div>
  );
}

function CognitiveTab({ dateFilter }: { dateFilter: DateFilter }) {
  const { gameResults, user } = useStore();
  const profile = user?.cognitiveProfile;
  const filteredGames = filterByDateRange(gameResults, dateFilter);
  
  // Create weekly data from actual game results
  const weeklyData = useMemo(() => {
    if (filteredGames.length === 0) {
      return generateWeeklyTrends();
    }
    
    const dayMap = new Map<string, { memory: number[]; attention: number[]; processing: number[] }>();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    filteredGames.forEach(g => {
      const date = new Date(g.timestamp);
      const dayName = days[date.getDay()];
      
      if (!dayMap.has(dayName)) {
        dayMap.set(dayName, { memory: [], attention: [], processing: [] });
      }
      const dayData = dayMap.get(dayName)!;
      
      if (g.gameType === 'memory_recall') {
        dayData.memory.push(g.accuracy);
      } else if (g.gameType === 'attention_focus') {
        dayData.attention.push(g.accuracy);
      } else if (g.gameType === 'processing_speed') {
        dayData.processing.push(g.accuracy);
      }
    });
    
    return days.map(day => ({
      day,
      memory: dayMap.has(day) && dayMap.get(day)!.memory.length > 0
        ? Math.round(dayMap.get(day)!.memory.reduce((a, b) => a + b, 0) / dayMap.get(day)!.memory.length)
        : 0,
      attention: dayMap.has(day) && dayMap.get(day)!.attention.length > 0
        ? Math.round(dayMap.get(day)!.attention.reduce((a, b) => a + b, 0) / dayMap.get(day)!.attention.length)
        : 0,
      processing: dayMap.has(day) && dayMap.get(day)!.processing.length > 0
        ? Math.round(dayMap.get(day)!.processing.reduce((a, b) => a + b, 0) / dayMap.get(day)!.processing.length)
        : 0
    }));
  }, [filteredGames]);
  
  const timeOfDayData = generateTimeOfDayPerformance();
  
  // Use actual profile data for radar chart
  const radarData = [
    { subject: 'Language', A: profile?.languageComplexity.current ?? 0, fullMark: 100 },
    { subject: 'Memory', A: profile?.memoryRecall.current ?? 0, fullMark: 100 },
    { subject: 'Attention', A: profile?.attention.current ?? 0, fullMark: 100 },
    { subject: 'Processing', A: profile?.processingSpeed.current ?? 0, fullMark: 100 },
  ];
  
  return (
    <div className="space-y-4">
      {/* Radar Chart */}
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4">
          Cognitive Profile
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-sand)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 11, fill: 'var(--color-stone)' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="var(--color-sage)"
                fill="var(--color-sage)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Weekly Performance */}
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4">
          This Week's Performance
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 11, fill: 'var(--color-stone)' }}
              />
              <YAxis 
                domain={[50, 100]}
                tick={{ fontSize: 10, fill: 'var(--color-stone)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-warm-white)', 
                  border: '1px solid var(--color-sand)',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="memory" stroke="var(--color-terracotta)" strokeWidth={2} dot={false} name="Memory" />
              <Line type="monotone" dataKey="attention" stroke="var(--color-calm)" strokeWidth={2} dot={false} name="Attention" />
              <Line type="monotone" dataKey="processing" stroke="var(--color-happy)" strokeWidth={2} dot={false} name="Processing" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Game Performance Summary */}
      <div className="grid grid-cols-2 gap-3">
        <ProgressCard
          title="Memory Recall"
          value={profile?.memoryRecall.current ?? 0}
          color="var(--color-terracotta)"
          subtitle={profile?.memoryRecall.trend ? `${profile.memoryRecall.trend > 0 ? '+' : ''}${profile.memoryRecall.trend}% this week` : 'No data yet'}
        />
        <ProgressCard
          title="Attention Focus"
          value={profile?.attention.current ?? 0}
          color="var(--color-calm)"
          subtitle={profile?.attention.trend ? `${profile.attention.trend > 0 ? '+' : ''}${profile.attention.trend}% this week` : 'No data yet'}
        />
      </div>
      
      <InsightCard insight={sampleInsights[1]} />
    </div>
  );
}

function EmotionalTab({ dateFilter }: { dateFilter: DateFilter }) {
  const { speechAnalyses } = useStore();
  const filteredAnalyses = filterByDateRange(speechAnalyses, dateFilter);
  
  // Calculate emotional distribution from actual data
  const emotionalData = useMemo(() => {
    const emotionCounts: Record<string, number> = {
      Calm: 0,
      Happy: 0,
      Anxious: 0,
      Sad: 0,
      Agitated: 0,
      Neutral: 0
    };
    
    filteredAnalyses.forEach(a => {
      const emotion = a.emotionalState;
      const capitalized = emotion.charAt(0).toUpperCase() + emotion.slice(1);
      if (emotionCounts.hasOwnProperty(capitalized)) {
        emotionCounts[capitalized]++;
      }
    });
    
    const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
      return generateEmotionalDistribution();
    }
    
    return [
      { state: 'Calm', value: Math.round((emotionCounts.Calm / total) * 100), color: '#7EB5A6' },
      { state: 'Happy', value: Math.round((emotionCounts.Happy / total) * 100), color: '#E8C468' },
      { state: 'Neutral', value: Math.round((emotionCounts.Neutral / total) * 100), color: '#9B918A' },
      { state: 'Anxious', value: Math.round((emotionCounts.Anxious / total) * 100), color: '#D4A574' },
      { state: 'Sad', value: Math.round((emotionCounts.Sad / total) * 100), color: '#8B9DC3' },
      { state: 'Agitated', value: Math.round((emotionCounts.Agitated / total) * 100), color: '#C97B7B' }
    ].filter(item => item.value > 0);
  }, [filteredAnalyses]);
  
  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4">
          Emotional State Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emotionalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {emotionalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Emotional Breakdown */}
      <Card>
        <h3 className="font-display font-semibold text-[var(--color-charcoal)] mb-4">
          Emotional Patterns
        </h3>
        <div className="space-y-3">
          {emotionalData.map(item => (
            <div key={item.state} className="flex items-center gap-3">
              <EmotionIcon emotion={item.state.toLowerCase()} size={24} />
              <span className="flex-1 text-[var(--color-charcoal)]">{item.state}</span>
              <div className="w-32 h-2 bg-[var(--color-sand)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <span className="text-sm text-[var(--color-stone)] w-10 text-right">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Calming Mode Info */}
      <Card className="bg-gradient-to-br from-[var(--color-calm)] to-[var(--color-sage)] text-white">
        <h3 className="font-display font-semibold mb-2">Calming Mode</h3>
        <p className="text-sm opacity-90 mb-4">
          When anxiety or agitation is detected, Sage can automatically 
          initiate calming dialogue, play familiar music, or suggest taking a break.
        </p>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Auto-enabled</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Voice-triggered</span>
        </div>
      </Card>
      
      <InsightCard insight={sampleInsights[3]} />
    </div>
  );
}

// Filter and Export Controls Component
function FilterControls({ 
  dateFilter, 
  onDateFilterChange,
  onExport 
}: { 
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  onExport: (format: ExportFormat) => void;
}) {
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleCustomDateApply = () => {
    if (customStart && customEnd) {
      onDateFilterChange({
        range: 'custom',
        startDate: new Date(customStart),
        endDate: new Date(customEnd)
      });
      setShowCustomDates(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--color-stone)]" />
          <select
            value={dateFilter.range}
            onChange={(e) => {
              const range = e.target.value as DateRange;
              if (range === 'custom') {
                setShowCustomDates(true);
              } else {
                onDateFilterChange({ range });
              }
            }}
            className="px-3 py-2 rounded-lg border border-[var(--color-sand)] bg-white text-sm focus:border-[var(--color-sage)] outline-none"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range Inputs */}
        {showCustomDates && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--color-sand)] bg-white text-sm focus:border-[var(--color-sage)] outline-none"
            />
            <span className="text-[var(--color-stone)]">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--color-sand)] bg-white text-sm focus:border-[var(--color-sage)] outline-none"
            />
            <Button
              onClick={handleCustomDateApply}
              size="sm"
              variant="secondary"
            >
              Apply
            </Button>
            <button
              onClick={() => {
                setShowCustomDates(false);
                setCustomStart('');
                setCustomEnd('');
              }}
              className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Download size={18} className="text-[var(--color-stone)]" />
          <Button
            onClick={() => onExport('csv')}
            size="sm"
            variant="secondary"
          >
            CSV
          </Button>
          <Button
            onClick={() => onExport('json')}
            size="sm"
            variant="secondary"
          >
            JSON
          </Button>
          <Button
            onClick={() => onExport('pdf')}
            size="sm"
            variant="secondary"
          >
            PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function InsightsDashboard() {
  const { markInsightsRead, speechAnalyses, gameResults, insights } = useStore();
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ range: '30d' });
  
  // Mark insights as read when viewing
  useEffect(() => {
    markInsightsRead();
  }, [markInsightsRead]);

  // Filter data based on date range
  const filteredSpeechAnalyses = useMemo(() => 
    filterByDateRange(speechAnalyses, dateFilter),
    [speechAnalyses, dateFilter]
  );

  const filteredGameResults = useMemo(() => 
    filterByDateRange(gameResults, dateFilter),
    [gameResults, dateFilter]
  );

  const filteredInsights = useMemo(() => 
    filterByDateRange(insights, dateFilter),
    [insights, dateFilter]
  );

  // Export handler
  const handleExport = (format: ExportFormat) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `sage-insights-${timestamp}`;

    let dataToExport: any[] = [];

    switch (activeView) {
      case 'overview':
        dataToExport = [
          ...filteredSpeechAnalyses.map(a => ({
            type: 'speech',
            date: a.timestamp,
            complexity: a.metrics.vocabularyComplexity,
            grammar: a.metrics.grammarConsistency,
            emotionalState: a.emotionalState,
            speechRate: a.metrics.speechRate
          })),
          ...filteredGameResults.map(g => ({
            type: 'game',
            date: g.timestamp,
            gameType: g.gameType,
            accuracy: g.accuracy,
            responseTime: g.responseTime
          }))
        ];
        break;
      case 'language':
        dataToExport = filteredSpeechAnalyses.map(a => ({
          date: a.timestamp,
          vocabularyComplexity: a.metrics.vocabularyComplexity,
          grammarConsistency: a.metrics.grammarConsistency,
          sentenceLength: a.metrics.sentenceLength,
          speechRate: a.metrics.speechRate,
          fleschKincaidGrade: a.metrics.fleschKincaidGrade
        }));
        break;
      case 'cognitive':
        dataToExport = filteredGameResults.map(g => ({
          date: g.timestamp,
          gameType: g.gameType,
          accuracy: g.accuracy,
          responseTime: g.responseTime,
          repetitionsNeeded: g.repetitionsNeeded,
          frustrationDetected: g.frustrationDetected
        }));
        break;
      case 'emotional':
        dataToExport = filteredSpeechAnalyses.map(a => ({
          date: a.timestamp,
          emotionalState: a.emotionalState,
          timeOfDay: a.timeOfDay,
          duration: a.duration
        }));
        break;
    }

    if (dataToExport.length === 0) {
      alert('No data to export for the selected date range.');
      return;
    }

    switch (format) {
      case 'csv':
        exportToCSV(dataToExport, filename);
        break;
      case 'json':
        exportToJSON(dataToExport, filename);
        break;
      case 'pdf':
        exportToPDF(dataToExport, filename);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-charcoal)]">
              Insights
            </h2>
            <p className="text-[var(--color-stone)]">
              Track cognitive patterns over time
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Export Controls */}
      <FilterControls
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onExport={handleExport}
      />
      
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {tabItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === tab.id
                ? 'bg-[var(--color-sage)] text-white'
                : 'bg-[var(--color-sand)] text-[var(--color-stone)] hover:bg-[var(--color-sage-light)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeView === 'overview' && <OverviewTab dateFilter={dateFilter} />}
      {activeView === 'language' && <LanguageTab dateFilter={dateFilter} />}
      {activeView === 'cognitive' && <CognitiveTab dateFilter={dateFilter} />}
      {activeView === 'emotional' && <EmotionalTab dateFilter={dateFilter} />}
    </div>
  );
}

