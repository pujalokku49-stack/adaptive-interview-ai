import { toCandidateDTO } from '@application/dtos/CandidateDTO';
import { Candidate } from '@domain/entities/Candidate';

describe('toCandidateDTO', () => {
  it('maps a domain candidate to its public DTO shape', () => {
    const candidate: Candidate = {
      id: 'CAND-001',
      fullName: 'Ada Lovelace',
      jobRole: 'Backend Engineer',
      yearsExperience: 5,
      education: 'MS Computer Science',
      status: 'COMPLETED',
      missions: [{ day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 }],
      signals: { commitDays: 20, missionsCompleted: 10, missionsFirstTry: 8 },
    };

    const dto = toCandidateDTO(candidate);

    expect(dto).toEqual({
      id: 'CAND-001',
      fullName: 'Ada Lovelace',
      jobRole: 'Backend Engineer',
      yearsExperience: 5,
      education: 'MS Computer Science',
      status: 'COMPLETED',
      missions: [{ day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 }],
      signals: { commitDays: 20, missionsCompleted: 10, missionsFirstTry: 8 },
    });
  });

  it('preserves skipped missions (no passed/attempts fields) as-is', () => {
    const candidate: Candidate = {
      id: 'CAND-002',
      fullName: 'Alan Turing',
      jobRole: 'AI Engineer',
      yearsExperience: 9,
      education: 'BS Computer Science',
      status: 'COMPLETED',
      missions: [{ day: 29, title: 'Monitoring, Logging & Observability', skipped: true }],
      signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 },
    };

    const dto = toCandidateDTO(candidate);

    expect(dto.missions[0]).toEqual({
      day: 29,
      title: 'Monitoring, Logging & Observability',
      skipped: true,
    });
  });
});
