import { ICurriculumService } from '@application/services/ICurriculumService';
import { Curriculum, CurriculumDay } from '@domain/entities/Curriculum';
import { ICurriculumRepository } from '@domain/repositories/ICurriculumRepository';
import { AppError } from '@shared/errors/AppError';

export class CurriculumService implements ICurriculumService {
  constructor(private readonly curriculumRepository: ICurriculumRepository) {}

  public async getCurriculum(): Promise<Curriculum> {
    return this.curriculumRepository.getCurriculum();
  }

  public async getDay(day: number): Promise<CurriculumDay> {
    const found = await this.curriculumRepository.findDayByNumber(day);

    if (!found) {
      throw new AppError(`Curriculum day ${day} not found`, 404);
    }

    return found;
  }
}
