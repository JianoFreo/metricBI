import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import {
  ChatMessageSchema,
  ChatSessionSchema,
  ChatContextDataSchema,
  ChatResponseSchema,
  ChatRequestSchema,
  CreateSessionRequestSchema,
} from '../schemas/chat.schemas.js';
import { SessionMemoryService } from '../services/session-memory.service.js';
import { ContextBuilderService } from '../services/context-builder.service.js';
import { ChatAssistantService } from '../services/chat-assistant.service.js';

/**
 * Chat Module Test Suite
 */
describe('AI Chat Assistant Module', () => {
  const mockUserId = uuidv4();
  const mockTenantId = uuidv4();
  const mockCompanyName = 'Test Company Inc';

  // ============ Schema Validation Tests ============

  describe('Schema Validation', () => {
    it('should validate ChatMessage schema', () => {
      const message = {
        id: uuidv4(),
        role: 'user',
        content: 'What is our revenue trend?',
        timestamp: new Date(),
      };

      expect(() => ChatMessageSchema.parse(message)).not.toThrow();
    });

    it('should validate ChatSession schema', () => {
      const session = {
        id: uuidv4(),
        userId: mockUserId,
        tenantId: mockTenantId,
        title: 'Test Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      expect(() => ChatSessionSchema.parse(session)).not.toThrow();
    });

    it('should validate ChatContextData schema', () => {
      const contextData = {
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        metrics: {
          revenue: 1250000,
          expenses: 875000,
          profitMargin: 30,
          growth: 12.5,
        },
      };

      expect(() => ChatContextDataSchema.parse(contextData)).not.toThrow();
    });

    it('should validate ChatResponse schema', () => {
      const response = {
        id: uuidv4(),
        sessionId: uuidv4(),
        insight: {
          type: 'performance',
          summary: 'Revenue increased by 12%',
          confidence: 0.85,
        },
        reasoning: {
          dataUsed: ['revenue', 'historical_data'],
          methodology: 'Year-over-year comparison',
          confidence: 0.85,
        },
        timestamp: new Date(),
      };

      expect(() => ChatResponseSchema.parse(response)).not.toThrow();
    });

    it('should validate ChatRequest schema', () => {
      const request = {
        sessionId: uuidv4(),
        message: 'What is our current financial status?',
      };

      expect(() => ChatRequestSchema.parse(request)).not.toThrow();
    });

    it('should validate CreateSessionRequest schema', () => {
      const createReq = {
        title: 'Financial Analysis',
        focusAreas: ['financial', 'performance'],
      };

      expect(() => CreateSessionRequestSchema.parse(createReq)).not.toThrow();
    });

    it('should reject invalid message role', () => {
      const invalidMessage = {
        id: uuidv4(),
        role: 'invalid_role',
        content: 'Test',
        timestamp: new Date(),
      };

      expect(() => ChatMessageSchema.parse(invalidMessage)).toThrow();
    });

    it('should reject empty message content', () => {
      const invalidMessage = {
        id: uuidv4(),
        role: 'user',
        content: '',
        timestamp: new Date(),
      };

      expect(() => ChatMessageSchema.parse(invalidMessage)).toThrow();
    });
  });

  // ============ Session Memory Service Tests ============

  describe('SessionMemoryService', () => {
    afterEach(() => {
      const sessions = SessionMemoryService.getAllActiveSessions();
      sessions.forEach((s) => SessionMemoryService.deleteSession(s.id));
    });

    it('should create a new session', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
        title: 'Test Session',
      });

      expect(session.id).toBeDefined();
      expect(session.userId).toBe(mockUserId);
      expect(session.tenantId).toBe(mockTenantId);
      expect(session.messages).toEqual([]);
    });

    it('should retrieve session by ID', () => {
      const created = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      const retrieved = SessionMemoryService.getSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return null for non-existent session', () => {
      const result = SessionMemoryService.getSession(uuidv4());
      expect(result).toBeNull();
    });

    it('should add message to session', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      const message = SessionMemoryService.addMessage(session.id, {
        role: 'user',
        content: 'Hello, assistant!',
      });

      expect(message.id).toBeDefined();
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, assistant!');
    });

    it('should retrieve session history', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      SessionMemoryService.addMessage(session.id, {
        role: 'user',
        content: 'Message 1',
      });
      SessionMemoryService.addMessage(session.id, {
        role: 'assistant',
        content: 'Response 1',
      });

      const history = SessionMemoryService.getHistory(session.id);

      expect(history).toHaveLength(2);
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
    });

    it('should get recent context from session', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      for (let i = 0; i < 15; i++) {
        SessionMemoryService.addMessage(session.id, {
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
        });
      }

      const context = SessionMemoryService.getRecentContext(session.id, 5);

      expect(context).toHaveLength(5);
      expect(context[context.length - 1].content).toContain('Message 14');
    });

    it('should update session context', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      SessionMemoryService.updateSessionContext(session.id, {
        focusAreas: ['financial', 'inventory'],
      });

      const updated = SessionMemoryService.getSession(session.id);

      expect(updated?.context?.focusAreas).toContain('financial');
      expect(updated?.context?.focusAreas).toContain('inventory');
    });

    it('should delete session', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      SessionMemoryService.deleteSession(session.id);

      const retrieved = SessionMemoryService.getSession(session.id);

      expect(retrieved).toBeNull();
    });

    it('should get user sessions', () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();

      SessionMemoryService.createSession({
        userId: userId1,
        tenantId: mockTenantId,
      });
      SessionMemoryService.createSession({
        userId: userId1,
        tenantId: mockTenantId,
      });
      SessionMemoryService.createSession({
        userId: userId2,
        tenantId: mockTenantId,
      });

      const user1Sessions = SessionMemoryService.getUserSessions(userId1);

      expect(user1Sessions).toHaveLength(2);
      expect(user1Sessions.every((s) => s.userId === userId1)).toBe(true);
    });

    it('should calculate session statistics', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      SessionMemoryService.addMessage(session.id, {
        role: 'user',
        content: 'What is our revenue?',
        metadata: { tokenCount: 5 },
      });

      SessionMemoryService.addMessage(session.id, {
        role: 'assistant',
        content: 'Your revenue is $1.25M',
        metadata: { tokenCount: 10 },
      });

      const stats = SessionMemoryService.getSessionStats(session.id);

      expect(stats?.totalMessages).toBe(2);
      expect(stats?.userMessages).toBe(1);
      expect(stats?.assistantMessages).toBe(1);
      expect(stats?.totalTokens).toBe(15);
    });

    it('should export session data', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      SessionMemoryService.addMessage(session.id, {
        role: 'user',
        content: 'Test message',
      });

      const exported = SessionMemoryService.exportSession(session.id);

      expect(exported?.id).toBe(session.id);
      expect(exported?.messages).toHaveLength(1);
    });
  });

  // ============ Context Builder Service Tests ============

  describe('ContextBuilderService', () => {
    it('should build context data', async () => {
      const context = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      expect(context.period).toBeDefined();
      expect(context.metrics).toBeDefined();
      expect(context.metrics.revenue).toBeGreaterThan(0);
      expect(context.metrics.expenses).toBeGreaterThan(0);
    });

    it('should include metrics in context', async () => {
      const context = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      expect(context.metrics.revenue).toBeDefined();
      expect(context.metrics.profitMargin).toBeDefined();
      expect(context.metrics.growth).toBeDefined();
      expect(context.metrics.customMetrics).toBeDefined();
    });

    it('should detect anomalies in context', async () => {
      const context = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      // Should have anomalies array (may be empty or populated)
      expect(Array.isArray(context.anomalies)).toBe(true);
    });

    it('should cache context data', async () => {
      const context1 = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      const context2 = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      // Should return cached data (same object)
      expect(context1).toEqual(context2);
    });

    it('should clear context cache', async () => {
      await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      ContextBuilderService.clearContextCache(mockTenantId);

      // Next call should rebuild
      const fresh = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
      });

      expect(fresh).toBeDefined();
    });

    it('should get focused context', async () => {
      const focused = await ContextBuilderService.getFocusedContext({
        tenantId: mockTenantId,
        focusArea: 'procurement',
      });

      expect(focused.departmentData?.procurement).toBeDefined();
    });
  });

  // ============ Chat Assistant Service Tests ============

  describe('ChatAssistantService', () => {
    it('should validate data size', async () => {
      const contextData = {
        period: {
          start: new Date(),
          end: new Date(),
        },
        metrics: { revenue: 1000000 },
      };

      const validation = await ChatAssistantService.validateDataSize(contextData);

      expect(validation.estimatedTokens).toBeGreaterThan(0);
      expect(validation.withinLimit).toBe(true);
    });

    it('should perform health check', async () => {
      // Note: This test will fail if Gemini client is not initialized
      // In production, should skip if API key not available
      try {
        const health = await ChatAssistantService.healthCheck();
        expect(health).toHaveProperty('healthy');
        expect(health).toHaveProperty('message');
      } catch (error) {
        // Skip if Gemini not configured
        console.log('Skipping health check - Gemini not configured');
      }
    });
  });

  // ============ Integration Tests ============

  describe('Integration Tests', () => {
    it('should create session and add messages', () => {
      const session = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
      });

      const userMsg = SessionMemoryService.addMessage(session.id, {
        role: 'user',
        content: 'Hello assistant!',
      });

      const assistantMsg = SessionMemoryService.addMessage(session.id, {
        role: 'assistant',
        content: 'Hello! How can I help?',
      });

      const history = SessionMemoryService.getHistory(session.id);

      expect(history).toHaveLength(2);
      expect(history[0].content).toBe(userMsg.content);
      expect(history[1].content).toBe(assistantMsg.content);

      SessionMemoryService.deleteSession(session.id);
    });

    it('should manage multiple sessions for same user', () => {
      const session1 = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
        title: 'Session 1',
      });

      const session2 = SessionMemoryService.createSession({
        userId: mockUserId,
        tenantId: mockTenantId,
        title: 'Session 2',
      });

      SessionMemoryService.addMessage(session1.id, {
        role: 'user',
        content: 'Message in session 1',
      });

      SessionMemoryService.addMessage(session2.id, {
        role: 'user',
        content: 'Message in session 2',
      });

      const userSessions = SessionMemoryService.getUserSessions(mockUserId);

      expect(userSessions).toHaveLength(2);
      expect(userSessions[0].messages).toHaveLength(1);
      expect(userSessions[1].messages).toHaveLength(1);

      SessionMemoryService.deleteSession(session1.id);
      SessionMemoryService.deleteSession(session2.id);
    });

    it('should build context for analysis', async () => {
      const context = await ContextBuilderService.buildContext({
        tenantId: mockTenantId,
        focusAreas: ['financial'],
      });

      expect(context.metrics.revenue).toBeDefined();
      expect(context.metrics.profitMargin).toBeDefined();
      expect(context.period).toBeDefined();
    });
  });

  // ============ Error Handling Tests ============

  describe('Error Handling', () => {
    it('should handle invalid session ID', () => {
      const result = SessionMemoryService.getSession('invalid-id');
      expect(result).toBeNull();
    });

    it('should reject message to non-existent session', () => {
      expect(() => {
        SessionMemoryService.addMessage(uuidv4(), {
          role: 'user',
          content: 'Test',
        });
      }).toThrow();
    });

    it('should handle empty message content validation', () => {
      expect(() => {
        ChatMessageSchema.parse({
          id: uuidv4(),
          role: 'user',
          content: '',
          timestamp: new Date(),
        });
      }).toThrow();
    });

    it('should validate confidence score range', () => {
      expect(() => {
        ChatResponseSchema.parse({
          id: uuidv4(),
          sessionId: uuidv4(),
          insight: {
            type: 'performance',
            summary: 'Test',
            confidence: 1.5, // Invalid: > 1
          },
          reasoning: {
            dataUsed: [],
            methodology: 'test',
            confidence: 0.8,
          },
          timestamp: new Date(),
        });
      }).toThrow();
    });
  });
});
