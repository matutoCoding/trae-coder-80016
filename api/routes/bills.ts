import { Router, Request, Response } from 'express';
import {
  getBills,
  getBillById,
  payBill,
  getBillsStats
} from '../services/billingService.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { page, pageSize, startDate, endDate, status } = req.query;
  
  const result = getBills({
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    startDate: startDate as string,
    endDate: endDate as string,
    status: status as string
  });
  
  res.json(result);
});

router.get('/stats', (req: Request, res: Response) => {
  const { period } = req.query;
  const stats = getBillsStats(period as 'day' | 'week' | 'month');
  res.json(stats);
});

router.get('/:id', (req: Request, res: Response) => {
  const bill = getBillById(req.params.id);
  if (!bill) {
    return res.status(404).json({ error: '账单不存在' });
  }
  res.json({ bill });
});

router.post('/:id/pay', (req: Request, res: Response) => {
  const result = payBill(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ bill: result });
});

export default router;
