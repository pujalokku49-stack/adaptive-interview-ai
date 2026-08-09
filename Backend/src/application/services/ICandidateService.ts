import { CandidateDTO } from '@application/dtos/CandidateDTO';

export interface CandidateListFilters {
  role?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * The controller depends on this interface, not the concrete CandidateService,
 * keeping the interface-adapter layer decoupled from application internals
 * and trivially mockable in tests.
 */
export interface ICandidateService {
  getAllCandidates(filters: CandidateListFilters): Promise<PaginatedResult<CandidateDTO>>;
  getCandidateById(id: string): Promise<CandidateDTO>;
}
