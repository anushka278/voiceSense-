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
  FamilyRequest,
  MemorySession,
  LifeChapter
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabaseService.ts:53',message:'findByUsername called',data:{username,normalized:username.toLowerCase().trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .single();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabaseService.ts:60',message:'findByUsername result',data:{username,found:!!data,userId:data?.id,dbUsername:data?.username,errorCode:error?.code,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

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
        // CRITICAL: Map hasCompletedOnboarding to is_onboarded in database
        is_onboarded: updates.hasCompletedOnboarding !== undefined ? updates.hasCompletedOnboarding : undefined
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
      hasCompletedOnboarding: true // CRITICAL: Use hasCompletedOnboarding
    });
  },
  
  async findById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, preferred_name, name')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
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
        session_id: card.sourceSessionId || null,
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
      sourceSessionId: row.session_id,
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
        timestamp: result.timestamp instanceof Date ? result.timestamp.toISOString() : new Date(result.timestamp).toISOString(),
        game_type: result.gameType,
        score: result.score || 0,
        time_taken: result.timeTaken || 0,
        accuracy: result.accuracy || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating game result:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
        resultId: result.id
      });
      throw error;
    }
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
  /**
   * Find user by username
   */
  async findUserByUsername(username: string): Promise<{ id: string; username: string; preferred_name: string } | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, preferred_name')
      .eq('username', username.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  },

  /**
   * Check if connection or request already exists
   */
  async checkExistingConnection(fromUserId: string, toUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('family_requests')
      .select('id')
      .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
      .in('status', ['pending', 'accepted'])
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  },

  /**
   * Create a connection request
   */
  async createRequest(
    fromUserId: string,
    fromName: string,
    toUserId: string,
    toName: string,
    relationship: string
  ) {
    const { data, error } = await supabase
      .from('family_requests')
      .insert({
        from_user_id: fromUserId,
        from_name: fromName,
        to_user_id: toUserId,
        to_name: toName,
        relationship,
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all requests for a user (both sent and received)
   */
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('family_requests')
      .select(`
        *,
        from_user:users!family_requests_from_user_id_fkey(id, username, preferred_name),
        to_user:users!family_requests_to_user_id_fkey(id, username, preferred_name)
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      fromUserId: row.from_user_id,
      fromUsername: row.from_user?.username || '',
      fromName: row.from_name,
      toUserId: row.to_user_id,
      toUsername: row.to_user?.username || '',
      toName: row.to_name,
      relationship: row.relationship,
      timestamp: new Date(row.timestamp),
      status: (row.status === 'denied' ? 'rejected' : row.status) as 'pending' | 'accepted' | 'rejected',
      acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined
    }));
  },

  /**
   * Get pending requests received by a user
   */
  async getPendingRequests(userId: string) {
    const { data, error } = await supabase
      .from('family_requests')
      .select(`
        *,
        from_user:users!family_requests_from_user_id_fkey(username, preferred_name)
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      fromUserId: row.from_user_id,
      fromUsername: row.from_user?.username || '',
      fromName: row.from_name,
      toUserId: row.to_user_id,
      toUsername: '',
      toName: row.to_name,
      relationship: row.relationship,
      timestamp: new Date(row.timestamp),
      status: 'pending' as const
    }));
  },

  /**
   * Update request status
   */
  async updateStatus(requestId: string, status: 'pending' | 'accepted' | 'rejected' | 'denied') {
    // Map 'denied' to 'rejected' for consistency with TypeScript types
    const dbStatus = status === 'denied' ? 'rejected' : status;
    const updateData: any = { status: dbStatus };
    // Only set accepted_at if status is accepted (column may not exist in older schemas)
    if (status === 'accepted') {
      try {
        updateData.accepted_at = new Date().toISOString();
      } catch (e) {
        // If accepted_at column doesn't exist, continue without it
        console.warn('Could not set accepted_at, column may not exist:', e);
      }
    }
    
    const { data, error } = await supabase
      .from('family_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      // Extract error message properly - Supabase errors have message, code, details, hint
      const errorMessage = error.message || error.details || String(error);
      const errorCode = error.code || 'UNKNOWN';
      
      console.error('Supabase updateStatus error:', {
        message: errorMessage,
        code: errorCode,
        details: error.details,
        hint: error.hint,
        requestId,
        status
      });
      
      // Throw error with proper message
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = errorCode;
      (enhancedError as any).details = error.details;
      (enhancedError as any).hint = error.hint;
      throw enhancedError;
    }
    return data;
  },

  /**
   * Get accepted connections for a user
   */
  async getAcceptedConnections(userId: string) {
    const { data, error } = await supabase
      .from('family_requests')
      .select(`
        *,
        from_user:users!family_requests_from_user_id_fkey(id, username, preferred_name),
        to_user:users!family_requests_to_user_id_fkey(id, username, preferred_name)
      `)
      .or(`and(from_user_id.eq.${userId},status.eq.accepted),and(to_user_id.eq.${userId},status.eq.accepted)`)
      .order('accepted_at', { ascending: false });

    if (error) throw error;
    
    return data.map(row => {
      const isRequester = row.from_user_id === userId;
      const otherUser = isRequester ? row.to_user : row.from_user;
      
      // The relationship stored is from the requester's perspective
      // e.g., if X connects to Y and enters "mother", it means "Y is my mother"
      //   - X (requester) sees: "Y is my mother" (use as-is, capitalized)
      //   - Y (receiver) sees: "X is my child" (reverse, capitalized)
      const relationship = isRequester 
        ? capitalizeFirst(row.relationship)  // Requester sees relationship as entered (capitalized)
        : reverseRelationship(row.relationship);  // Receiver sees reversed relationship (already capitalized in function)
      
      return {
        id: row.id,
        connectionId: row.id,
        userId: otherUser?.id || '',
        username: otherUser?.username || '',
        name: isRequester ? row.to_name : row.from_name,
        relationship: relationship,
        status: 'connected' as const
      };
    });
  }
};

/**
 * Reverse a family relationship from the other person's perspective
 * e.g., if X says "I am Y's daughter", then from Y's perspective, X is their "child"
 * e.g., if X says "Y is my mother", then from Y's perspective, X is their "child"
 */
function reverseRelationship(relationship: string): string {
  const relationshipLower = relationship.toLowerCase().trim();
  
  // Relationship reversals: what the other person sees
  // If requester says "I am their daughter", receiver sees "child"
  // If requester says "They are my mother", receiver sees "child"
  const reversals: Record<string, string> = {
    // Parent -> Child
    'mother': 'child',
    'father': 'child',
    'parent': 'child',
    'mom': 'child',
    'dad': 'child',
    'mama': 'child',
    'papa': 'child',
    
    // Child -> Parent
    'daughter': 'parent',
    'son': 'parent',
    'child': 'parent',
    'children': 'parent',
    'kid': 'parent',
    'kids': 'parent',
    
    // Sibling relationships (symmetric - both see as sibling)
    'sister': 'sibling',
    'brother': 'sibling',
    'sibling': 'sibling',
    'siblings': 'sibling',
    
    // Grandparent -> Grandchild
    'grandmother': 'grandchild',
    'grandfather': 'grandchild',
    'grandparent': 'grandchild',
    'grandma': 'grandchild',
    'grandpa': 'grandchild',
    'nana': 'grandchild',
    'papa': 'grandchild',
    
    // Grandchild -> Grandparent
    'grandchild': 'grandparent',
    'granddaughter': 'grandparent',
    'grandson': 'grandparent',
    
    // Aunt/Uncle -> Niece/Nephew
    'aunt': 'niece/nephew',
    'uncle': 'niece/nephew',
    'niece': 'aunt/uncle',
    'nephew': 'aunt/uncle',
    
    // Spouse relationships (symmetric)
    'wife': 'spouse',
    'husband': 'spouse',
    'spouse': 'spouse',
    'partner': 'partner',
    
    // Cousin relationships (symmetric)
    'cousin': 'cousin',
    'cousins': 'cousin',
  };
  
  // Check for exact match first
  if (reversals[relationshipLower]) {
    return capitalizeFirst(reversals[relationshipLower]);
  }
  
  // Check for partial matches (e.g., "my mother" -> "child")
  for (const [key, value] of Object.entries(reversals)) {
    if (relationshipLower.includes(key)) {
      return capitalizeFirst(value);
    }
  }
  
  // If no match found, return generic "family member" (capitalized)
  return capitalizeFirst('family member');
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  // Handle special cases like "niece/nephew" -> "Niece/Nephew"
  if (str.includes('/')) {
    return str.split('/').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('/');
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Family Message Operations
 */
export const familyMessageService = {
  /**
   * Send a message
   */
  async sendMessage(
    connectionId: string,
    senderUserId: string,
    receiverUserId: string,
    content: string
  ) {
    const { data, error } = await supabase
      .from('family_messages')
      .insert({
        connection_id: connectionId,
        sender_user_id: senderUserId,
        receiver_user_id: receiverUserId,
        content,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8fb62612-9c1c-4510-8e79-ecccaf90d46a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabaseService.ts:607',message:'sendMessage error detected',data:{connectionId,senderUserId,receiverUserId,errorType:error?.constructor?.name,hasMessage:!!error?.message,hasCode:!!error?.code,hasDetails:!!error?.details,hasHint:!!error?.hint,errorKeys:Object.keys(error||{}),errorOwnProps:Object.getOwnPropertyNames(error||{}),errorString:String(error),errorToString:error?.toString?.()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Try multiple ways to extract error info
      const errorInfo: any = {
        connectionId,
        senderUserId,
        receiverUserId,
        errorType: error?.constructor?.name,
        errorString: String(error),
        errorToString: error?.toString?.(),
        hasMessage: !!error?.message,
        hasCode: !!error?.code,
        hasDetails: !!error?.details,
        hasHint: !!error?.hint,
      };
      
      // Try direct property access
      try {
        errorInfo.message = error?.message;
        errorInfo.code = error?.code;
        errorInfo.details = error?.details;
        errorInfo.hint = error?.hint;
      } catch (e) {}
      
      // Try Object.keys
      try {
        errorInfo.keys = Object.keys(error || {});
      } catch (e) {}
      
      // Try getOwnPropertyNames
      try {
        errorInfo.ownProps = Object.getOwnPropertyNames(error || {});
      } catch (e) {}
      
      console.error('Supabase sendMessage error:', errorInfo);
      
      // Extract error message properly
      const errorMessage = error?.message || error?.details || String(error);
      
      // Throw error with proper message
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = error?.code;
      (enhancedError as any).details = error?.details;
      (enhancedError as any).hint = error?.hint;
      throw enhancedError;
    }
    return data;
  },

  /**
   * Get messages for a connection
   */
  async getMessages(connectionId: string) {
    const { data, error } = await supabase
      .from('family_messages')
      .select(`
        *,
        sender:users!family_messages_sender_user_id_fkey(id, username, preferred_name),
        receiver:users!family_messages_receiver_user_id_fkey(id, username, preferred_name)
      `)
      .eq('connection_id', connectionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      fromUsername: row.sender?.username || '',
      fromName: row.sender?.preferred_name || '',
      toUsername: row.receiver?.username || '',
      content: row.content,
      timestamp: new Date(row.timestamp),
      read: row.read || false
    }));
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('family_messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) {
      // Log error details directly (Supabase errors have non-enumerable properties)
      console.error('Supabase markAsRead error:', {
        messageId,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
        errorString: String(error),
        errorType: error?.constructor?.name
      });
      
      // Extract error message properly
      const errorMessage = error?.message || error?.details || String(error);
      
      // Throw error with proper message
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = error?.code;
      (enhancedError as any).details = error?.details;
      (enhancedError as any).hint = error?.hint;
      throw enhancedError;
    }
  },

  /**
   * Subscribe to new messages for a connection
   */
  subscribeToMessages(connectionId: string, callback: (message: any) => void) {
    return supabase
      .channel(`family_messages:${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_messages',
          filter: `connection_id=eq.${connectionId}`
        },
        callback
      )
      .subscribe();
  }
};

/**
 * Memory Session Operations
 */
export const memorySessionService = {
  async create(userId: string, session: MemorySession) {
    // Ensure questions array exists and is properly formatted
    const questions = (session.questions || []).map(q => ({
      question: q.question || '',
      response: q.response || '',
      timestamp: q.timestamp instanceof Date ? q.timestamp.toISOString() : new Date(q.timestamp).toISOString()
    }));
    
    const { data, error } = await supabase
      .from('memory_sessions')
      .insert({
        id: session.id,
        user_id: userId,
        chapter: session.chapter,
        timestamp: session.timestamp instanceof Date ? session.timestamp.toISOString() : new Date(session.timestamp).toISOString(),
        transcript: session.transcript || '',
        questions: questions,
        status: session.status || 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating memory session:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
        sessionId: session.id
      });
      throw error;
    }
    return data;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('memory_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    // Convert back to MemorySession format
    return data.map(row => ({
      id: row.id,
      chapter: row.chapter as LifeChapter,
      timestamp: new Date(row.timestamp),
      transcript: row.transcript,
      questions: (row.questions || []).map((q: any) => ({
        question: q.question,
        response: q.response,
        timestamp: new Date(q.timestamp)
      })),
      status: row.status as 'active' | 'completed' | 'paused'
    }));
  },

  async updateStatus(sessionId: string, status: 'active' | 'completed' | 'paused') {
    const { data, error } = await supabase
      .from('memory_sessions')
      .update({ status })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
