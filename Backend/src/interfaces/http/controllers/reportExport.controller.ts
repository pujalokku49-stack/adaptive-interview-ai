import { Request, Response } from 'express';
import { IReportExportService } from '@application/services/IReportExportService';
import { ExportReportParams, ExportReportQuery } from '@interfaces/http/validation/reportExport.validation';

/**
 * Controller for Module 12: Interview Report Export.
 * Serves downloadable report files (Markdown, JSON, Plain text) with appropriate HTTP headers.
 */
export class ReportExportController {
  constructor(private readonly reportExportService: IReportExportService) {}

  public exportReport = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as unknown as ExportReportParams;
    const { format } = req.query as unknown as ExportReportQuery;

    const result = await this.reportExportService.exportReport(sessionId, format);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.status(200).send(result.content);
  };
}
