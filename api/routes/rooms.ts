import { Router, Request, Response } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../services/roomService.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const rooms = getRooms();
  res.json({ rooms });
});

router.get('/:id', (req: Request, res: Response) => {
  const room = getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ error: '琴房不存在' });
  }
  res.json({ room });
});

router.post('/', (req: Request, res: Response) => {
  const { name, type, equipment, capacity, status, description } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const room = createRoom({
    name,
    type,
    equipment: equipment || [],
    capacity: capacity || 1,
    status: status || 'available',
    description
  });
  
  res.status(201).json({ room });
});

router.put('/:id', (req: Request, res: Response) => {
  const room = updateRoom(req.params.id, req.body);
  if (!room) {
    return res.status(404).json({ error: '琴房不存在' });
  }
  res.json({ room });
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = deleteRoom(req.params.id);
  if (!success) {
    return res.status(404).json({ error: '琴房不存在' });
  }
  res.json({ success: true });
});

export default router;
