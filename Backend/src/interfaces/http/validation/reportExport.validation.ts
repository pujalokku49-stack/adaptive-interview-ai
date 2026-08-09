import { z } from 'zod';
import { sessionIdParamSchema } from '@interfaces/http/validation/session.validation';

export const exportReportParamsSchema = sessionIdParamSchema;

export const exportReportQuerySchema = z.object({
  format: z.enum(['json', 'markdown', 'text']).optional().default('markdown'),
});

export type ExportReportParams = z.infer<typeof exportReportParamsSchema>;
export type ExportReportQuery = z.infer<typeof exportReportQuerySchema>;
