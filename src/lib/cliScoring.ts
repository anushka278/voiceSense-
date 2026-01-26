// Cognitive Linguistic Index (CLI) Scoring
// This is NEVER shown to the user - internal only

export interface CLIMetrics {
  lexicalAccess: number; // 0-100
  fluency: number; // 0-100
  syntacticComplexity: number; // 0-100
  coherence: number; // 0-100
  processingSpeed: number; // 0-100
  attention: number; // 0-100
}

export interface CLIScore {
  overall: number; // 0-100 (weighted average)
  breakdown: CLIMetrics;
}

// Weights for each dimension
const WEIGHTS = {
  lexicalAccess: 0.20,
  fluency: 0.20,
  coherence: 0.20,
  syntacticComplexity: 0.15,
  processingSpeed: 0.15,
  attention: 0.10
};

/**
 * Calculate type-token ratio (unique words / total words)
 */
function calculateTypeTokenRatio(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words);
  return (uniqueWords.size / words.length) * 100;
}

/**
 * Estimate vocabulary complexity based on word frequency
 * Simple heuristic: longer words and less common words = higher complexity
 */
function calculateVocabularyComplexity(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length === 0) return 0;
  
  let complexityScore = 0;
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);
  
  words.forEach(word => {
    // Longer words = more complex
    if (word.length > 6) complexityScore += 2;
    else if (word.length > 4) complexityScore += 1;
    
    // Less common words = more complex
    if (!commonWords.has(word)) complexityScore += 1;
  });
  
  return Math.min(100, (complexityScore / words.length) * 20);
}

/**
 * Calculate lexical access score (20% weight)
 */
function calculateLexicalAccess(text: string, pauses: number, duration: number): number {
  const typeTokenRatio = calculateTypeTokenRatio(text);
  const vocabularyComplexity = calculateVocabularyComplexity(text);
  
  // Penalize for word substitutions/circumlocutions (simple heuristic: repeated phrases)
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  const highFreqWords = Object.values(wordFreq).filter(count => count > 5).length;
  const substitutionPenalty = Math.min(20, highFreqWords * 2);
  
  return Math.max(0, Math.min(100, (typeTokenRatio * 0.4 + vocabularyComplexity * 0.6) - substitutionPenalty));
}

/**
 * Calculate fluency score (20% weight)
 */
function calculateFluency(text: string, pauses: number, duration: number, fillerWords: number): number {
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  
  if (wordCount === 0 || duration === 0) return 0;
  
  const wordsPerMinute = (wordCount / duration) * 60;
  const pauseFrequency = duration > 0 ? (pauses / duration) * 60 : 0; // pauses per minute
  const fillerDensity = wordCount > 0 ? (fillerWords / wordCount) * 100 : 0;
  
  // Ideal: 150-200 WPM, low pause frequency, low filler density
  let score = 100;
  
  // Penalize for too slow or too fast
  if (wordsPerMinute < 100) score -= 20;
  else if (wordsPerMinute > 250) score -= 15;
  
  // Penalize for high pause frequency
  if (pauseFrequency > 10) score -= 30;
  else if (pauseFrequency > 5) score -= 15;
  
  // Penalize for high filler density
  if (fillerDensity > 10) score -= 25;
  else if (fillerDensity > 5) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate syntactic complexity (15% weight)
 */
function calculateSyntacticComplexity(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  let totalWords = 0;
  let totalClauses = 0;
  
  sentences.forEach(sentence => {
    const words = sentence.match(/\b\w+\b/g) || [];
    totalWords += words.length;
    
    // Count clauses (simple heuristic: conjunctions, relative pronouns, etc.)
    const clauseMarkers = sentence.match(/\b(and|or|but|because|since|when|where|which|that|who|whom|whose)\b/gi) || [];
    totalClauses += clauseMarkers.length + 1; // +1 for main clause
  });
  
  const avgSentenceLength = totalWords / sentences.length;
  const avgClausesPerSentence = totalClauses / sentences.length;
  
  // Score based on sentence length and clause embedding
  let score = 0;
  if (avgSentenceLength > 15) score += 40;
  else if (avgSentenceLength > 10) score += 30;
  else if (avgSentenceLength > 5) score += 20;
  
  if (avgClausesPerSentence > 2) score += 40;
  else if (avgClausesPerSentence > 1.5) score += 30;
  else if (avgClausesPerSentence > 1) score += 20;
  
  // Check for grammatical completeness (simple heuristic)
  const hasSubjectVerb = sentences.some(s => {
    const words = s.toLowerCase().match(/\b\w+\b/g) || [];
    return words.length >= 3; // At least subject + verb + object/complement
  });
  if (hasSubjectVerb) score += 20;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate coherence score (20% weight)
 * This is a simplified heuristic - in production, would use more sophisticated NLP
 */
function calculateCoherence(messages: Array<{ role: string; content: string; timestamp: Date }>): number {
  if (messages.length < 2) return 50; // Neutral score for very short conversations
  
  let score = 100;
  
  // Check for topic drift (simplified: check if topics change too frequently)
  const topics = messages.map(m => {
    const words = m.content.toLowerCase().match(/\b\w+\b/g) || [];
    return words.slice(0, 5).join(' '); // First 5 words as topic indicator
  });
  
  let topicChanges = 0;
  for (let i = 1; i < topics.length; i++) {
    // Simple similarity check
    const prevWords = topics[i - 1].split(' ');
    const currWords = topics[i].split(' ');
    const commonWords = prevWords.filter(w => currWords.includes(w));
    if (commonWords.length < 2) topicChanges++;
  }
  
  // Penalize excessive topic changes
  if (topicChanges > messages.length * 0.5) score -= 30;
  else if (topicChanges > messages.length * 0.3) score -= 15;
  
  // Check for repetition (user repeating same information)
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
  const uniqueMessages = new Set(userMessages);
  if (userMessages.length > uniqueMessages.size * 1.5) {
    score -= 20; // Significant repetition
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate processing speed (15% weight)
 */
function calculateProcessingSpeed(
  messages: Array<{ role: string; content: string; timestamp: Date }>,
  duration: number
): number {
  if (messages.length < 2 || duration === 0) return 50;
  
  // Calculate average response latency
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length < 2) return 50;
  
  let totalLatency = 0;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === 'user' && messages[i - 1].role === 'sage') {
      const latency = messages[i].timestamp.getTime() - messages[i - 1].timestamp.getTime();
      totalLatency += latency;
    }
  }
  
  const avgLatency = totalLatency / (userMessages.length - 1);
  const avgLatencySeconds = avgLatency / 1000;
  
  // Ideal response time: 1-3 seconds
  let score = 100;
  if (avgLatencySeconds > 10) score -= 40;
  else if (avgLatencySeconds > 5) score -= 25;
  else if (avgLatencySeconds > 3) score -= 10;
  else if (avgLatencySeconds < 0.5) score -= 15; // Too fast might indicate not thinking
  
  // Check for variability (consistent response times are better)
  const latencies: number[] = [];
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === 'user' && messages[i - 1].role === 'sage') {
      const latency = messages[i].timestamp.getTime() - messages[i - 1].timestamp.getTime();
      latencies.push(latency / 1000);
    }
  }
  
  if (latencies.length > 1) {
    const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const variance = latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / latencies.length;
    const stdDev = Math.sqrt(variance);
    
    // High variability = less consistent
    if (stdDev > mean * 0.5) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate attention/working memory score (10% weight)
 */
function calculateAttention(messages: Array<{ role: string; content: string; timestamp: Date }>): number {
  if (messages.length < 4) return 50; // Need enough conversation to assess
  
  let score = 100;
  
  // Check for ability to reference earlier parts of conversation
  const userMessages = messages.filter(m => m.role === 'user');
  let references = 0;
  
  for (let i = 1; i < userMessages.length; i++) {
    const current = userMessages[i].content.toLowerCase();
    const prev = userMessages[i - 1].content.toLowerCase();
    
    // Check for referential words
    const referentialWords = ['that', 'this', 'it', 'they', 'them', 'those', 'these', 'he', 'she', 'him', 'her'];
    const hasReference = referentialWords.some(word => current.includes(word));
    
    // Check for topic continuity
    const currentWords = current.match(/\b\w+\b/g) || [];
    const prevWords = prev.match(/\b\w+\b/g) || [];
    const commonWords = currentWords.filter(w => prevWords.includes(w) && w.length > 3);
    
    if (hasReference || commonWords.length > 2) {
      references++;
    }
  }
  
  const referenceRate = userMessages.length > 1 ? references / (userMessages.length - 1) : 0;
  
  // Low reference rate = difficulty maintaining context
  if (referenceRate < 0.2) score -= 30;
  else if (referenceRate < 0.4) score -= 15;
  
  // Check for consistency of details (simplified)
  // In production, would track specific facts mentioned and check for contradictions
  const allUserText = userMessages.map(m => m.content.toLowerCase()).join(' ');
  const words = allUserText.match(/\b\w+\b/g) || [];
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // High repetition of same words might indicate difficulty
  const highRepWords = Object.values(wordFreq).filter(count => count > 10).length;
  if (highRepWords > 5) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate overall CLI score from a talk session
 */
export function calculateCLIScore(
  messages: Array<{ role: string; content: string; timestamp: Date }>,
  duration: number,
  pauses: number = 0,
  fillerWords: number = 0
): { overall: number; breakdown: CLIMetrics } {
  const fullText = messages.map(m => m.content).join(' ');
  
  const lexicalAccess = calculateLexicalAccess(fullText, pauses, duration);
  const fluency = calculateFluency(fullText, pauses, duration, fillerWords);
  const syntacticComplexity = calculateSyntacticComplexity(fullText);
  const coherence = calculateCoherence(messages);
  const processingSpeed = calculateProcessingSpeed(messages, duration);
  const attention = calculateAttention(messages);
  
  const breakdown: CLIMetrics = {
    lexicalAccess,
    fluency,
    syntacticComplexity,
    coherence,
    processingSpeed,
    attention
  };
  
  // Calculate weighted average
  const overall = Math.round(
    lexicalAccess * WEIGHTS.lexicalAccess +
    fluency * WEIGHTS.fluency +
    syntacticComplexity * WEIGHTS.syntacticComplexity +
    coherence * WEIGHTS.coherence +
    processingSpeed * WEIGHTS.processingSpeed +
    attention * WEIGHTS.attention
  );
  
  return {
    overall: Math.max(0, Math.min(100, overall)),
    breakdown
  };
}

/**
 * Establish personal baseline after 7-10 sessions
 */
export function calculateBaseline(sessions: Array<{ cliScore: number | null }>): number | null {
  const validScores = sessions
    .map(s => s.cliScore)
    .filter((score): score is number => score !== null);
  
  if (validScores.length < 7) return null;
  
  // Use median of first 10 sessions as baseline
  const baselineScores = validScores.slice(0, Math.min(10, validScores.length));
  baselineScores.sort((a, b) => a - b);
  const mid = Math.floor(baselineScores.length / 2);
  
  return baselineScores.length % 2 === 0
    ? (baselineScores[mid - 1] + baselineScores[mid]) / 2
    : baselineScores[mid];
}
