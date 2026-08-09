import { Router } from 'express';
import { AnalyticsService } from '@application/services/AnalyticsService';
import { sessionRepository } from '@infrastructure/composition/sessionRepositoryInstance';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { AnalyticsController } from '@interfaces/http/controllers/analytics.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import { analyticsCandidateParamSchema } from '@interfaces/http/validation/analytics.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

// Composition root for Module 11 Analytics: reuses existing candidate & session repositories
const candidateRepository = new JsonCandidateRepository();
const analyticsService = new AnalyticsService(candidateRepository, sessionRepository);
const analyticsController = new AnalyticsController(analyticsService);

const router = Router();

/**
 * @openapi
 * /api/v1/analytics/overview:
 *   get:
 *     summary: Get cohort-wide interview analytics overview
 *     description: Aggregates candidate performance, session metrics, topic mastery, and top knowledge gaps.
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Cohort analytics overview
 */
router.get('/overview', asyncHandler(analyticsController.getOverview));

/**
 * @openapi
 * /api/v1/analytics/candidates/{candidateId}:
 *   get:
 *     summary: Get candidate specific interview performance analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema: { type: string, example: "CAND-001" }
 *     responses:
 *       200:
 *         description: Candidate interview analytics
 *       404:
 *         description: Candidate not found
 */
router.get(
  '/candidates/:candidateId',
  validateRequest(analyticsCandidateParamSchema, 'params'),
  asyncHandler(analyticsController.getCandidateAnalytics)
);

export { router as analyticsRouter };
