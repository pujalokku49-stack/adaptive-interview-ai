import { z } from 'zod';

export const curriculumDayParamSchema = z.object({
  day: z.coerce.number().int().positive().max(31, { message: 'day must be between 1 and 31' }),
});

export type CurriculumDayParams = z.infer<typeof curriculumDayParamSchema>;
