/**
 * Supabase Client Configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

// Debug: Log what we're getting (remove in production)
if (typeof window === 'undefined') {
  console.log('🔍 Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    urlLength: supabaseUrl.length,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey.length,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
  });
}

// Only create Supabase client if credentials are provided
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
  throw new Error(
    'Supabase credentials are missing!\n\n' +
    'Please ensure your .env.local file contains:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'Then restart your dev server with: npm run dev'
  );
}

// Create Supabase client with actual credentials
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export { supabase };

// Database types (will be generated from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          name: string;
          preferred_name: string;
          cognitive_profile: any;
          family_members: any[];
          is_onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          name: string;
          preferred_name: string;
          cognitive_profile?: any;
          family_members?: any[];
          is_onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          name?: string;
          preferred_name?: string;
          cognitive_profile?: any;
          family_members?: any[];
          is_onboarded?: boolean;
          updated_at?: string;
        };
      };
      talk_sessions: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          messages: any[];
          transcript: string;
          cli_score: number | null;
          cli_breakdown: any | null;
          status: string;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: string;
          messages: any[];
          transcript: string;
          cli_score?: number | null;
          cli_breakdown?: any | null;
          status: string;
          duration: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: string;
          messages?: any[];
          transcript?: string;
          cli_score?: number | null;
          cli_breakdown?: any | null;
          status?: string;
          duration?: number;
        };
      };
      health_cards: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          date: string;
          category: string;
          description: string;
          severity: string;
          confidence: string;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          date: string;
          category: string;
          description: string;
          severity: string;
          confidence: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          date?: string;
          category?: string;
          description?: string;
          severity?: string;
          confidence?: string;
          confirmed?: boolean;
        };
      };
      speech_analyses: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          transcript: string;
          word_count: number;
          avg_word_length: number;
          sentence_count: number;
          avg_sentence_length: number;
          emotional_state: string;
          language_complexity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: string;
          transcript: string;
          word_count: number;
          avg_word_length: number;
          sentence_count: number;
          avg_sentence_length: number;
          emotional_state: string;
          language_complexity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: string;
          transcript?: string;
          word_count?: number;
          avg_word_length?: number;
          sentence_count?: number;
          avg_sentence_length?: number;
          emotional_state?: string;
          language_complexity?: number;
        };
      };
      game_results: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          game_type: string;
          score: number;
          time_taken: number;
          accuracy: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: string;
          game_type: string;
          score: number;
          time_taken: number;
          accuracy: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: string;
          game_type?: string;
          score?: number;
          time_taken?: number;
          accuracy?: number;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          type: string;
          title: string;
          description: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: string;
          type: string;
          title: string;
          description: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: string;
          type?: string;
          title?: string;
          description?: string;
          read?: boolean;
        };
      };
      family_requests: {
        Row: {
          id: string;
          from_user_id: string;
          from_name: string;
          to_user_id: string;
          to_name: string;
          relationship: string;
          timestamp: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          from_name: string;
          to_user_id: string;
          to_name: string;
          relationship: string;
          timestamp: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          from_name?: string;
          to_user_id?: string;
          to_name?: string;
          relationship?: string;
          timestamp?: string;
          status?: string;
        };
      };
    };
  };
}
