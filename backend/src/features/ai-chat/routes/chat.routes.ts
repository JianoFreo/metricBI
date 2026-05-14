import { Router, RequestHandler } from 'express';
import { logger } from '@common/utils/logger.js';
import { ChatController } from '../controllers/chat.controller.js';
import { ChatRequestSchema, CreateSessionRequestSchema } from '../schemas/chat.schemas.js';

/**
 * Chat Routes
 * Handles all chat-related endpoints
 */
export function registerChatRoutes(router: Router): void {
  // Middleware for route logging
  const logRoute: RequestHandler = (req, res, next) => {
    logger.info('Chat API request', {
      method: req.method,
      path: req.path,
      userId: (req as any).user?.id,
    });
    next();
  };

  // Validation middleware for structured requests
  const validateChatRequest = (req: any, res: any, next: any) => {
    try {
      ChatRequestSchema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
      });
    }
  };

  const validateSessionCreate = (req: any, res: any, next: any) => {
    try {
      CreateSessionRequestSchema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
      });
    }
  };

  // ============ Session Management ============

  /**
   * POST /chat/sessions
   * Create new chat session
   */
  router.post('/chat/sessions', logRoute, validateSessionCreate, ChatController.createSession);

  /**
   * GET /chat/sessions
   * List user's sessions
   */
  router.get('/chat/sessions', logRoute, ChatController.listSessions);

  /**
   * GET /chat/sessions/:sessionId
   * Get session details
   */
  router.get('/chat/sessions/:sessionId', logRoute, ChatController.getSession);

  /**
   * DELETE /chat/sessions/:sessionId
   * Delete session
   */
  router.delete('/chat/sessions/:sessionId', logRoute, ChatController.deleteSession);

  /**
   * GET /chat/stats/:sessionId
   * Get session statistics
   */
  router.get('/chat/stats/:sessionId', logRoute, ChatController.getStats);

  // ============ Message Handling ============

  /**
   * POST /chat/messages
   * Send message to assistant (non-streaming)
   */
  router.post('/chat/messages', logRoute, validateChatRequest, ChatController.sendMessage);

  /**
   * POST /chat/messages/stream
   * Send message with streaming response
   */
  router.post('/chat/messages/stream', logRoute, validateChatRequest, ChatController.streamMessage);

  /**
   * GET /chat/history/:sessionId
   * Get session message history
   */
  router.get('/chat/history/:sessionId', logRoute, ChatController.getHistory);

  // ============ Admin Endpoints ============

  /**
   * POST /chat/clear-user-sessions
   * Clear all sessions for a user (admin only)
   */
  router.post('/chat/clear-user-sessions', logRoute, ChatController.clearUserSessions);

  // ============ Health & Diagnostic ============

  /**
   * GET /chat/health
   * Health check for chat service
   */
  router.get('/chat/health', logRoute, ChatController.healthCheck);

  logger.info('Registered chat routes', {
    endpoints: 10,
  });
}
