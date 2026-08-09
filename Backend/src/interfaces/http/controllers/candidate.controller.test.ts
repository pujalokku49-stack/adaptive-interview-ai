import { Request, Response } from 'express';

import { ICandidateService } from '@application/services/ICandidateService';
import { CandidateController } from '@interfaces/http/controllers/candidate.controller';
import { AppError } from '@shared/errors/AppError';

function createMockService(): jest.Mocked<ICandidateService> {
  return {
    getAllCandidates: jest.fn(),
    getCandidateById: jest.fn(),
  };
}

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('CandidateController', () => {
  describe('getAll', () => {
    it('delegates to the service with parsed filters and returns 200', async () => {
      const service = createMockService();
      service.getAllCandidates.mockResolvedValue({
        items: [
          {
            id: 'CAND-001',
            fullName: 'Ada Lovelace',
            jobRole: 'Backend Engineer',
            yearsExperience: 5,
            education: 'MS Computer Science',
            status: 'COMPLETED',
            missions: [],
            signals: { commitDays: 20, missionsCompleted: 10, missionsFirstTry: 8 },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      });

      const controller = new CandidateController(service);
      const req = { query: { role: 'Backend Engineer', page: 1, limit: 10 } } as unknown as Request;
      const res = createMockResponse();

      await controller.getAll(req, res);

      expect(service.getAllCandidates).toHaveBeenCalledWith({
        role: 'Backend Engineer',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          meta: { total: 1, page: 1, limit: 10 },
        })
      );
    });
  });

  describe('getById', () => {
    it('delegates to the service with the parsed id and returns 200', async () => {
      const service = createMockService();
      service.getCandidateById.mockResolvedValue({
        id: 'CAND-001',
        fullName: 'Ada Lovelace',
        jobRole: 'Backend Engineer',
        yearsExperience: 5,
        education: 'MS Computer Science',
        status: 'COMPLETED',
        missions: [],
        signals: { commitDays: 20, missionsCompleted: 10, missionsFirstTry: 8 },
      });

      const controller = new CandidateController(service);
      const req = { params: { id: 'CAND-001' } } as unknown as Request;
      const res = createMockResponse();

      await controller.getById(req, res);

      expect(service.getCandidateById).toHaveBeenCalledWith('CAND-001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          data: expect.objectContaining({ id: 'CAND-001' }),
        })
      );
    });

    it('propagates service errors instead of swallowing them', async () => {
      const service = createMockService();
      service.getCandidateById.mockRejectedValue(
        new AppError('Candidate with id "CAND-999" not found', 404)
      );

      const controller = new CandidateController(service);
      const req = { params: { id: 'CAND-999' } } as unknown as Request;
      const res = createMockResponse();

      await expect(controller.getById(req, res)).rejects.toBeInstanceOf(AppError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
