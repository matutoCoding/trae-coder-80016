import { Router, Request, Response } from 'express';
import {
  getPricingTiers,
  getTimeSlots,
  calculatePricing,
  updatePricingTier,
  createPricingTier,
  deletePricingTier,
  getPricingScheduleByDay
} from '../services/pricingService.js';

const router = Router();

router.get('/tiers', (req: Request, res: Response) => {
  const tiers = getPricingTiers();
  res.json({ tiers });
});

router.post('/tiers', (req: Request, res: Response) => {
  const { name, rate, color } = req.body;
  
  if (!name || rate === undefined) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const tier = createPricingTier({
    name,
    rate: Number(rate),
    color: color || '#2196F3'
  });
  
  res.status(201).json({ tier });
});

router.put('/tiers/:id', (req: Request, res: Response) => {
  const tier = updatePricingTier(req.params.id, req.body);
  if (!tier) {
    return res.status(404).json({ error: '费率档位不存在' });
  }
  res.json({ tier });
});

router.delete('/tiers/:id', (req: Request, res: Response) => {
  const success = deletePricingTier(req.params.id);
  if (!success) {
    return res.status(404).json({ error: '费率档位不存在' });
  }
  res.json({ success: true });
});

router.get('/slots', (req: Request, res: Response) => {
  const slots = getTimeSlots();
  res.json({ slots });
});

router.get('/schedule/:dayOfWeek', (req: Request, res: Response) => {
  const dayOfWeek = parseInt(req.params.dayOfWeek);
  if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({ error: '无效的星期参数' });
  }
  const schedule = getPricingScheduleByDay(dayOfWeek);
  res.json({ schedule });
});

router.post('/calculate', (req: Request, res: Response) => {
  const { startTime, endTime, roomType } = req.body;
  
  if (!startTime || !endTime) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const result = calculatePricing(startTime, endTime, roomType);
  res.json(result);
});

export default router;
