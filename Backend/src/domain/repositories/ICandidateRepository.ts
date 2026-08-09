import { Candidate } from '@domain/entities/Candidate';

/**
 * Port defining how the domain expects to read candidate data.
 * Infrastructure provides the implementation (JSON file today, a database
 * later) — the application layer never depends on the concrete source.
 */
export interface ICandidateRepository {
  findAll(): Promise<Candidate[]>;
  findById(id: string): Promise<Candidate | null>;
  save?(candidate: Candidate): Promise<Candidate>;
}
