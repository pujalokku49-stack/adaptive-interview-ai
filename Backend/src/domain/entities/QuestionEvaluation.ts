/**
 * Core domain entity. The result of evaluating one candidate answer
 * against the question that was asked. Framework-agnostic — this is what
 * gets appended to InterviewSession.history (Module 5) and what the final
 * technical-spec feedback (summary/strengths/gaps/next) will be built from.
 */
export interface QuestionEvaluation {
  question: string;
  answer: string;
  evaluation: string;
  score: number;
  knowledgeGap: string[];
  strongAreas: string[];
  weakAreas: string[];
}
