import { Router } from 'express';

import { CandidateService } from '@application/services/CandidateService';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { CandidateController } from '@interfaces/http/controllers/candidate.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import {
  candidateIdParamSchema,
  listCandidatesQuerySchema,
} from '@interfaces/http/validation/candidate.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

// Composition root for this module: wire the concrete repository into the
// service, and the service into the controller, via constructor injection.
const candidateRepository = new JsonCandidateRepository();
const candidateService = new CandidateService(candidateRepository);
const candidateController = new CandidateController(candidateService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       properties:
 *         id: { type: string, example: "CAND-001" }
 *         fullName: { type: string }
 *         jobRole: { type: string }
 *         yearsExperience: { type: number }
 *         education: { type: string }
 *         status: { type: string }
 *         missions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day: { type: number }
 *               title: { type: string }
 *               passed: { type: boolean }
 *               skipped: { type: boolean }
 *               attempts: { type: number }
 *         signals:
 *           type: object
 *           properties:
 *             commitDays: { type: number }
 *             missionsCompleted: { type: number }
 *             missionsFirstTry: { type: number }
 */

/**
 * @openapi
 * /api/v1/candidates:
 *   get:
 *     summary: List candidates
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *         description: Filter candidates by exact role (case-insensitive)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of candidates
 *       400:
 *         description: Validation error
 */
router.get(
  '/',
  validateRequest(listCandidatesQuerySchema, 'query'),
  asyncHandler(candidateController.getAll)
);

/**
 * @openapi
 * /api/v1/candidates/{id}:
 *   get:
 *     summary: Get a candidate by id
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "CAND-001" }
 *     responses:
 *       200:
 *         description: Candidate found
 *       400:
 *         description: Invalid id format
 *       404:
 *         description: Candidate not found
 */
router.get(
  '/:id',
  validateRequest(candidateIdParamSchema, 'params'),
  asyncHandler(candidateController.getById)
);

export { router as candidateRouter };
