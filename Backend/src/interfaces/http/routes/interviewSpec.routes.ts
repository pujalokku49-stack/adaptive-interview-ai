import { Router } from 'express';
import { AdaptiveQuestionGeneratorService } from '@application/services/AdaptiveQuestionGeneratorService';
import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { InterviewSpecService } from '@application/services/InterviewSpecService';
import { SessionService } from '@application/services/SessionService';
import { sessionRepository } from '@infrastructure/composition/sessionRepositoryInstance';
import { HeuristicAnswerEvaluatorService } from '@infrastructure/evaluation/HeuristicAnswerEvaluatorService';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { InterviewSpecController } from '@interfaces/http/controllers/interviewSpec.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import { interviewSpecRequestSchema } from '@interfaces/http/validation/interviewSpec.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

import { llmProvider } from '@infrastructure/composition/llmProviderInstance';
import { LLMAnswerEvaluatorService } from '@application/services/LLMAnswerEvaluatorService';

import { LLMQuestionGeneratorService } from '@application/services/LLMQuestionGeneratorService';

// Composition root for Module 10: wires existing repositories, planner, answer evaluator (LLM with fallback),
// question generator (LLM with fallback), evaluation engine, and session service into InterviewSpecService.
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
const interviewSpecService = new InterviewSpecService(
  sessionService,
  candidateRepository,
  evaluationEngineService
);
const interviewSpecController = new InterviewSpecController(interviewSpecService);

const router = Router();

/**
 * @openapi
 * /api/interview:
 *   post:
 *     summary: Standard Hackathon AI Interview Agent Endpoint
 *     description: >
 *       Single unified endpoint conforming to technical-spec.md.
 *       Initializes or advances an interview session using the provided sessionId.
 *     tags: [InterviewSpec]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId: { type: string, example: "abc-123" }
 *               candidate:
 *                 type: object
 *                 properties:
 *                   id: { type: string, example: "CAND-001" }
 *                   fullName: { type: string, example: "Sarah Johnson" }
 *               message: { type: string, example: "I build index routing using ANN techniques." }
 *     responses:
 *       200:
 *         description: Interview reply or final completion report
 *       400:
 *         description: Payload validation failure
 *       404:
 *         description: Session not found
 */
router.post(
  '/',
  validateRequest(interviewSpecRequestSchema, 'body'),
  asyncHandler(interviewSpecController.handleInterview)
);

export { router as interviewSpecRouter };
