import { Room } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';
import { DataFiles } from '../data/mockData.js';

export function getRooms(): Room[] {
  return readData<Room[]>(DataFiles.ROOMS, []);
}

export function getRoomById(roomId: string): Room | undefined {
  const rooms = getRooms();
  return rooms.find(r => r.id === roomId);
}

export function getAvailableRooms(): Room[] {
  return getRooms().filter(r => r.status === 'available');
}

export function createRoom(data: Omit<Room, 'id' | 'createdAt'>): Room {
  const rooms = getRooms();
  const newRoom: Room = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString()
  };
  rooms.push(newRoom);
  writeData(DataFiles.ROOMS, rooms);
  return newRoom;
}

export function updateRoom(roomId: string, data: Partial<Room>): Room | null {
  const rooms = getRooms();
  const index = rooms.findIndex(r => r.id === roomId);
  if (index === -1) return null;
  
  rooms[index] = { ...rooms[index], ...data };
  writeData(DataFiles.ROOMS, rooms);
  return rooms[index];
}

export function deleteRoom(roomId: string): boolean {
  const rooms = getRooms();
  const filtered = rooms.filter(r => r.id !== roomId);
  if (filtered.length === rooms.length) return false;
  writeData(DataFiles.ROOMS, filtered);
  return true;
}
