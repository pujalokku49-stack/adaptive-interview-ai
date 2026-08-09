import { CurriculumService } from '@application/services/CurriculumService';
import { Curriculum } from '@domain/entities/Curriculum';
import { ICurriculumRepository } from '@domain/repositories/ICurriculumRepository';
import { AppError } from '@shared/errors/AppError';

const fixture: Curriculum = {
  cohort: 'Test Cohort',
  modules: [{ n: 1, title: 'Environment & Tooling', days: [1, 3] }],
  days: [
    { day: 1, title: 'Setup', type: 'SETUP', tools: ['VS Code'], objectives: ['Install VS Code'] },
  ],
};

function createMockRepository(): jest.Mocked<ICurriculumRepository> {
  return {
    getCurriculum: jest.fn().mockResolvedValue(fixture),
    findDayByNumber: jest
      .fn()
      .mockImplementation((day: number) =>
        Promise.resolve(fixture.days.find((d) => d.day === day) ?? null)
      ),
    findModuleForDay: jest.fn(),
  };
}

describe('CurriculumService', () => {
  it('returns the full curriculum from the repository', async () => {
    const repository = createMockRepository();
    const service = new CurriculumService(repository);

    const result = await service.getCurriculum();

    expect(result).toEqual(fixture);
  });

  it('returns a single day when found', async () => {
    const repository = createMockRepository();
    const service = new CurriculumService(repository);

    const result = await service.getDay(1);

    expect(result.title).toBe('Setup');
  });

  it('throws a 404 AppError when the day does not exist', async () => {
    const repository = createMockRepository();
    const service = new CurriculumService(repository);

    await expect(service.getDay(99)).rejects.toBeInstanceOf(AppError);
    await expect(service.getDay(99)).rejects.toMatchObject({ statusCode: 404 });
  });
});
