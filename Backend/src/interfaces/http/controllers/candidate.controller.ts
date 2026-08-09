import { Request, Response } from 'express';

import { ICandidateService } from '@application/services/ICandidateService';
import {
  CandidateIdParams,
  ListCandidatesQuery,
} from '@interfaces/http/validation/candidate.validation';

/**
 * Contains no business logic: parses already-validated input, delegates
 * to the service, and shapes the HTTP response. Errors are not caught
 * here — they propagate to asyncHandler -> centralized error middleware.
 */
export class CandidateController {
  constructor(private readonly candidateService: ICandidateService) {}

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const { role, page, limit } = req.query as unknown as ListCandidatesQuery;

    const result = await this.candidateService.getAllCandidates({ role, page, limit });

    res.status(200).json({
      status: 'ok',
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as CandidateIdParams;

    const candidate = await this.candidateService.getCandidateById(id);

    res.status(200).json({
      status: 'ok',
      data: candidate,
    });
  };
}
