import { Request, Response } from 'express';

import { ICurriculumService } from '@application/services/ICurriculumService';
import { CurriculumDayParams } from '@interfaces/http/validation/curriculum.validation';

/**
 * Contains no business logic: parses already-validated input, delegates
 * to the service, and shapes the HTTP response. Errors are not caught
 * here — they propagate to asyncHandler -> centralized error middleware.
 */
export class CurriculumController {
  constructor(private readonly curriculumService: ICurriculumService) {}

  public getCurriculum = async (_req: Request, res: Response): Promise<void> => {
    const curriculum = await this.curriculumService.getCurriculum();

    res.status(200).json({
      status: 'ok',
      data: curriculum,
    });
  };

  public getDay = async (req: Request, res: Response): Promise<void> => {
    const { day } = req.params as unknown as CurriculumDayParams;

    const curriculumDay = await this.curriculumService.getDay(day);

    res.status(200).json({
      status: 'ok',
      data: curriculumDay,
    });
  };
}
