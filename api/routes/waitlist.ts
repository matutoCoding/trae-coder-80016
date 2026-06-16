import { Router, Request, Response } from 'express';
import {
  getWaitlist,
  getWaitlistById,
  addToWaitlist,
  notifyWaitlistEntry,
  confirmWaitlistEntry,
  cancelWaitlistEntry
} from '../services/waitlistService.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { date } = req.query;
  const entries = getWaitlist(date as string);
  res.json({ entries });
});

router.get('/:id', (req: Request, res: Response) => {
  const entry = getWaitlistById(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: '候补记录不存在' });
  }
  res.json({ entry });
});

router.post('/', (req: Request, res: Response) => {
  const { customerName, customerPhone, preferredStartTime, preferredEndTime, roomId } = req.body;
  
  if (!customerName || !customerPhone || !preferredStartTime || !preferredEndTime) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const entry = addToWaitlist({
    customerName,
    customerPhone,
    preferredStartTime,
    preferredEndTime,
    roomId
  });
  
  res.status(201).json({ entry });
});

router.post('/:id/notify', (req: Request, res: Response) => {
  const result = notifyWaitlistEntry(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ entry: result });
});

router.post('/:id/confirm', (req: Request, res: Response) => {
  const result = confirmWaitlistEntry(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ booking: result });
});

router.delete('/:id', (req: Request, res: Response) => {
  const result = cancelWaitlistEntry(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ success: true, entry: result });
});

export default router;
