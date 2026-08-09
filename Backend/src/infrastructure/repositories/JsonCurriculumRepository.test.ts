import { Curriculum } from '@domain/entities/Curriculum';
import { JsonCurriculumRepository } from '@infrastructure/repositories/JsonCurriculumRepository';

const fixture: Curriculum = {
  cohort: 'Test Cohort · 6 days · 2 modules',
  modules: [
    { n: 1, title: 'Environment & Tooling', days: [1, 3] },
    { n: 2, title: 'Data Foundations', days: [4, 6] },
  ],
  days: [
    { day: 1, title: 'Setup', type: 'SETUP', tools: ['VS Code'], objectives: ['Install VS Code'] },
    { day: 4, title: 'Pandas', type: 'BUILD', tools: ['Pandas'], objectives: ['Load CSV'] },
  ],
};

describe('JsonCurriculumRepository', () => {
  it('returns the full curriculum', async () => {
    const repository = new JsonCurriculumRepository(fixture);

    const result = await repository.getCurriculum();

    expect(result).toEqual(fixture);
  });

  it('finds a day by number', async () => {
    const repository = new JsonCurriculumRepository(fixture);

    const result = await repository.findDayByNumber(4);

    expect(result?.title).toBe('Pandas');
  });

  it('returns null for a day that does not exist', async () => {
    const repository = new JsonCurriculumRepository(fixture);

    const result = await repository.findDayByNumber(99);

    expect(result).toBeNull();
  });

  it('resolves the module that contains a given day', async () => {
    const repository = new JsonCurriculumRepository(fixture);

    const result = await repository.findModuleForDay(5);

    expect(result?.n).toBe(2);
    expect(result?.title).toBe('Data Foundations');
  });

  it('returns null when no module covers the given day', async () => {
    const repository = new JsonCurriculumRepository(fixture);

    const result = await repository.findModuleForDay(99);

    expect(result).toBeNull();
  });

  it('loads the bundled seed data when no data is injected', async () => {
    const repository = new JsonCurriculumRepository();

    const result = await repository.getCurriculum();

    expect(result.modules.length).toBeGreaterThan(0);
    expect(result.days.length).toBeGreaterThan(0);
  });
});
