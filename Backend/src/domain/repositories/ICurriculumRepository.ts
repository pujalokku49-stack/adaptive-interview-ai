import { Curriculum, CurriculumDay, CurriculumModule } from '@domain/entities/Curriculum';

/**
 * Port defining how the domain expects to read curriculum data.
 * Infrastructure provides the implementation (JSON file today, a CMS or
 * database later) — the application layer never depends on the concrete
 * source.
 */
export interface ICurriculumRepository {
  getCurriculum(): Promise<Curriculum>;
  findDayByNumber(day: number): Promise<CurriculumDay | null>;
  findModuleForDay(day: number): Promise<CurriculumModule | null>;
}
