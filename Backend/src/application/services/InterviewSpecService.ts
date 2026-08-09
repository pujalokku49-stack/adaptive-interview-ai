import { IInterviewSpecService } from '@application/services/IInterviewSpecService';
import { IEvaluationEngineService } from '@application/services/IEvaluationEngineService';
import { ISessionService } from '@application/services/ISessionService';
import {
  CandidatePayload,
  InterviewSpecRequest,
  InterviewSpecResponse,
} from '@domain/entities/InterviewSpec';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { AppError } from '@shared/errors/AppError';

/**
 * Module 10: Standard Technical Specification Adapter Service.
 * Implements the single POST /api/interview specification workflow by delegating
 * session management, candidate profile handling, and feedback evaluation
 * to existing application services without duplicating business logic.
 */
export class InterviewSpecService implements IInterviewSpecService {
  constructor(
    private readonly sessionService: ISessionService,
    private readonly candidateRepository: ICandidateRepository,
    private readonly evaluationEngineService: IEvaluationEngineService
  ) {}

  public async handleRequest(request: InterviewSpecRequest): Promise<InterviewSpecResponse> {
    if (request.candidate) {
      return this.handleStart(request.sessionId, request.candidate);
    }

    if (typeof request.message === 'string') {
      return this.handleTurn(request.sessionId, request.message);
    }

    throw new AppError('Invalid request payload: must provide candidate object or message string', 400);
  }

  private async handleStart(
    sessionId: string,
    candidatePayload: CandidatePayload
  ): Promise<InterviewSpecResponse> {
    const candidateId = candidatePayload.id;
    if (!candidateId) {
      throw new AppError('Candidate payload must contain an id property', 400);
    }

    let candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) {
      candidate = {
        id: candidateId,
        fullName: candidatePayload.fullName ?? `Candidate ${candidateId}`,
        jobRole: candidatePayload.jobRole ?? 'Software Engineer',
        yearsExperience: candidatePayload.yearsExperience ?? 3,
        education: candidatePayload.education ?? 'BS Computer Science',
        status: candidatePayload.status ?? 'ACTIVE',
        missions: candidatePayload.missions ?? [],
        signals: candidatePayload.signals ?? {
          commitDays: 0,
          missionsCompleted: 0,
          missionsFirstTry: 0,
        },
      };
      if (this.candidateRepository.save) {
        await this.candidateRepository.save(candidate);
      }
    }

    let session = await this.sessionService.getSession(sessionId).catch(() => null);

    if (!session) {
      session = await this.sessionService.startSession(candidateId, sessionId);
    }

    if (session.status === 'completed') {
      const feedback = this.evaluationEngineService.buildFeedback(session);
      return {
        reply: 'Interview completed.',
        done: true,
        feedback,
      };
    }

    const initialReply = session.currentQuestion
      ? `Welcome. Let's begin your interview. ${session.currentQuestion}`
      : "Welcome. Let's begin your interview.";

    return {
      reply: initialReply,
      done: false,
    };
  }

  private async handleTurn(sessionId: string, message: string): Promise<InterviewSpecResponse> {
    const session = await this.sessionService.getSession(sessionId);

    if (session.status === 'completed') {
      const feedback = this.evaluationEngineService.buildFeedback(session);
      return {
        reply: 'Interview completed.',
        done: true,
        feedback,
      };
    }

    const updatedSession = await this.sessionService.submitAnswer(sessionId, message);

    if (updatedSession.status === 'completed') {
      const feedback = this.evaluationEngineService.buildFeedback(updatedSession);
      return {
        reply: 'Interview completed.',
        done: true,
        feedback,
      };
    }

    return {
      reply: updatedSession.currentQuestion ?? 'Thank you.',
      done: false,
    };
  }
}
