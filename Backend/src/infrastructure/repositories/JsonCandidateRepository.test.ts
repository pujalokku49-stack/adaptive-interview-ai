import { Candidate } from '@domain/entities/Candidate';
import { JsonCandidateRepository } from '@infrastructure/repositories/JsonCandidateRepository';

const fixtureCandidates: Candidate[] = [
  {
    id: 'CAND-001',
    fullName: 'Ada Lovelace',
    jobRole: 'Backend Engineer',
    yearsExperience: 5,
    education: 'MS Computer Science',
    status: 'COMPLETED',
    missions: [{ day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 }],
    signals: { commitDays: 20, missionsCompleted: 10, missionsFirstTry: 8 },
  },
  {
    id: 'CAND-002',
    fullName: 'Alan Turing',
    jobRole: 'AI Engineer',
    yearsExperience: 8,
    education: 'BS Computer Science',
    status: 'COMPLETED',
    missions: [{ day: 8, title: 'Vector Databases Overview', passed: true, attempts: 2 }],
    signals: { commitDays: 25, missionsCompleted: 12, missionsFirstTry: 6 },
  },
];

describe('JsonCandidateRepository', () => {
  it('returns all loaded candidates', async () => {
    const repository = new JsonCandidateRepository(fixtureCandidates);

    const result = await repository.findAll();

    expect(result).toEqual(fixtureCandidates);
  });

  it('finds a candidate by id', async () => {
    const repository = new JsonCandidateRepository(fixtureCandidates);

    const result = await repository.findById('CAND-002');

    expect(result).toEqual(fixtureCandidates[1]);
  });

  it('returns null when the candidate id does not exist', async () => {
    const repository = new JsonCandidateRepository(fixtureCandidates);

    const result = await repository.findById('does-not-exist');

    expect(result).toBeNull();
  });

  it('loads the bundled seed data when no data is injected', async () => {
    const repository = new JsonCandidateRepository();

    const result = await repository.findAll();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('missions');
    expect(result[0]).toHaveProperty('signals');
  });
});
