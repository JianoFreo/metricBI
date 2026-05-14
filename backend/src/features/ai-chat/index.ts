import { Router } from 'express';
import { registerChatRoutes } from './routes/chat.routes.js';
import { ChatAssistantService } from './services/chat-assistant.service.js';
import { logger } from '@common/utils/logger.js';

/**
 * Register AI Chat Module
 * Initializes Gemini service and registers routes
 */
export function registerAIChatModule(mainRouter: Router): void {
  // Initialize Gemini service
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY not set - Chat assistant will not be available');
  } else {
    try {
      ChatAssistantService.initializeGeminiService(apiKey);
      logger.info('Initialized AI Chat Module with Gemini');
    } catch (error) {
      logger.error('Failed to initialize AI Chat Module', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Register chat routes under /chat namespace
  const chatRouter = Router();
  registerChatRoutes(chatRouter);

  mainRouter.use('/chat', chatRouter);

  logger.info('AI Chat Module registered with 10 endpoints');
}

// Export services for direct use if needed
export { ChatAssistantService } from './services/chat-assistant.service.js';
export { ContextBuilderService } from './services/context-builder.service.js';
export { SessionMemoryService } from './services/session-memory.service.js';

// Export schemas for type safety
export * from './schemas/chat.schemas.js';
