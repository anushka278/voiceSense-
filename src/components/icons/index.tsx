'use client';

import { 
  Mic, 
  MicOff, 
  Home, 
  Brain, 
  Heart, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Calendar,
  MessageCircle,
  BookOpen,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Plus,
  Image,
  User,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  CloudSun,
  Smile,
  Meh,
  Frown,
  Activity,
  Coffee,
  Download,
  Filter,
  LogOut,
  Share2,
  Send,
  Check,
  XCircle
} from 'lucide-react';

export {
  LogOut,
  Share2,
  Mic,
  MicOff,
  Home,
  Brain,
  Heart,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Calendar,
  MessageCircle,
  BookOpen,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Plus,
  Image,
  User,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  CloudSun,
  Smile,
  Meh,
  Frown,
  Activity,
  Coffee,
  Download,
  Filter,
  Send,
  Check,
  XCircle
};

// Voice wave animation component
export function VoiceWave({ isActive, size = 'md' }: { isActive: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const heights = {
    sm: ['h-3', 'h-5', 'h-4', 'h-6', 'h-3'],
    md: ['h-4', 'h-8', 'h-6', 'h-10', 'h-5'],
    lg: ['h-6', 'h-12', 'h-8', 'h-14', 'h-7']
  };
  
  const widths = {
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1.5'
  };
  
  return (
    <div className="flex items-center justify-center gap-1">
      {heights[size].map((height, i) => (
        <div
          key={i}
          className={`${widths[size]} ${isActive ? height : 'h-1'} bg-current rounded-full transition-all duration-200 ${
            isActive ? 'voice-wave-bar' : ''
          }`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

// Logo component - Hands cupping upward with leaf/flame shapes and glowing center
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div className={`${sizes[size]} relative flex items-center justify-center`}>
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dark green circular outline */}
        <circle cx="50" cy="50" r="48" stroke="#5F7D61" strokeWidth="2"/>
        
        {/* Left hand cupping upward (beige/skin-tone) */}
        <path d="M30 75C30 75 25 65 25 55C25 45 35 45 35 55C35 65 45 75 45 75" stroke="#D2B48C" strokeWidth="4" strokeLinecap="round" fill="none"/>
        
        {/* Right hand cupping upward (beige/skin-tone) */}
        <path d="M70 75C70 75 75 65 75 55C75 45 65 45 65 55C65 65 55 75 55 75" stroke="#D2B48C" strokeWidth="4" strokeLinecap="round" fill="none"/>
        
        {/* Left leaf/flame shape - darker green, curving upward and inward */}
        <path d="M42 65Q38 55 42 45Q46 38 50 42L50 65Z" fill="#5A7A57"/>
        
        {/* Right leaf/flame shape - lighter green, mirroring left, curving upward and inward */}
        <path d="M58 65Q62 55 58 45Q54 38 50 42L50 65Z" fill="#8DA08E" opacity="0.85"/>
        
        {/* Outer circle - medium green, matching darker leaf */}
        <circle cx="50" cy="42" r="7" fill="#5A7A57"/>
        
        {/* Inner circle - golden-brown/bronze with glowing effect */}
        <defs>
          <radialGradient id="logoGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E6CCB2" stopOpacity="1"/>
            <stop offset="50%" stopColor="#D2B48C" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#C4846C" stopOpacity="0.8"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="42" r="4.5" fill="url(#logoGlow)"/>
        {/* Highlight for 3D glowing effect */}
        <circle cx="50" cy="40" r="2" fill="#F5E6D3" opacity="0.9"/>
      </svg>
    </div>
  );
}

// Emotion icon component
export function EmotionIcon({ emotion, size = 24 }: { emotion: string; size?: number }) {
  switch (emotion) {
    case 'happy':
      return <Smile size={size} className="text-[var(--color-happy)]" />;
    case 'calm':
      return <Coffee size={size} className="text-[var(--color-calm)]" />;
    case 'anxious':
      return <Activity size={size} className="text-[var(--color-anxious)]" />;
    case 'sad':
      return <Frown size={size} className="text-[var(--color-sad)]" />;
    case 'agitated':
      return <AlertCircle size={size} className="text-[var(--color-agitated)]" />;
    default:
      return <Meh size={size} className="text-[var(--color-stone)]" />;
  }
}

// Time of day icon
export function TimeOfDayIcon({ time, size = 24 }: { time: string; size?: number }) {
  switch (time) {
    case 'morning':
      return <Sunrise size={size} className="text-amber-500" />;
    case 'afternoon':
      return <Sun size={size} className="text-yellow-500" />;
    case 'evening':
      return <CloudSun size={size} className="text-orange-500" />;
    case 'night':
      return <Moon size={size} className="text-indigo-400" />;
    default:
      return <Sun size={size} className="text-yellow-500" />;
  }
}

// Trend indicator
export function TrendIndicator({ value, size = 16 }: { value: number; size?: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center text-green-600">
        <TrendingUp size={size} />
        <span className="ml-1 text-sm">+{value}%</span>
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="inline-flex items-center text-red-500">
        <TrendingDown size={size} />
        <span className="ml-1 text-sm">{value}%</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[var(--color-stone)]">
      <Minus size={size} />
      <span className="ml-1 text-sm">Stable</span>
    </span>
  );
}

