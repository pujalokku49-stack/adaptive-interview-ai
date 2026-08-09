import { Router } from 'express';

import { AdaptiveQuestionGeneratorService } from '@application/services/AdaptiveQuestionGeneratorService';
import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { SessionService } from '@application/services/SessionService';
import { HeuristicAnswerEvaluatorService } from '@infrastructure/evaluation/HeuristicAnswerEvaluatorService';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { sessionRepository } from '@infrastructure/composition/sessionRepositoryInstance';
import { SessionController } from '@interfaces/http/controllers/session.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import {
  sessionIdParamSchema,
  startSessionBodySchema,
  submitAnswerBodySchema,
} from '@interfaces/http/validation/session.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

import { llmProvider } from '@infrastructure/composition/llmProviderInstance';
import { LLMAnswerEvaluatorService } from '@application/services/LLMAnswerEvaluatorService';

import { LLMQuestionGeneratorService } from '@application/services/LLMQuestionGeneratorService';

// Composition root for this module: wires Module 4 (planning), Module 5
// (session persistence), Module 6 (answer evaluation via LLM with heuristic fallback), Module 7 (adaptive
// question generation via LLM with adaptive fallback), and Module 8 (evaluation engine / feedback aggregation)
// into one SessionService + SessionController shared across all session routes.
const candidateRepository = new JsonCandidateRepository();
const curriculumRepository = new JsonCurriculumRepository();
const interviewPlannerService = new InterviewPlannerService(candidateRepository, curriculumRepository);
const heuristicEvaluator = new HeuristicAnswerEvaluatorService();
const answerEvaluatorService = new LLMAnswerEvaluatorService(llmProvider, heuristicEvaluator);
const adaptiveGenerator = new AdaptiveQuestionGeneratorService();
const questionGeneratorService = new LLMQuestionGeneratorService(llmProvider, adaptiveGenerator);
const evaluationEngineService = new EvaluationEngineService();
const sessionService = new SessionService(
  interviewPlannerService,
  sessionRepository,
  answerEvaluatorService,
  questionGeneratorService
);
const sessionController = new SessionController(sessionService, evaluationEngineService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     QuestionEvaluation:
 *       type: object
 *       properties:
 *         question: { type: string }
 *         answer: { type: string }
 *         evaluation: { type: string }
 *         score: { type: number }
 *         knowledgeGap: { type: array, items: { type: string } }
 *         strongAreas: { type: array, items: { type: string } }
 *         weakAreas: { type: array, items: { type: string } }
 *     InterviewSession:
 *       type: object
 *       properties:
 *         sessionId: { type: string, format: uuid }
 *         candidateId: { type: string, example: "CAND-001" }
 *         currentQuestion: { type: string, nullable: true }
 *         currentTopic: { type: string, nullable: true }
 *         difficulty: { type: string, enum: [easy, medium, hard] }
 *         questionsAsked: { type: number }
 *         topicsCovered: { type: array, items: { type: string } }
 *         remainingTopics: { type: array, items: { type: string } }
 *         score: { type: number }
 *         history:
 *           type: array
 *           items: { $ref: '#/components/schemas/QuestionEvaluation' }
 *         status: { type: string, enum: [in_progress, completed] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/v1/sessions:
 *   post:
 *     summary: Start a new interview session for a candidate
 *     description: >
 *       Builds an interview plan (Module 4) for the candidate and seeds
 *       the session's topic queue from it (gaps first, then strengths).
 *     tags: [Session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [candidateId]
 *             properties:
 *               candidateId: { type: string, example: "CAND-001" }
 *     responses:
 *       201:
 *         description: The created session
 *       400:
 *         description: Validation error
 *       404:
 *         description: Candidate not found
 */
router.post('/', validateRequest(startSessionBodySchema, 'body'), asyncHandler(sessionController.start));

/**
 * @openapi
 * /api/v1/sessions/{sessionId}:
 *   get:
 *     summary: Get the current state of an interview session
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The session
 *       404:
 *         description: Session not found
 */
router.get(
  '/:sessionId',
  validateRequest(sessionIdParamSchema, 'params'),
  asyncHandler(sessionController.getById)
);

/**
 * @openapi
 * /api/v1/sessions/{sessionId}/answers:
 *   post:
 *     summary: Submit an answer to the session's current question
 *     description: >
 *       Evaluates the answer (Module 6), appends it to history, and
 *       advances the session to the next topic in the queue (or marks it
 *       completed when none remain).
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer]
 *             properties:
 *               answer: { type: string }
 *     responses:
 *       200:
 *         description: The updated session
 *       400:
 *         description: Validation error
 *       404:
 *         description: Session not found
 *       409:
 *         description: Session already completed or has no active question
 */
router.post(
  '/:sessionId/answers',
  validateRequest(sessionIdParamSchema, 'params'),
  validateRequest(submitAnswerBodySchema, 'body'),
  asyncHandler(sessionController.submitAnswer)
);

/**
 * @openapi
 * components:
 *   schemas:
 *     InterviewFeedback:
 *       type: object
 *       properties:
 *         summary: { type: string }
 *         strengths: { type: array, items: { type: string } }
 *         gaps: { type: array, items: { type: string } }
 *         next: { type: array, items: { type: string } }
 */

/**
 * @openapi
 * /api/v1/sessions/{sessionId}/feedback:
 *   get:
 *     summary: Get the final feedback for a completed session
 *     description: >
 *       Aggregates the session's full evaluation history (Module 6) into
 *       the technical spec's feedback shape (summary/strengths/gaps/next).
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The final feedback
 *       404:
 *         description: Session not found
 *       409:
 *         description: Session is not yet completed
 */
router.get(
  '/:sessionId/feedback',
  validateRequest(sessionIdParamSchema, 'params'),
  asyncHandler(sessionController.getFeedback)
);

export { router as sessionRouter };
