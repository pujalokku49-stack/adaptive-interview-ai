import { Request, Response } from 'express';

interface HealthResponseBody {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
}

/**
 * Reports process liveness. Intentionally free of business logic —
 * it only reads process-level facts and formats them for HTTP.
 */
export function getHealth(_req: Request, res: Response): void {
  const body: HealthResponseBody = {
    status: 'ok',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(body);
}
