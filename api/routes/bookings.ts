import { Router, Request, Response } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  checkIn,
  checkOut,
  cancelBooking,
  isRoomAvailable
} from '../services/bookingService.js';
import { createBill } from '../services/billingService.js';
import { getRoomById } from '../services/roomService.js';
import { processWaitlistForRoom } from '../services/waitlistService.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { date } = req.query;
  const bookings = getBookings(date as string);
  res.json({ bookings });
});

router.get('/:id', (req: Request, res: Response) => {
  const booking = getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: '预约不存在' });
  }
  res.json({ booking });
});

router.post('/check-availability', (req: Request, res: Response) => {
  const { roomId, startTime, endTime } = req.body;
  const available = isRoomAvailable(roomId, startTime, endTime);
  res.json({ available });
});

router.post('/', (req: Request, res: Response) => {
  const { roomId, customerName, customerPhone, startTime, endTime } = req.body;
  
  if (!roomId || !customerName || !customerPhone || !startTime || !endTime) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const result = createBooking({
    roomId,
    customerName,
    customerPhone,
    startTime,
    endTime
  });
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  res.status(201).json({ booking: result });
});

router.post('/:id/checkin', (req: Request, res: Response) => {
  const result = checkIn(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ booking: result });
});

router.post('/:id/checkout', (req: Request, res: Response) => {
  const result = checkOut(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  const { booking, pricing } = result;
  const room = getRoomById(booking.roomId);
  
  const actualDuration = booking.checkOutTime && booking.checkInTime
    ? (new Date(booking.checkOutTime).getTime() - new Date(booking.checkInTime).getTime()) / 60000
    : 0;
  
  const bill = createBill({
    bookingId: booking.id,
    customerName: booking.customerName,
    roomName: room?.name || '未知琴房',
    startTime: booking.checkInTime!,
    endTime: booking.checkOutTime!,
    actualDuration: Math.round(actualDuration),
    totalAmount: pricing.totalAmount,
    breakdown: pricing.breakdown
  });
  
  processWaitlistForRoom(booking.roomId, booking.startTime, booking.endTime);
  
  res.json({ booking, bill });
});

router.delete('/:id', (req: Request, res: Response) => {
  const result = cancelBooking(req.params.id);
  
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  
  processWaitlistForRoom(result.roomId, result.startTime, result.endTime);
  
  res.json({ success: true, booking: result });
});

export default router;
