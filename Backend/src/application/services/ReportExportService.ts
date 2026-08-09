import { IFeedbackGeneratorService } from '@application/services/IFeedbackGeneratorService';
import {
  ExportFormat,
  ExportReportResult,
  IReportExportService,
} from '@application/services/IReportExportService';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { AppError } from '@shared/errors/AppError';

/**
 * Module 12: Interview Report Export Application Service.
 * Formats completed interview feedback into downloadable Markdown, JSON, or Text report documents.
 */
export class ReportExportService implements IReportExportService {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly feedbackGeneratorService: IFeedbackGeneratorService
  ) {}

  public async exportReport(
    sessionId: string,
    format: ExportFormat = 'markdown'
  ): Promise<ExportReportResult> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new AppError(`Session with id "${sessionId}" not found`, 404);
    }

    if (session.status !== 'completed') {
      throw new AppError(`Session "${sessionId}" is not completed yet`, 409);
    }

    const report = await this.feedbackGeneratorService.generate(sessionId);

    const safeCandidateId = report.candidateId || session.candidateId;

    if (format === 'json') {
      return {
        filename: `interview-report-${safeCandidateId}-${sessionId}.json`,
        contentType: 'application/json',
        content: JSON.stringify(report, null, 2),
      };
    }

    if (format === 'text') {
      const textLines = [
        `TECHNICAL INTERVIEW REPORT`,
        `Candidate ID: ${safeCandidateId}`,
        `Overall Score: ${report.overallScore}/10`,
        `Recommended Difficulty: ${report.recommendedNextDifficulty.toUpperCase()}`,
        `Generated At: ${report.generatedAt}`,
        ``,
        `TOPIC SCORES:`,
        ...report.topicScores.map((t) => `- ${t.topic}: ${t.score}/10`),
        ``,
        `STRENGTHS:`,
        ...report.strengths.map((s) => `- ${s}`),
        ``,
        `WEAKNESSES & KNOWLEDGE GAPS:`,
        ...report.weaknesses.map((w) => `- ${w}`),
        ...report.knowledgeGaps.map((g) => `- ${g}`),
        ``,
        `RECOMMENDED NEXT STEPS:`,
        ...report.improvementSuggestions.map((s) => `- ${s}`),
      ];

      return {
        filename: `interview-report-${safeCandidateId}-${sessionId}.txt`,
        contentType: 'text/plain',
        content: textLines.join('\n'),
      };
    }

    // Default: markdown
    const mdLines = [
      `# Technical Interview Report`,
      ``,
      `- **Candidate ID**: \`${safeCandidateId}\``,
      `- **Overall Score**: **${report.overallScore} / 10**`,
      `- **Recommended Next Difficulty**: \`${report.recommendedNextDifficulty}\``,
      `- **Report Generated At**: ${report.generatedAt}`,
      ``,
      `---`,
      ``,
      `## Topic Scores`,
      ...report.topicScores.map((t) => `- **${t.topic}**: ${t.score}/10`),
      ``,
      `## Candidate Strengths`,
      ...report.strengths.map((s) => `- ${s}`),
      ``,
      `## Identified Knowledge Gaps`,
      ...report.knowledgeGaps.map((g) => `- ${g}`),
      ``,
      `## Improvement Suggestions & Resources`,
      ...report.improvementSuggestions.map((s) => `- ${s}`),
      ...report.learningResources.map((r) => `- Resource: ${r}`),
    ];

    return {
      filename: `interview-report-${safeCandidateId}-${sessionId}.md`,
      contentType: 'text/markdown',
      content: mdLines.join('\n'),
    };
  }
}
