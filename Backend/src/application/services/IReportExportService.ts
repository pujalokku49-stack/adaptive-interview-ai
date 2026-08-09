export type ExportFormat = 'json' | 'markdown' | 'text';

export interface ExportReportResult {
  filename: string;
  contentType: string;
  content: string;
}

/**
 * Application service interface for Module 12: Interview Report Export.
 */
export interface IReportExportService {
  exportReport(sessionId: string, format?: ExportFormat): Promise<ExportReportResult>;
}
