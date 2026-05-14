import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "@common/logger";

interface GeminiResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
  };
}

interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

/**
 * Gemini AI Service
 * Handles all interactions with Google's Gemini API
 * Ensures no direct database access - only processes pre-aggregated data
 */
export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;
  private temperature: number;
  private maxOutputTokens: number;
  private topP: number;
  private topK: number;

  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }

    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "gemini-1.5-pro";
    this.temperature = config.temperature ?? 0.7;
    this.maxOutputTokens = config.maxOutputTokens ?? 4000;
    this.topP = config.topP ?? 0.9;
    this.topK = config.topK ?? 40;

    logger.info("[GeminiService] Initialized", {
      model: this.model,
      temperature: this.temperature,
    });
  }

  /**
   * Generate insights from pre-processed business data
   * @param prompt - The analysis prompt
   * @param data - Pre-aggregated business data (string format for API)
   * @returns Raw JSON response from Gemini
   */
  async generateInsights(prompt: string, data: string): Promise<GeminiResponse> {
    try {
      logger.info("[GeminiService] Generating insights", {
        modelUsed: this.model,
        promptLength: prompt.length,
        dataLength: data.length,
      });

      const model = this.client.getGenerativeModel({ model: this.model });

      const fullPrompt = `${prompt}\n\n---DATA---\n${data}\n---END DATA---`;

      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxOutputTokens,
          topP: this.topP,
          topK: this.topK,
        },
      });

      const textContent = response.content.parts[0];
      if (!textContent || typeof textContent.text !== "string") {
        throw new Error("Invalid response format from Gemini");
      }

      const responseText = textContent.text;

      // Extract token usage info
      const tokensUsed = {
        input: response.usageMetadata?.promptTokens || 0,
        output: response.usageMetadata?.candidatesTokens || 0,
      };

      logger.info("[GeminiService] Insights generated successfully", {
        tokensUsed,
        responseLength: responseText.length,
      });

      return {
        content: responseText,
        tokensUsed,
      };
    } catch (error) {
      logger.error("[GeminiService] Error generating insights", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Stream insights generation (for real-time responses)
   * @param prompt - The analysis prompt
   * @param data - Pre-aggregated business data
   * @returns Async generator for streaming content
   */
  async *streamInsights(
    prompt: string,
    data: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      logger.info("[GeminiService] Starting insight stream", {
        modelUsed: this.model,
      });

      const model = this.client.getGenerativeModel({ model: this.model });

      const fullPrompt = `${prompt}\n\n---DATA---\n${data}\n---END DATA---`;

      const response = await model.generateContentStream({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxOutputTokens,
          topP: this.topP,
          topK: this.topK,
        },
      });

      for await (const chunk of response.stream) {
        const content = chunk.content.parts[0];
        if (content && typeof content.text === "string") {
          yield content.text;
        }
      }

      logger.info("[GeminiService] Insight stream completed");
    } catch (error) {
      logger.error("[GeminiService] Error during stream", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Validate if data can be processed safely
   * Ensures data size is within limits
   */
  validateDataSize(data: string, maxSizeKB: number = 5000): boolean {
    const sizeKB = Buffer.byteLength(data, "utf8") / 1024;
    if (sizeKB > maxSizeKB) {
      logger.warn("[GeminiService] Data size exceeds limit", {
        actualSizeKB: sizeKB,
        maxSizeKB,
      });
      return false;
    }
    return true;
  }

  /**
   * Test connection to Gemini API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      await model.generateContent("Test");
      logger.info("[GeminiService] Health check passed");
      return true;
    } catch (error) {
      logger.error("[GeminiService] Health check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

/**
 * Initialize Gemini Service with environment config
 */
export function initializeGeminiService(): GeminiService {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set");
  }

  return new GeminiService({
    apiKey,
    model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "4000", 10),
  });
}

export default GeminiService;
