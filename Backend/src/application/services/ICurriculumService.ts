import { Curriculum, CurriculumDay } from '@domain/entities/Curriculum';

/**
 * The controller depends on this interface, not the concrete
 * CurriculumService, keeping the interface-adapter layer decoupled from
 * application internals and trivially mockable in tests.
 */
export interface ICurriculumService {
  getCurriculum(): Promise<Curriculum>;
  getDay(day: number): Promise<CurriculumDay>;
}
