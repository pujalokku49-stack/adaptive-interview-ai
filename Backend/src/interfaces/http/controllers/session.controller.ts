import { Request, Response } from 'express';

import { IEvaluationEngineService } from '@application/services/IEvaluationEngineService';
import { ISessionService } from '@application/services/ISessionService';
import {
  SessionIdParams,
  StartSessionBody,
  SubmitAnswerBody,
} from '@interfaces/http/validation/session.validation';

/**
 * Contains no business logic: parses already-validated input, delegates
 * to the session/evaluation services, and shapes the HTTP response.
 * Errors are not caught here — they propagate to asyncHandler ->
 * centralized error middleware.
 */
export class SessionController {
  constructor(
    private readonly sessionService: ISessionService,
    private readonly evaluationEngineService: IEvaluationEngineService
  ) {}

  public start = async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.body as StartSessionBody;

    const session = await this.sessionService.startSession(candidateId);

    res.status(201).json({
      status: 'ok',
      data: session,
    });
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as unknown as SessionIdParams;

    const session = await this.sessionService.getSession(sessionId);

    res.status(200).json({
      status: 'ok',
      data: session,
    });
  };

  public submitAnswer = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as unknown as SessionIdParams;
    const { answer } = req.body as SubmitAnswerBody;

    const session = await this.sessionService.submitAnswer(sessionId, answer);

    res.status(200).json({
      status: 'ok',
      data: session,
    });
  };

  public getFeedback = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as unknown as SessionIdParams;

    const session = await this.sessionService.getSession(sessionId);
    const feedback = this.evaluationEngineService.buildFeedback(session);

    res.status(200).json({
      status: 'ok',
      data: feedback,
    });
  };
}
