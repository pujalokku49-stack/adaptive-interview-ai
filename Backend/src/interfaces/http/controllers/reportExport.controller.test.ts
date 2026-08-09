import { Request, Response } from 'express';
import { ReportExportController } from '@interfaces/http/controllers/reportExport.controller';
import { IReportExportService } from '@application/services/IReportExportService';

describe('ReportExportController', () => {
  it('sets attachment headers and sends report content', async () => {
    const reportExportService: jest.Mocked<IReportExportService> = {
      exportReport: jest.fn().mockResolvedValue({
        filename: 'interview-report-CAND-001-session-123.md',
        contentType: 'text/markdown',
        content: '# Report content',
      }),
    };

    const controller = new ReportExportController(reportExportService);

    const req = {
      params: { sessionId: 'session-123' },
      query: { format: 'markdown' },
    } as unknown as Request;

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await controller.exportReport(req, res);

    expect(reportExportService.exportReport).toHaveBeenCalledWith('session-123', 'markdown');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/markdown');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="interview-report-CAND-001-session-123.md"'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('# Report content');
  });
});
