import { ICandidateService } from '@application/services/ICandidateService';
import { ICurriculumService } from '@application/services/ICurriculumService';
import { IEvaluationEngineService } from '@application/services/IEvaluationEngineService';
import { IFeedbackGeneratorService } from '@application/services/IFeedbackGeneratorService';
import { IInterviewPlannerService } from '@application/services/IInterviewPlannerService';
import { buildFeedbackPrompt } from '@application/services/prompts/feedbackGeneratorPrompt';
import { finalFeedbackReportSchema } from '@application/validation/finalFeedbackReport.validation';
import { Candidate } from '@domain/entities/Candidate';
import { FinalFeedbackReport, TopicScore } from '@domain/entities/FinalFeedbackReport';
import { InterviewDifficulty, InterviewSession } from '@domain/entities/InterviewSession';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { ILLMProvider } from '@domain/providers/ILLMProvider';
import { AppError } from '@shared/errors/AppError';
import { logger } from '@infrastructure/logger/logger';

const HIGH_SCORE_THRESHOLD = 8;
const MID_SCORE_THRESHOLD = 5;

/**
 * Builds the final structured feedback report for a completed interview
 * session by prompting an LLM with candidate profile, curriculum, interview plan,
 * and session conversation history. Validates response via Zod schema.
 *
 * Gracefully degrades to a deterministic fallback report built from Module 8's
 * EvaluationEngineService if the LLM provider fails, outputs invalid JSON,
 * or fails schema validation.
 */
export class FeedbackGeneratorService implements IFeedbackGeneratorService {
  constructor(
    private readonly candidateService: ICandidateService,
    private readonly curriculumService: ICurriculumService,
    private readonly interviewPlannerService: IInterviewPlannerService,
    private readonly sessionRepository: ISessionRepository,
    private readonly llmProvider: ILLMProvider,
    private readonly evaluationEngineService: IEvaluationEngineService
  ) {}

  public async generate(sessionId: string): Promise<FinalFeedbackReport> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new AppError(`Session with id "${sessionId}" not found`, 404);
    }
    if (session.status !== 'completed') {
      throw new AppError(`Session "${sessionId}" is not yet completed`, 409);
    }

    const candidateDTO = await this.candidateService.getCandidateById(session.candidateId);
    const curriculum = await this.curriculumService.getCurriculum();
    const plan = await this.interviewPlannerService.buildPlan(session.candidateId);
    // CandidateDTO is structurally identical to Candidate — cast directly
    // rather than rebuilding field by field.
    const candidate = candidateDTO as Candidate;

    try {
      const { system, prompt } = buildFeedbackPrompt({ candidate, curriculum, plan, session });
      const completion = await this.llmProvider.complete({ system, prompt });
      return this.parseAndValidate(completion.text, candidate);
    } catch (err) {
      // Provider failure, malformed JSON, or schema validation failure —
      // log for observability then degrade gracefully to a deterministic report.
      logger.warn(
        { err, sessionId, candidateId: session.candidateId },
        'LLM feedback generation failed — using deterministic fallback'
      );
      return this.buildFallbackReport(candidate, session);
    }
  }

  private parseAndValidate(rawText: string, candidate: Candidate): FinalFeedbackReport {
    const jsonText = this.extractJson(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('LLM response was not valid JSON');
    }

    const result = finalFeedbackReportSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLM response failed schema validation: ${result.error.message}`);
    }

    return {
      ...result.data,
      candidateId: candidate.id,
      generatedAt: new Date().toISOString(),
    };
  }

  private extractJson(text: string): string {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    return (fenced?.[1] ?? text).trim();
  }

  private buildFallbackReport(candidate: Candidate, session: InterviewSession): FinalFeedbackReport {
    const baseFeedback = this.evaluationEngineService.buildFeedback(session);
    const topicScores = this.computeTopicScores(session);
    const totalQuestions = session.history.length;
    const overallScore =
      totalQuestions > 0 ? Math.round((session.score / totalQuestions) * 10) / 10 : 0;

    return {
      candidateId: candidate.id,
      overallScore,
      topicScores,
      strengths: baseFeedback.strengths,
      weaknesses: baseFeedback.gaps,
      missedConcepts: session.remainingTopics,
      knowledgeGaps: baseFeedback.gaps,
      improvementSuggestions: baseFeedback.next,
      learningResources: [
        'Review the relevant curriculum modules and days for each listed gap.',
      ],
      recommendedNextDifficulty: this.recommendDifficulty(overallScore),
      generatedAt: new Date().toISOString(),
    };
  }

  private computeTopicScores(session: InterviewSession): TopicScore[] {
    return session.history.map((entry, index) => ({
      topic:
        session.topicsCovered[index] ??
        entry.weakAreas[0] ??
        entry.strongAreas[0] ??
        entry.knowledgeGap[0] ??
        'Unknown topic',
      score: entry.score,
    }));
  }

  private recommendDifficulty(overallScore: number): InterviewDifficulty {
    if (overallScore >= HIGH_SCORE_THRESHOLD) return 'hard';
    if (overallScore >= MID_SCORE_THRESHOLD) return 'medium';
    return 'easy';
  }
}
