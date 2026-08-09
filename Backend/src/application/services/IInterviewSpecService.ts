import { InterviewSpecRequest, InterviewSpecResponse } from '@domain/entities/InterviewSpec';

/**
 * Application service interface for Module 10: Standard Technical Specification Endpoint.
 * Orchestrates session start / turn progression according to technical-spec.md.
 */
export interface IInterviewSpecService {
  handleRequest(request: InterviewSpecRequest): Promise<InterviewSpecResponse>;
}
