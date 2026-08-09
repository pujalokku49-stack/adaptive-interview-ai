import { Candidate } from '@domain/entities/Candidate';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import candidateSeedData from '@infrastructure/data/candidates.seed.json';

/**
 * Loads candidates from a bundled JSON seed file, held in memory for the
 * lifetime of the instance. Implements ICandidateRepository so it can be
 * swapped for a database-backed repository later without any change to
 * the service or controller layers.
 *
 * Seed data can be injected (used by unit tests); defaults to the bundled
 * JSON file otherwise.
 */
export class JsonCandidateRepository implements ICandidateRepository {
  private readonly candidates: Candidate[];

  constructor(seedData: Candidate[] = candidateSeedData as Candidate[]) {
    this.candidates = seedData;
  }

  public async findAll(): Promise<Candidate[]> {
    return this.candidates;
  }

  public async findById(id: string): Promise<Candidate | null> {
    return this.candidates.find((candidate) => candidate.id === id) ?? null;
  }

  public async save(candidate: Candidate): Promise<Candidate> {
    const index = this.candidates.findIndex((c) => c.id === candidate.id);
    if (index >= 0) {
      this.candidates[index] = candidate;
    } else {
      this.candidates.push(candidate);
    }
    return candidate;
  }
}
