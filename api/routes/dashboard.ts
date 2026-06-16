import { Router, Request, Response } from 'express';
import { getDashboardStats } from '../services/dashboardService.js';

const router = Router();

router.get('/stats', (req: Request, res: Response) => {
  const stats = getDashboardStats();
  res.json(stats);
});

export default router;
