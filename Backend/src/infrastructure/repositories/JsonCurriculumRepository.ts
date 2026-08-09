import { Curriculum, CurriculumDay, CurriculumModule } from '@domain/entities/Curriculum';
import { ICurriculumRepository } from '@domain/repositories/ICurriculumRepository';
import curriculumSeedData from '@infrastructure/data/curriculum.seed.json';

/**
 * Loads the cohort curriculum from a bundled JSON seed file, held in
 * memory for the lifetime of the instance. Implements ICurriculumRepository
 * so it can be swapped for a database/CMS-backed repository later without
 * any change to the service or controller layers.
 *
 * Seed data can be injected (used by unit tests); defaults to the bundled
 * JSON file otherwise.
 */
export class JsonCurriculumRepository implements ICurriculumRepository {
  private readonly curriculum: Curriculum;

  constructor(seedData: Curriculum = curriculumSeedData as Curriculum) {
    this.curriculum = seedData;
  }

  public async getCurriculum(): Promise<Curriculum> {
    return this.curriculum;
  }

  public async findDayByNumber(day: number): Promise<CurriculumDay | null> {
    return this.curriculum.days.find((d) => d.day === day) ?? null;
  }

  public async findModuleForDay(day: number): Promise<CurriculumModule | null> {
    return (
      this.curriculum.modules.find(
        (module) => day >= module.days[0] && day <= module.days[1]
      ) ?? null
    );
  }
}
