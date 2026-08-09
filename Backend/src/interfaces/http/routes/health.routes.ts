import { Router } from 'express';

import { getHealth } from '@interfaces/http/controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns process status, uptime, and current server timestamp.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptimeSeconds:
 *                   type: number
 *                   example: 12.34
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', getHealth);

export { router as healthRouter };
