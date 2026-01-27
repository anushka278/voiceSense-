/**
 * Supabase Service Layer
 * Handles all database operations for the Sage app
 */

import { supabase } from './supabase';
import type { 
  User, 
  TalkSession, 
  HealthCard, 
  SpeechAnalysis, 
  CognitiveGameResult, 
  Insight,
  FamilyRequest
} from '@/types';
// Simple password hashing (in production, use Supabase Auth instead)
// NOTE: This is NOT secure - you should migrate to Supabase Auth for production
async function hashPassword(password: string): Promise<string> {
  // Base64 encoding (NOT secure - use Supabase Auth instead)
  // This is a placeholder for development only
  return btoa(password);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return btoa(password) === hash;
}

/**
 * User Operations
 */
export const userService = {
  async create(username: string, password: string, name: string, preferredName: string) {
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase().trim(),
        password_hash: passwordHash,
        name,
        preferred_name: preferredName,
        is_onboarded: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async login(username: string, password: string) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    return user;
  },

  async update(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        preferred_name: updates.preferredName,
        cognitive_profile: updates.cognitiveProfile,
        family_members: updates.familyMembers,
        is_onboarded: updates.isOnboarded !== undefined ? updates.isOnboarded : undefined
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeOnboarding(userId: string, name: string, preferredName: string) {
    return this.update(userId, {
      name,
      preferredName,
      isOnboarded: true
    });
  }
};

/**
 * Talk Session Operations
 */
export const talkSessionService = {
  async create(userId: string, session: TalkSession) {
    const { data, error } = await supabase
      .from('talk_sessions')
      .insert({
        id: session.id,
        user_id: userId,
        timestamp: session.timestamp.toISOString(),
        messages: session.messages,
        transcript: session.transcript,
        cli_score: session.cliScore,
        cli_breakdown: session.cliBreakdown,
        status: session.status,
        duration: session.duration
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('talk_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    // Convert back to TalkSession format
    return data.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      messages: row.messages,
      transcript: row.transcript,
      cliScore: row.cli_score,
      cliBreakdown: row.cli_breakdown,
      status: row.status,
      duration: row.duration
    }));
  }
};

/**
 * Health Card Operations
 */
export const healthCardService = {
  async create(userId: string, card: HealthCard) {
    const { data, error } = await supabase
      .from('health_cards')
      .insert({
        id: card.id,
        user_id: userId,
        session_id: card.sessionId,
        date: card.date.toISOString(),
        category: card.category,
        description: card.description,
        severity: card.severity,
        confidence: card.confidence,
        confirmed: card.confirmed
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('health_cards')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      date: new Date(row.date),
      category: row.category,
      description: row.description,
      severity: row.severity,
      confidence: row.confidence,
      confirmed: row.confirmed
    }));
  },

  async update(cardId: string, updates: Partial<HealthCard>) {
    const { data, error } = await supabase
      .from('health_cards')
      .update({
        confirmed: updates.confirmed,
        description: updates.description,
        severity: updates.severity
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * Speech Analysis Operations
 */
export const speechAnalysisService = {
  async create(userId: string, analysis: SpeechAnalysis) {
    const { data, error } = await supabase
      .from('speech_analyses')
      .insert({
        id: analysis.id,
        user_id: userId,
        timestamp: analysis.timestamp.toISOString(),
        transcript: analysis.transcript,
        word_count: analysis.wordCount,
        avg_word_length: analysis.avgWordLength,
        sentence_count: analysis.sentenceCount,
        avg_sentence_length: analysis.avgSentenceLength,
        emotional_state: analysis.emotionalState,
        language_complexity: analysis.languageComplexity
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('speech_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      transcript: row.transcript,
      wordCount: row.word_count,
      avgWordLength: row.avg_word_length,
      sentenceCount: row.sentence_count,
      avgSentenceLength: row.avg_sentence_length,
      emotionalState: row.emotional_state,
      languageComplexity: row.language_complexity
    }));
  }
};

/**
 * Game Result Operations
 */
export const gameResultService = {
  async create(userId: string, result: CognitiveGameResult) {
    const { data, error } = await supabase
      .from('game_results')
      .insert({
        id: result.id,
        user_id: userId,
        timestamp: result.timestamp.toISOString(),
        game_type: result.gameType,
        score: result.score,
        time_taken: result.timeTaken,
        accuracy: result.accuracy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      gameType: row.game_type,
      score: row.score,
      timeTaken: row.time_taken,
      accuracy: row.accuracy
    }));
  }
};

/**
 * Insight Operations
 */
export const insightService = {
  async create(userId: string, insight: Insight) {
    const { data, error } = await supabase
      .from('insights')
      .insert({
        id: insight.id,
        user_id: userId,
        timestamp: insight.timestamp.toISOString(),
        type: insight.type,
        title: insight.title,
        description: insight.description,
        read: insight.read || false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      type: row.type,
      title: row.title,
      description: row.description,
      read: row.read
    }));
  },

  async markAsRead(userId: string) {
    const { error } = await supabase
      .from('insights')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }
};

/**
 * Family Request Operations
 */
export const familyRequestService = {
  async create(request: FamilyRequest & { fromUserId: string; toUserId: string }) {
    const { data, error } = await supabase
      .from('family_requests')
      .insert({
        id: request.id,
        from_user_id: request.fromUserId,
        from_name: request.fromName,
        to_user_id: request.toUserId,
        to_name: request.toName || '',
        relationship: request.relationship,
        timestamp: request.timestamp.toISOString(),
        status: request.status
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('family_requests')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      fromUsername: '', // Will need to join with users table
      fromName: row.from_name,
      toUsername: '', // Will need to join with users table
      toName: row.to_name,
      relationship: row.relationship,
      timestamp: new Date(row.timestamp),
      status: row.status as 'pending' | 'accepted' | 'rejected'
    }));
  },

  async updateStatus(requestId: string, status: 'pending' | 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('family_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
