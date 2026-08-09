import { Router } from 'express';

import { CurriculumService } from '@application/services/CurriculumService';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { CurriculumController } from '@interfaces/http/controllers/curriculum.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import { curriculumDayParamSchema } from '@interfaces/http/validation/curriculum.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

// Composition root for this module: wire the concrete repository into the
// service, and the service into the controller, via constructor injection.
const curriculumRepository = new JsonCurriculumRepository();
const curriculumService = new CurriculumService(curriculumRepository);
const curriculumController = new CurriculumController(curriculumService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     CurriculumDay:
 *       type: object
 *       properties:
 *         day: { type: number }
 *         title: { type: string }
 *         type: { type: string }
 *         tools: { type: array, items: { type: string } }
 *         objectives: { type: array, items: { type: string } }
 *     CurriculumModule:
 *       type: object
 *       properties:
 *         n: { type: number }
 *         title: { type: string }
 *         days:
 *           type: array
 *           items: { type: number }
 *           minItems: 2
 *           maxItems: 2
 */

/**
 * @openapi
 * /api/v1/curriculum:
 *   get:
 *     summary: Get the full cohort curriculum (modules + days)
 *     tags: [Curriculum]
 *     responses:
 *       200:
 *         description: The full curriculum
 */
router.get('/', asyncHandler(curriculumController.getCurriculum));

/**
 * @openapi
 * /api/v1/curriculum/days/{day}:
 *   get:
 *     summary: Get a single curriculum day by day number
 *     tags: [Curriculum]
 *     parameters:
 *       - in: path
 *         name: day
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 31 }
 *     responses:
 *       200:
 *         description: The curriculum day
 *       400:
 *         description: Invalid day number
 *       404:
 *         description: Day not found
 */
router.get(
  '/days/:day',
  validateRequest(curriculumDayParamSchema, 'params'),
  asyncHandler(curriculumController.getDay)
);

export { router as curriculumRouter };
