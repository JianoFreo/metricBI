import { v4 as uuidv4 } from 'uuid';
import { logger } from '@common/utils/logger.js';
import { ChatSession, ChatMessage, ChatSessionSchema } from '../schemas/chat.schemas.js';

/**
 * Session Memory Service
 * Manages basic chat session context and conversation history
 * Stores in-memory with optional persistence hooks
 */
export class SessionMemoryService {
  private static readonly SESSION_TTL = 30 * 60 * 1000; // 30 minutes
  private static sessions = new Map<string, ChatSession>();
  private static sessionExpiryTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Create new chat session
   */
  static createSession(options: {
    userId: string;
    tenantId: string;
    title?: string;
    focusAreas?: string[];
  }): ChatSession {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TTL);

    const session: ChatSession = {
      id: sessionId,
      userId: options.userId,
      tenantId: options.tenantId,
      title: options.title || `Chat Session - ${now.toLocaleDateString()}`,
      messages: [],
      context: {
        focusAreas: options.focusAreas || [],
      },
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    // Validate schema
    ChatSessionSchema.parse(session);

    // Store session
    this.sessions.set(sessionId, session);

    // Set expiry timer
    this.setSessionExpiry(sessionId);

    logger.info('Created chat session', {
      sessionId,
      userId: options.userId,
      tenantId: options.tenantId,
    });

    return session;
  }

  /**
   * Get session by ID
   */
  static getSession(sessionId: string): ChatSession | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      logger.warn('Session not found', { sessionId });
      return null;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      this.deleteSession(sessionId);
      logger.warn('Session expired', { sessionId });
      return null;
    }

    return session;
  }

  /**
   * Add message to session
   */
  static addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): ChatMessage {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      timestamp: new Date(),
      ...message,
    };

    // Validate message schema
    const { error } = ChatSessionSchema.shape.messages.element.safeParse(chatMessage);
    if (error) {
      throw new Error(`Invalid message format: ${error.message}`);
    }

    session.messages.push(chatMessage);
    session.updatedAt = new Date();

    // Refresh expiry timer
    this.setSessionExpiry(sessionId);

    logger.info('Added message to session', {
      sessionId,
      messageCount: session.messages.length,
      role: message.role,
    });

    return chatMessage;
  }

  /**
   * Get conversation history for session
   */
  static getHistory(sessionId: string, limit?: number): ChatMessage[] {
    const session = this.getSession(sessionId);
    if (!session) {
      return [];
    }

    let messages = session.messages;

    if (limit && limit > 0) {
      messages = messages.slice(-limit);
    }

    return messages;
  }

  /**
   * Get recent context from session
   * Returns the last N messages for context window
   */
  static getRecentContext(sessionId: string, windowSize: number = 10): ChatMessage[] {
    const messages = this.getHistory(sessionId);
    return messages.slice(Math.max(0, messages.length - windowSize));
  }

  /**
   * Build system context from session
   */
  static buildSessionContext(sessionId: string) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const recentMessages = this.getRecentContext(sessionId, 6);

    return {
      sessionId,
      focusAreas: session.context?.focusAreas || [],
      recentMessages,
      messageCount: session.messages.length,
      sessionAge: Date.now() - session.createdAt.getTime(),
      lastActivityAge: Date.now() - session.updatedAt.getTime(),
    };
  }

  /**
   * Update session context
   */
  static updateSessionContext(
    sessionId: string,
    contextUpdate: Partial<ChatSession['context']>
  ): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.context = {
      ...session.context,
      ...contextUpdate,
    };
    session.updatedAt = new Date();

    logger.info('Updated session context', {
      sessionId,
      contextKeys: Object.keys(contextUpdate),
    });
  }

  /**
   * Delete session
   */
  static deleteSession(sessionId: string): void {
    // Clear expiry timer
    const timer = this.sessionExpiryTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.sessionExpiryTimers.delete(sessionId);
    }

    this.sessions.delete(sessionId);

    logger.info('Deleted chat session', { sessionId });
  }

  /**
   * Clear all sessions for user
   */
  static clearUserSessions(userId: string): number {
    let count = 0;
    const sessionIds = Array.from(this.sessions.keys());

    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session?.userId === userId) {
        this.deleteSession(sessionId);
        count++;
      }
    }

    logger.info('Cleared user sessions', { userId, count });
    return count;
  }

  /**
   * Clear all sessions for tenant
   */
  static clearTenantSessions(tenantId: string): number {
    let count = 0;
    const sessionIds = Array.from(this.sessions.keys());

    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session?.tenantId === tenantId) {
        this.deleteSession(sessionId);
        count++;
      }
    }

    logger.info('Cleared tenant sessions', { tenantId, count });
    return count;
  }

  /**
   * Get all sessions for user
   */
  static getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId && s.expiresAt > new Date())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Get session statistics
   */
  static getSessionStats(sessionId: string) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const messages = session.messages;
    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    const userTokens = userMessages.reduce((sum, m) => sum + (m.metadata?.tokenCount || 0), 0);
    const assistantTokens = assistantMessages.reduce((sum, m) => sum + (m.metadata?.tokenCount || 0), 0);

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      totalTokens: userTokens + assistantTokens,
      userTokens,
      assistantTokens,
      averageMessageLength: messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length,
      sessionDuration: session.updatedAt.getTime() - session.createdAt.getTime(),
    };
  }

  /**
   * Set session expiry with automatic cleanup
   */
  private static setSessionExpiry(sessionId: string): void {
    // Clear existing timer
    const existingTimer = this.sessionExpiryTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.expiresAt <= new Date()) {
        logger.info('Session auto-expired', { sessionId });
        this.deleteSession(sessionId);
      }
    }, this.SESSION_TTL);

    this.sessionExpiryTimers.set(sessionId, timer);
  }

  /**
   * Export session (for backup/analysis)
   */
  static exportSession(sessionId: string): ChatSession | null {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return JSON.parse(JSON.stringify(session));
  }

  /**
   * Get all active sessions (for admin)
   */
  static getAllActiveSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.expiresAt > new Date());
  }
}
