import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@common/utils/logger.js';
import { asyncHandler } from '@common/utils/async-handler.js';
import { AppError } from '@common/utils/app-error.js';
import {
  ChatRequestSchema,
  ChatResponseSchema,
  CreateSessionRequestSchema,
  SessionResponseSchema,
  ChatMessageSchema,
} from '../schemas/chat.schemas.js';
import { ChatAssistantService } from '../services/chat-assistant.service.js';
import { ContextBuilderService } from '../services/context-builder.service.js';
import { SessionMemoryService } from '../services/session-memory.service.js';

/**
 * Chat Controller
 * Handles all chat-related HTTP requests
 */
export class ChatController {
  /**
   * POST /chat/sessions
   * Create new chat session
   */
  static createSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const tenantId = (req as any).tenantId;

    if (!userId || !tenantId) {
      throw new AppError('User and tenant ID are required', 401);
    }

    const validated = CreateSessionRequestSchema.parse(req.body);

    const session = SessionMemoryService.createSession({
      userId,
      tenantId,
      title: validated.title,
      focusAreas: validated.focusAreas,
    });

    const response = SessionResponseSchema.parse({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      messageCount: session.messages.length,
      context: { focusAreas: session.context?.focusAreas },
    });

    logger.info('Created chat session via API', { userId, tenantId, sessionId: session.id });

    res.status(201).json({
      success: true,
      data: response,
    });
  });

  /**
   * GET /chat/sessions/:sessionId
   * Get session details
   */
  static getSession = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;

    const session = SessionMemoryService.getSession(sessionId);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      throw new AppError('Unauthorized to access this session', 403);
    }

    const response = SessionResponseSchema.parse({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      messageCount: session.messages.length,
      context: { focusAreas: session.context?.focusAreas },
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  });

  /**
   * GET /chat/sessions
   * List user's sessions
   */
  static listSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const sessions = SessionMemoryService.getUserSessions(userId);

    const responses = sessions.map((session) =>
      SessionResponseSchema.parse({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        messageCount: session.messages.length,
        context: { focusAreas: session.context?.focusAreas },
      })
    );

    res.status(200).json({
      success: true,
      data: responses,
    });
  });

  /**
   * POST /chat/messages
   * Send message to assistant
   */
  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const tenantId = (req as any).tenantId;
    const companyName = (req as any).company?.name || 'Your Company';

    const validated = ChatRequestSchema.parse(req.body);

    // Verify session exists and user owns it
    const session = SessionMemoryService.getSession(validated.sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized to access this session', 403);
    }

    // Add user message to session
    SessionMemoryService.addMessage(validated.sessionId, {
      role: 'user',
      content: validated.message,
    });

    // Build context from business data
    logger.info('Building context for chat', { sessionId: validated.sessionId });

    const contextData = await ContextBuilderService.buildContext({
      tenantId,
      timeRange: validated.context?.timeRange,
      focusAreas: validated.context?.focusAreas,
    });

    // Validate data size
    const sizeValidation = await ChatAssistantService.validateDataSize(contextData);
    if (!sizeValidation.withinLimit) {
      logger.warn('Context data too large', {
        sessionId: validated.sessionId,
        tokens: sizeValidation.estimatedTokens,
      });
      // Continue anyway, but log warning
    }

    // Generate response
    const chatResponse = await ChatAssistantService.generateResponse({
      sessionId: validated.sessionId,
      userMessage: validated.message,
      contextData,
      companyName,
    });

    // Add assistant response to session
    SessionMemoryService.addMessage(validated.sessionId, {
      role: 'assistant',
      content: JSON.stringify(chatResponse),
      metadata: {
        tokenCount: sizeValidation.estimatedTokens,
      },
    });

    logger.info('Generated chat response', {
      sessionId: validated.sessionId,
      userId,
    });

    res.status(200).json({
      success: true,
      data: chatResponse,
    });
  });

  /**
   * POST /chat/messages/stream
   * Stream message response
   */
  static streamMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    const tenantId = (req as any).tenantId;
    const companyName = (req as any).company?.name || 'Your Company';

    const validated = ChatRequestSchema.parse(req.body);

    // Verify session
    const session = SessionMemoryService.getSession(validated.sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized to access this session', 403);
    }

    // Add user message
    SessionMemoryService.addMessage(validated.sessionId, {
      role: 'user',
      content: validated.message,
    });

    // Build context
    const contextData = await ContextBuilderService.buildContext({
      tenantId,
      timeRange: validated.context?.timeRange,
    });

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Stream response
    try {
      let fullResponse = '';

      for await (const chunk of ChatAssistantService.streamResponse({
        sessionId: validated.sessionId,
        userMessage: validated.message,
        contextData,
        companyName,
      })) {
        fullResponse += chunk.chunk;
        res.write(`data: ${JSON.stringify({ content: chunk.chunk })}\n\n`);
      }

      // Send completion
      res.write(`data: ${JSON.stringify({ complete: true })}\n\n`);

      // Store complete response
      SessionMemoryService.addMessage(validated.sessionId, {
        role: 'assistant',
        content: fullResponse,
      });

      res.end();

      logger.info('Completed streaming response', {
        sessionId: validated.sessionId,
        userId,
      });
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.end();
      logger.error('Streaming error', {
        sessionId: validated.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /chat/history/:sessionId
   * Get session message history
   */
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const session = SessionMemoryService.getSession(sessionId);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized to access this session', 403);
    }

    const history = SessionMemoryService.getHistory(sessionId, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  });

  /**
   * DELETE /chat/sessions/:sessionId
   * Delete session
   */
  static deleteSession = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;

    const session = SessionMemoryService.getSession(sessionId);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized to delete this session', 403);
    }

    SessionMemoryService.deleteSession(sessionId);

    logger.info('Deleted chat session via API', { userId, sessionId });

    res.status(200).json({
      success: true,
      message: 'Session deleted',
    });
  });

  /**
   * GET /chat/stats/:sessionId
   * Get session statistics
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;

    const session = SessionMemoryService.getSession(sessionId);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized to access this session', 403);
    }

    const stats = SessionMemoryService.getSessionStats(sessionId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * GET /chat/health
   * Health check
   */
  static healthCheck = asyncHandler(async (req: Request, res: Response) => {
    const health = await ChatAssistantService.healthCheck();

    res.status(health.healthy ? 200 : 503).json({
      success: health.healthy,
      status: health.message,
      timestamp: new Date(),
    });
  });

  /**
   * POST /chat/clear-user-sessions (admin only)
   * Clear all sessions for a user
   */
  static clearUserSessions = asyncHandler(async (req: Request, res: Response) => {
    const { targetUserId } = req.body;
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      throw new AppError('Only admins can clear user sessions', 403);
    }

    if (!targetUserId) {
      throw new AppError('targetUserId is required', 400);
    }

    const count = SessionMemoryService.clearUserSessions(targetUserId);

    logger.info('Cleared user sessions via API', { targetUserId, count });

    res.status(200).json({
      success: true,
      message: `Cleared ${count} sessions`,
      data: { count },
    });
  });
}
