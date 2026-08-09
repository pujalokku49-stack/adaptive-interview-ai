import { CandidateDTO, toCandidateDTO } from '@application/dtos/CandidateDTO';
import {
  CandidateListFilters,
  ICandidateService,
  PaginatedResult,
} from '@application/services/ICandidateService';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { AppError } from '@shared/errors/AppError';

export class CandidateService implements ICandidateService {
  constructor(private readonly candidateRepository: ICandidateRepository) {}

  public async getAllCandidates(
    filters: CandidateListFilters
  ): Promise<PaginatedResult<CandidateDTO>> {
    const allCandidates = await this.candidateRepository.findAll();

    const filtered = filters.role
      ? allCandidates.filter(
          (candidate) => candidate.jobRole.toLowerCase() === filters.role?.toLowerCase()
        )
      : allCandidates;

    const total = filtered.length;
    const start = (filters.page - 1) * filters.limit;
    const paginated = filtered.slice(start, start + filters.limit);

    return {
      items: paginated.map(toCandidateDTO),
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  public async getCandidateById(id: string): Promise<CandidateDTO> {
    const candidate = await this.candidateRepository.findById(id);

    if (!candidate) {
      throw new AppError(`Candidate with id "${id}" not found`, 404);
    }

    return toCandidateDTO(candidate);
  }
}
