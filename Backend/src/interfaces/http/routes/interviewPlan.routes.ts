import { Router } from 'express';

import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { InterviewPlanController } from '@interfaces/http/controllers/interviewPlan.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import { candidateIdParamSchema } from '@interfaces/http/validation/candidate.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

// Composition root for this module. Reuses the same JsonCandidateRepository
// and JsonCurriculumRepository implementations wired in candidate.routes.ts
// and curriculum.routes.ts — each is a stateless, in-memory reader over its
// own seed file, so separate instances here are cheap and keep this module
// free of cross-route coupling.
const candidateRepository = new JsonCandidateRepository();
const curriculumRepository = new JsonCurriculumRepository();
const interviewPlannerService = new InterviewPlannerService(candidateRepository, curriculumRepository);
const interviewPlanController = new InterviewPlanController(interviewPlannerService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     InterviewFocusArea:
 *       type: object
 *       properties:
 *         day: { type: number }
 *         moduleTitle: { type: string }
 *         dayTitle: { type: string }
 *         reason:
 *           type: string
 *           enum: [failed, skipped, not_attempted, strong_first_try]
 *         objectives: { type: array, items: { type: string } }
 *     InterviewPlan:
 *       type: object
 *       properties:
 *         candidateId: { type: string }
 *         candidateName: { type: string }
 *         jobRole: { type: string }
 *         strengths:
 *           type: array
 *           items: { $ref: '#/components/schemas/InterviewFocusArea' }
 *         gaps:
 *           type: array
 *           items: { $ref: '#/components/schemas/InterviewFocusArea' }
 *         suggestedQuestions: { type: array, items: { type: string } }
 *         generatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/v1/interview-plan/{id}:
 *   get:
 *     summary: Build an interview plan for a candidate
 *     description: >
 *       Combines the candidate's mission history with the cohort curriculum
 *       to produce gaps (skipped/failed/never-attempted milestones) and
 *       strengths (first-try passes), plus suggested interview questions.
 *     tags: [InterviewPlan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "CAND-001" }
 *     responses:
 *       200:
 *         description: The generated interview plan
 *       400:
 *         description: Invalid id format
 *       404:
 *         description: Candidate not found
 */
router.get(
  '/:id',
  validateRequest(candidateIdParamSchema, 'params'),
  asyncHandler(interviewPlanController.getPlan)
);

export { router as interviewPlanRouter };
