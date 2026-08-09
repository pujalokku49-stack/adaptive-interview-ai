import { randomUUID } from 'crypto';

import { IAnswerEvaluatorService } from '@application/services/IAnswerEvaluatorService';
import { IInterviewPlannerService } from '@application/services/IInterviewPlannerService';
import { IQuestionGeneratorService } from '@application/services/IQuestionGeneratorService';
import { ISessionService } from '@application/services/ISessionService';
import { InterviewFocusArea, InterviewPlan } from '@domain/entities/InterviewPlan';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { AppError } from '@shared/errors/AppError';

/**
 * Owns the interview session state machine. Starting a session and
 * advancing after each answer both delegate topic/question/difficulty
 * selection to Module 7's IQuestionGeneratorService, which decides
 * whether to advance to the next plan topic or issue a same-topic
 * follow-up based on the candidate's live performance.
 *
 * The full topic queue (Module 4's plan, gaps then strengths) is rebuilt
 * from InterviewPlannerService each time rather than cached on the
 * session — deterministic given the same candidate + curriculum, and it
 * keeps InterviewSession's persisted shape exactly the field list it's
 * meant to have, with no extra internal bookkeeping.
 */
export class SessionService implements ISessionService {
  constructor(
    private readonly interviewPlannerService: IInterviewPlannerService,
    private readonly sessionRepository: ISessionRepository,
    private readonly answerEvaluatorService: IAnswerEvaluatorService,
    private readonly questionGeneratorService: IQuestionGeneratorService
  ) {}

  public async startSession(candidateId: string, customSessionId?: string): Promise<InterviewSession> {
    const plan = await this.interviewPlannerService.buildPlan(candidateId);
    const remainingTopics = this.buildTopicQueue(plan).map((area) => area.dayTitle);

    const generated = await this.questionGeneratorService.generateNext({
      plan,
      remainingTopics,
      history: [],
      currentDifficulty: 'medium',
    });

    const now = new Date().toISOString();

    const session: InterviewSession = {
      sessionId: customSessionId ?? randomUUID(),
      candidateId: plan.candidateId,
      currentQuestion: generated ? generated.question : null,
      currentTopic: generated ? generated.topic : null,
      difficulty: generated ? generated.difficulty : 'medium',
      questionsAsked: generated ? 1 : 0,
      topicsCovered: [],
      remainingTopics: generated
        ? remainingTopics.filter((topic) => topic !== generated.topic)
        : remainingTopics,
      score: 0,
      history: [],
      status: generated ? 'in_progress' : 'completed',
      createdAt: now,
      updatedAt: now,
    };

    return this.sessionRepository.save(session);
  }

  public async getSession(sessionId: string): Promise<InterviewSession> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new AppError(`Session with id "${sessionId}" not found`, 404);
    }

    return session;
  }

  public async submitAnswer(sessionId: string, answer: string): Promise<InterviewSession> {
    const session = await this.getSession(sessionId);

    if (session.status === 'completed') {
      throw new AppError(`Session "${sessionId}" is already completed`, 409);
    }
    if (!session.currentQuestion || !session.currentTopic) {
      throw new AppError(`Session "${sessionId}" has no active question`, 409);
    }

    const evaluation = await this.answerEvaluatorService.evaluate({
      question: session.currentQuestion,
      answer,
      topic: session.currentTopic,
      difficulty: session.difficulty,
    });

    const plan = await this.interviewPlannerService.buildPlan(session.candidateId);
    const history = [...session.history, evaluation];

    const generated = await this.questionGeneratorService.generateNext({
      plan,
      remainingTopics: session.remainingTopics,
      history,
      currentDifficulty: session.difficulty,
    });

    const advancingToNewTopic = !generated || !generated.isFollowUp;

    const topicsCovered =
      advancingToNewTopic && session.currentTopic
        ? [...session.topicsCovered, session.currentTopic]
        : session.topicsCovered;

    const remainingTopics =
      generated && !generated.isFollowUp
        ? session.remainingTopics.filter((topic) => topic !== generated.topic)
        : session.remainingTopics;

    const updated: InterviewSession = {
      ...session,
      currentQuestion: generated ? generated.question : null,
      currentTopic: generated ? generated.topic : null,
      difficulty: generated ? generated.difficulty : session.difficulty,
      questionsAsked: session.questionsAsked + (generated ? 1 : 0),
      topicsCovered,
      remainingTopics,
      score: session.score + evaluation.score,
      history,
      status: generated ? 'in_progress' : 'completed',
      updatedAt: new Date().toISOString(),
    };

    return this.sessionRepository.save(updated);
  }

  private buildTopicQueue(plan: InterviewPlan): InterviewFocusArea[] {
    return [...plan.gaps, ...plan.strengths];
  }
}
