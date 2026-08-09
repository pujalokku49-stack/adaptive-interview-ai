import { Router } from 'express';
import { AdaptiveQuestionGeneratorService } from '@application/services/AdaptiveQuestionGeneratorService';
import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { SessionService } from '@application/services/SessionService';
import { CandidateService } from '@application/services/CandidateService';
import { CurriculumService } from '@application/services/CurriculumService';
import { HeuristicAnswerEvaluatorService } from '@infrastructure/evaluation/HeuristicAnswerEvaluatorService';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { sessionRepository } from '@infrastructure/composition/sessionRepositoryInstance';
import { llmProvider } from '@infrastructure/composition/llmProviderInstance';
import { LLMAnswerEvaluatorService } from '@application/services/LLMAnswerEvaluatorService';
import { LLMQuestionGeneratorService } from '@application/services/LLMQuestionGeneratorService';
import { CandidateController } from '@interfaces/http/controllers/candidate.controller';
import { CurriculumController } from '@interfaces/http/controllers/curriculum.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import { candidateIdParamSchema } from '@interfaces/http/validation/candidate.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { AppError } from '@shared/errors/AppError';

// Inject dependency instances
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

const candidateService = new CandidateService(candidateRepository);
const candidateController = new CandidateController(candidateService);
const curriculumService = new CurriculumService(curriculumRepository);
const curriculumController = new CurriculumController(curriculumService);

const router = Router();

/**
 * @openapi
 * /interview/start:
 *   post:
 *     summary: Start interview session (Compatibility)
 *     tags: [Compatibility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidateId: { type: string, example: "CAND-001" }
 *     responses:
 *       201:
 *         description: Session started successfully
 */
router.post(
  '/interview/start',
  asyncHandler(async (req, res) => {
    const candidateId = req.body.candidateId ?? req.body.candidate?.id;
    if (!candidateId) {
      throw new AppError('candidateId is required in request body', 400);
    }
    const session = await sessionService.startSession(candidateId);
    res.status(201).json({
      status: 'ok',
      data: session,
    });
  })
);

/**
 * @openapi
 * /interview/answer:
 *   post:
 *     summary: Submit answer (Compatibility)
 *     tags: [Compatibility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, answer]
 *             properties:
 *               sessionId: { type: string, format: uuid }
 *               answer: { type: string }
 *     responses:
 *       200:
 *         description: Answer submitted and state updated
 */
router.post(
  '/interview/answer',
  asyncHandler(async (req, res) => {
    const sessionId = req.body.sessionId ?? req.query.sessionId;
    const answer = req.body.answer;
    if (!sessionId) {
      throw new AppError('sessionId is required', 400);
    }
    if (typeof answer !== 'string') {
      throw new AppError('answer must be a string', 400);
    }
    const session = await sessionService.submitAnswer(sessionId, answer);
    res.status(200).json({
      status: 'ok',
      data: session,
    });
  })
);

/**
 * @openapi
 * /interview/state:
 *   get:
 *     summary: Get session state (Compatibility)
 *     tags: [Compatibility]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The interview session state
 */
router.get(
  '/interview/state',
  asyncHandler(async (req, res) => {
    const sessionId = (req.query.sessionId as string) ?? (req.body.sessionId as string);
    if (!sessionId) {
      throw new AppError('sessionId query parameter is required', 400);
    }
    const session = await sessionService.getSession(sessionId);
    res.status(200).json({
      status: 'ok',
      data: session,
    });
  })
);

// Support path-param style for state as well
router.get(
  '/interview/state/:sessionId',
  asyncHandler(async (req, res) => {
    // sessionId is guaranteed by the route pattern; non-null assertion is safe here
    const sessionId = req.params['sessionId']!;
    const session = await sessionService.getSession(sessionId);
    res.status(200).json({
      status: 'ok',
      data: session,
    });
  })
);

/**
 * @openapi
 * /interview/feedback:
 *   get:
 *     summary: Get final feedback (Compatibility)
 *     tags: [Compatibility]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Final aggregated feedback report
 */
router.get(
  '/interview/feedback',
  asyncHandler(async (req, res) => {
    const sessionId = (req.query.sessionId as string) ?? (req.body.sessionId as string);
    if (!sessionId) {
      throw new AppError('sessionId query parameter is required', 400);
    }
    const session = await sessionService.getSession(sessionId);
    const feedback = evaluationEngineService.buildFeedback(session);
    res.status(200).json({
      status: 'ok',
      data: feedback,
    });
  })
);

// Support path-param style for feedback as well
router.get(
  '/interview/feedback/:sessionId',
  asyncHandler(async (req, res) => {
    // sessionId is guaranteed by the route pattern; non-null assertion is safe here
    const sessionId = req.params['sessionId']!;
    const session = await sessionService.getSession(sessionId);
    const feedback = evaluationEngineService.buildFeedback(session);
    res.status(200).json({
      status: 'ok',
      data: feedback,
    });
  })
);

/**
 * @openapi
 * /candidate/{id}:
 *   get:
 *     summary: Get candidate by ID (Compatibility)
 *     tags: [Compatibility]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Candidate details
 */
router.get(
  '/candidate/:id',
  validateRequest(candidateIdParamSchema, 'params'),
  asyncHandler(candidateController.getById)
);

/**
 * @openapi
 * /curriculum:
 *   get:
 *     summary: Get cohort curriculum (Compatibility)
 *     tags: [Compatibility]
 *     responses:
 *       200:
 *         description: The cohort curriculum
 */
router.get('/curriculum', asyncHandler(curriculumController.getCurriculum));

export { router as compatibilityRouter };
