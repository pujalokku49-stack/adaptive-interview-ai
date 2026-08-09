import { IInterviewPlannerService } from '@application/services/IInterviewPlannerService';
import { Candidate } from '@domain/entities/Candidate';
import { Curriculum, CurriculumDay } from '@domain/entities/Curriculum';
import { InterviewFocusArea, InterviewPlan } from '@domain/entities/InterviewPlan';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { ICurriculumRepository } from '@domain/repositories/ICurriculumRepository';
import { AppError } from '@shared/errors/AppError';

const MAX_GAP_QUESTIONS = 5;
const MAX_STRENGTH_QUESTIONS = 3;

/**
 * Builds a per-candidate interview plan by reasoning over their mission
 * history (from the candidate repository) against the cohort curriculum
 * (from the curriculum repository).
 *
 * Rules:
 *  - A mission marked `skipped` or `passed: false` becomes a gap to probe.
 *  - A SHIP_IT (milestone) curriculum day the candidate never attempted at
 *    all is also a gap — those days are the ones the technical spec's
 *    final feedback (strengths/gaps/next) most needs signal on.
 *  - A mission `passed: true` on the first attempt becomes a strength to
 *    push deeper on.
 */
export class InterviewPlannerService implements IInterviewPlannerService {
  constructor(
    private readonly candidateRepository: ICandidateRepository,
    private readonly curriculumRepository: ICurriculumRepository
  ) {}

  public async buildPlan(candidateId: string): Promise<InterviewPlan> {
    const candidate = await this.candidateRepository.findById(candidateId);

    if (!candidate) {
      throw new AppError(`Candidate with id "${candidateId}" not found`, 404);
    }

    const curriculum = await this.curriculumRepository.getCurriculum();

    const { gaps, strengths } = this.classifyMissions(candidate, curriculum);

    gaps.sort((a, b) => a.day - b.day);
    strengths.sort((a, b) => a.day - b.day);

    return {
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      jobRole: candidate.jobRole,
      strengths,
      gaps,
      suggestedQuestions: this.buildSuggestedQuestions(gaps, strengths),
      generatedAt: new Date().toISOString(),
    };
  }

  private classifyMissions(
    candidate: Candidate,
    curriculum: Curriculum
  ): { gaps: InterviewFocusArea[]; strengths: InterviewFocusArea[] } {
    const dayByNumber = new Map(curriculum.days.map((d) => [d.day, d]));
    const attemptedDays = new Set(candidate.missions.map((m) => m.day));

    const gaps: InterviewFocusArea[] = [];
    const strengths: InterviewFocusArea[] = [];

    for (const mission of candidate.missions) {
      const day = dayByNumber.get(mission.day);
      if (!day) continue; // mission references a day outside the known curriculum

      if (mission.skipped) {
        gaps.push(this.toFocusArea(day, curriculum, 'skipped'));
      } else if (mission.passed === false) {
        gaps.push(this.toFocusArea(day, curriculum, 'failed'));
      } else if (mission.passed === true && mission.attempts === 1) {
        strengths.push(this.toFocusArea(day, curriculum, 'strong_first_try'));
      }
    }

    const unattemptedMilestones = curriculum.days.filter(
      (day) => day.type === 'SHIP_IT' && !attemptedDays.has(day.day)
    );

    for (const day of unattemptedMilestones) {
      gaps.push(this.toFocusArea(day, curriculum, 'not_attempted'));
    }

    return { gaps, strengths };
  }

  private toFocusArea(
    day: CurriculumDay,
    curriculum: Curriculum,
    reason: InterviewFocusArea['reason']
  ): InterviewFocusArea {
    const module = curriculum.modules.find((m) => day.day >= m.days[0] && day.day <= m.days[1]);

    return {
      day: day.day,
      moduleTitle: module?.title ?? 'Unknown module',
      dayTitle: day.title,
      reason,
      objectives: day.objectives,
    };
  }

  private buildSuggestedQuestions(
    gaps: InterviewFocusArea[],
    strengths: InterviewFocusArea[]
  ): string[] {
    const questions: string[] = [];

    for (const gap of gaps.slice(0, MAX_GAP_QUESTIONS)) {
      const objective = gap.objectives[0] ?? gap.dayTitle;

      if (gap.reason === 'failed') {
        questions.push(
          `You had trouble passing "${gap.dayTitle}" — walk me through: ${objective}. What would you do differently now?`
        );
      } else if (gap.reason === 'skipped') {
        questions.push(
          `You skipped "${gap.dayTitle}" — how would you approach: ${objective}?`
        );
      } else {
        questions.push(
          `There's no record of you attempting "${gap.dayTitle}" — explain how you'd tackle: ${objective}.`
        );
      }
    }

    for (const strength of strengths.slice(0, MAX_STRENGTH_QUESTIONS)) {
      const objective = strength.objectives[0] ?? strength.dayTitle;
      questions.push(
        `You passed "${strength.dayTitle}" on your first attempt — go deeper on how you handled: ${objective}.`
      );
    }

    return questions;
  }
}
