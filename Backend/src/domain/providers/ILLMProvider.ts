/**
 * Port for a generic LLM text-completion call. Deliberately minimal and
 * provider-agnostic — FeedbackGeneratorService (and any future module)
 * depends only on this interface, never a concrete vendor SDK, so the
 * provider can be swapped without touching business logic.
 */
export interface LLMCompletionRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
}

export interface LLMCompletionResult {
  text: string;
}

export interface ILLMProvider {
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResult>;
}
