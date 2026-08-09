import { Router } from 'express';
import { CandidateService } from '@application/services/CandidateService';
import { CurriculumService } from '@application/services/CurriculumService';
import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { FeedbackGeneratorService } from '@application/services/FeedbackGeneratorService';
import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { ReportExportService } from '@application/services/ReportExportService';
import { sessionRepository } from '@infrastructure/composition/sessionRepositoryInstance';
import { llmProvider } from '@infrastructure/composition/llmProviderInstance';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';
import { ReportExportController } from '@interfaces/http/controllers/reportExport.controller';
import { validateRequest } from '@interfaces/http/middlewares/validateRequest';
import {
  exportReportParamsSchema,
  exportReportQuerySchema,
} from '@interfaces/http/validation/reportExport.validation';
import { asyncHandler } from '@shared/utils/asyncHandler';

// Composition root for Module 12 Report Export: wires candidate, curriculum, interview planner,
// shared session store, LLM provider, feedback generator, and ReportExportService.
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
const reportExportService = new ReportExportService(sessionRepository, feedbackGeneratorService);
const reportExportController = new ReportExportController(reportExportService);

const router = Router();

/**
 * @openapi
 * /api/v1/sessions/{sessionId}/export:
 *   get:
 *     summary: Export completed interview report as a downloadable file
 *     description: >
 *       Generates and downloads the final feedback report for a completed session
 *       in Markdown (.md), JSON (.json), or Plain Text (.txt) format.
 *     tags: [ReportExport]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: format
 *         required: false
 *         schema: { type: string, enum: [markdown, json, text], default: markdown }
 *     responses:
 *       200:
 *         description: Downloadable interview report file
 *       404:
 *         description: Session not found
 *       409:
 *         description: Session is not completed yet
 */
router.get(
  '/:sessionId/export',
  validateRequest(exportReportParamsSchema, 'params'),
  validateRequest(exportReportQuerySchema, 'query'),
  asyncHandler(reportExportController.exportReport)
);

export { router as reportExportRouter };
