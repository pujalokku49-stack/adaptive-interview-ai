import { Router } from 'express';
import { llmProvider } from '@infrastructure/composition/llmProviderInstance';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { logger } from '@infrastructure/logger/logger';

const router = Router();

const SYSTEM_PROMPT = `You are Helix Guide, an OS Assistant for Helix – AI Interview Operating System.
Be concise, encouraging, and helpful. You guide candidates through readiness scores, interview chambers, Candidate DNA, and 31-day curriculum modules.`;

/**
 * @openapi
 * /api/assistant:
 *   post:
 *     summary: Chat with Helix Guide OS Assistant
 *     tags: [Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: "How do I improve my RAG score?" }
 *     responses:
 *       200:
 *         description: Assistant reply generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "ok" }
 *                 reply: { type: string }
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userMessage = req.body.message ?? req.body.prompt ?? req.body.query;

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      res.status(400).json({
        status: 'error',
        error: 'message string is required in request body',
      });
      return;
    }

    try {
      const result = await llmProvider.complete({
        system: SYSTEM_PROMPT,
        prompt: userMessage.trim(),
        maxTokens: 400,
      });

      res.status(200).json({
        status: 'ok',
        reply: result.text,
      });
    } catch (err) {
      // Fallback response if LLM API key is absent or provider request fails
      logger.error({ err }, 'Assistant LLM call failed, using fallback reply');
      const text = userMessage.trim().toLowerCase();
      let reply = `I'm Helix Guide! I can brief you on candidate readiness, launch an Interview Chamber, or walk you through your Candidate DNA signals.`;

      if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
        reply = `Hello! I'm Helix Guide. How can I help you with your interview preparation today? You can ask about readiness, DNA signals, or curriculum modules.`;
      } else if (text.includes('readiness') || text.includes('score')) {
        reply = `Your readiness score is calculated from your performance across all 12 DNA skill domains. Head to Mission Control to see your live breakdown.`;
      } else if (text.includes('chamber') || text.includes('interview')) {
        reply = `The Interview Chamber adapts probes in real time based on your confidence and response depth. Click 'Enter chamber' to start a session.`;
      } else if (text.includes('dna')) {
        reply = `Candidate DNA tracks 12 core domains including Technical, Cognitive, and Signal axes. View your living genome on the Candidate DNA tab.`;
      }

      res.status(200).json({
        status: 'ok',
        reply,
      });
    }
  })
);

export { router as assistantRouter };
