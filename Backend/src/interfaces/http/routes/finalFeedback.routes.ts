import { Router } from 'express';

import { CandidateService } from '@application/services/CandidateService';
import { CurriculumService } from '@application/services/CurriculumService';
import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { FeedbackGeneratorService } from '@application/services/FeedbackGeneratorService';
import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { sessionRepository } from '@infrastructure/composition/sessionRepositoryInstance';
import { llmProvider } from '@infrastructure/composition/llmProviderInstance';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { FinalFeedbackController } from '@interfaces/http/controllers/finalFeedback.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import { sessionIdParamSchema } from '@interfaces/http/validation/session.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

// Composition root for Module 9: wires candidate, curriculum, planner,
// shared session store, LLM provider, and fallback evaluation engine into FeedbackGeneratorService.
const candidateRepository = new JsonCandidateRepository();
const candidateService = new CandidateService(candidateRepository);
const curriculumRepository = new JsonCurriculumRepository();
const curriculumService = new CurriculumService(curriculumRepository);
const interviewPlannerService = new InterviewPlannerService(candidateRepository, curriculumRepository);
const evaluationEngineService = new EvaluationEngineService();
const feedbackGeneratorService = new FeedbackGeneratorService(
  candidateService,
  curriculumService,
  interviewPlannerService,
  sessionRepository,
  llmProvider,
  evaluationEngineService
);
const finalFeedbackController = new FinalFeedbackController(feedbackGeneratorService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TopicScore:
 *       type: object
 *       properties:
 *         topic: { type: string }
 *         score: { type: number }
 *     FinalFeedbackReport:
 *       type: object
 *       properties:
 *         candidateId: { type: string, example: "CAND-001" }
 *         overallScore: { type: number }
 *         topicScores:
 *           type: array
 *           items: { $ref: '#/components/schemas/TopicScore' }
 *         strengths: { type: array, items: { type: string } }
 *         weaknesses: { type: array, items: { type: string } }
 *         missedConcepts: { type: array, items: { type: string } }
 *         knowledgeGaps: { type: array, items: { type: string } }
 *         improvementSuggestions: { type: array, items: { type: string } }
 *         learningResources: { type: array, items: { type: string } }
 *         recommendedNextDifficulty: { type: string, enum: [easy, medium, hard] }
 *         generatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/v1/sessions/{sessionId}/final-feedback:
 *   get:
 *     summary: Generate the LLM-synthesized final feedback report for a completed session
 *     description: >
 *       Combines candidate profile, curriculum, interview plan, and the
 *       session's full conversation/evaluation history into a structured
 *       report via an LLM call, validated against a strict schema. Falls
 *       back to a deterministic report (reusing Module 8) if the LLM
 *       provider fails or returns a malformed/invalid response.
 *     tags: [FinalFeedback]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The final feedback report
 *       404:
 *         description: Session not found
 *       409:
 *         description: Session is not yet completed
 */
router.get(
  '/:sessionId/final-feedback',
  validateRequest(sessionIdParamSchema, 'params'),
  asyncHandler(finalFeedbackController.getFinalFeedback)
);

export { router as finalFeedbackRouter };
