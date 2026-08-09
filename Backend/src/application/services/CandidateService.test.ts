import { CandidateService } from '@application/services/CandidateService';
import { Candidate } from '@domain/entities/Candidate';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { AppError } from '@shared/errors/AppError';

const candidates: Candidate[] = [
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
    fullName: 'Grace Hopper',
    jobRole: 'Backend Engineer',
    yearsExperience: 12,
    education: 'B.Tech Computer Science',
    status: 'COMPLETED',
    missions: [{ day: 8, title: 'Vector Databases Overview', passed: true, attempts: 2 }],
    signals: { commitDays: 25, missionsCompleted: 12, missionsFirstTry: 6 },
  },
  {
    id: 'CAND-003',
    fullName: 'Alan Turing',
    jobRole: 'AI Engineer',
    yearsExperience: 8,
    education: 'MS Artificial Intelligence',
    status: 'COMPLETED',
    missions: [{ day: 12, title: 'Prompt Engineering Fundamentals', passed: true, attempts: 1 }],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 30 },
  },
];

function createMockRepository(data: Candidate[]): jest.Mocked<ICandidateRepository> {
  return {
    findAll: jest.fn().mockResolvedValue(data),
    findById: jest
      .fn()
      .mockImplementation((id: string) => Promise.resolve(data.find((c) => c.id === id) ?? null)),
  };
}

describe('CandidateService', () => {
  describe('getAllCandidates', () => {
    it('returns paginated candidates without a role filter', async () => {
      const repository = createMockRepository(candidates);
      const service = new CandidateService(repository);

      const result = await service.getAllCandidates({ page: 1, limit: 2 });

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.id).toBe('CAND-001');
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('filters candidates by jobRole, case-insensitively', async () => {
      const repository = createMockRepository(candidates);
      const service = new CandidateService(repository);

      const result = await service.getAllCandidates({
        role: 'backend engineer',
        page: 1,
        limit: 10,
      });

      expect(result.total).toBe(2);
      expect(result.items.every((c) => c.jobRole === 'Backend Engineer')).toBe(true);
    });

    it('applies pagination offsets correctly on the second page', async () => {
      const repository = createMockRepository(candidates);
      const service = new CandidateService(repository);

      const result = await service.getAllCandidates({ page: 2, limit: 2 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('CAND-003');
    });

    it('includes missions and signals in returned DTOs', async () => {
      const repository = createMockRepository(candidates);
      const service = new CandidateService(repository);

      const result = await service.getAllCandidates({ page: 1, limit: 10 });

      expect(result.items[0]).toHaveProperty('missions');
      expect(result.items[0]).toHaveProperty('signals');
    });
  });

  describe('getCandidateById', () => {
    it('returns a candidate DTO when found', async () => {
      const repository = createMockRepository(candidates);
      const service = new CandidateService(repository);

      const result = await service.getCandidateById('CAND-002');

      expect(result.fullName).toBe('Grace Hopper');
    });

    it('throws a 404 AppError when the candidate does not exist', async () => {
      const repository = createMockRepository(candidates);
      const service = new CandidateService(repository);

      await expect(service.getCandidateById('unknown')).rejects.toBeInstanceOf(AppError);
      await expect(service.getCandidateById('unknown')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
