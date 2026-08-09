import { InterviewPlannerService } from '@application/services/InterviewPlannerService';
import { Candidate } from '@domain/entities/Candidate';
import { Curriculum } from '@domain/entities/Curriculum';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { ICurriculumRepository } from '@domain/repositories/ICurriculumRepository';
import { AppError } from '@shared/errors/AppError';

const curriculum: Curriculum = {
  cohort: 'Test Cohort',
  modules: [
    { n: 3, title: 'Embeddings & Vector Search', days: [7, 10] },
    { n: 7, title: 'Evaluation, Security & Deployment', days: [25, 28] },
  ],
  days: [
    {
      day: 7,
      title: 'Embeddings Explained',
      type: 'AI_CORE',
      tools: [],
      objectives: ['Generate embeddings for every knowledge base chunk'],
    },
    {
      day: 10,
      title: 'The Retrieval & Matching Engine',
      type: 'SHIP_IT',
      tools: [],
      objectives: ['Build a query router'],
    },
    {
      day: 28,
      title: 'Docker & Kubernetes Deployment',
      type: 'SHIP_IT',
      tools: [],
      objectives: ['Containerize the chatbot backend and frontend'],
    },
  ],
};

const candidate: Candidate = {
  id: 'CAND-001',
  fullName: 'Sarah Johnson',
  jobRole: 'Senior Data Engineer',
  yearsExperience: 9,
  education: 'MS Computer Science',
  status: 'COMPLETED',
  missions: [
    { day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 },
    { day: 10, title: 'The Retrieval & Matching Engine', passed: false, attempts: 2 },
    // day 28 intentionally absent -> unattempted SHIP_IT milestone
  ],
  signals: { commitDays: 28, missionsCompleted: 2, missionsFirstTry: 1 },
};

function createMockRepos() {
  const candidateRepository: jest.Mocked<ICandidateRepository> = {
    findAll: jest.fn(),
    findById: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(id === candidate.id ? candidate : null)
    ),
  };
  const curriculumRepository: jest.Mocked<ICurriculumRepository> = {
    getCurriculum: jest.fn().mockResolvedValue(curriculum),
    findDayByNumber: jest.fn(),
    findModuleForDay: jest.fn(),
  };
  return { candidateRepository, curriculumRepository };
}

describe('InterviewPlannerService', () => {
  it('throws a 404 AppError when the candidate does not exist', async () => {
    const { candidateRepository, curriculumRepository } = createMockRepos();
    const service = new InterviewPlannerService(candidateRepository, curriculumRepository);

    await expect(service.buildPlan('CAND-999')).rejects.toBeInstanceOf(AppError);
    await expect(service.buildPlan('CAND-999')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('classifies a first-try pass as a strength', async () => {
    const { candidateRepository, curriculumRepository } = createMockRepos();
    const service = new InterviewPlannerService(candidateRepository, curriculumRepository);

    const plan = await service.buildPlan('CAND-001');

    expect(plan.strengths).toHaveLength(1);
    expect(plan.strengths[0]).toMatchObject({
      day: 7,
      dayTitle: 'Embeddings Explained',
      moduleTitle: 'Embeddings & Vector Search',
      reason: 'strong_first_try',
    });
  });

  it('classifies a failed mission as a gap', async () => {
    const { candidateRepository, curriculumRepository } = createMockRepos();
    const service = new InterviewPlannerService(candidateRepository, curriculumRepository);

    const plan = await service.buildPlan('CAND-001');

    expect(plan.gaps.some((g) => g.day === 10 && g.reason === 'failed')).toBe(true);
  });

  it('flags an unattempted SHIP_IT milestone as a gap', async () => {
    const { candidateRepository, curriculumRepository } = createMockRepos();
    const service = new InterviewPlannerService(candidateRepository, curriculumRepository);

    const plan = await service.buildPlan('CAND-001');

    expect(
      plan.gaps.some((g) => g.day === 28 && g.reason === 'not_attempted')
    ).toBe(true);
  });

  it('generates suggested questions covering both gaps and strengths', async () => {
    const { candidateRepository, curriculumRepository } = createMockRepos();
    const service = new InterviewPlannerService(candidateRepository, curriculumRepository);

    const plan = await service.buildPlan('CAND-001');

    expect(plan.suggestedQuestions.length).toBeGreaterThan(0);
    expect(plan.suggestedQuestions.some((q) => q.includes('Embeddings Explained'))).toBe(true);
    expect(plan.suggestedQuestions.some((q) => q.includes('Retrieval & Matching Engine'))).toBe(
      true
    );
  });

  it('includes candidate identity fields in the plan', async () => {
    const { candidateRepository, curriculumRepository } = createMockRepos();
    const service = new InterviewPlannerService(candidateRepository, curriculumRepository);

    const plan = await service.buildPlan('CAND-001');

    expect(plan.candidateId).toBe('CAND-001');
    expect(plan.candidateName).toBe('Sarah Johnson');
    expect(plan.jobRole).toBe('Senior Data Engineer');
  });
});
