import { WaitlistEntry, Booking } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';
import { DataFiles } from '../data/mockData.js';
import { isRoomAvailable, createBooking } from './bookingService.js';
import { getRooms } from './roomService.js';
import { addNotification } from './notificationService.js';

const NOTIFICATION_TIMEOUT_MINUTES = 5;

export function getWaitlist(date?: string): WaitlistEntry[] {
  let entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  
  entries = entries.filter(e => e.status !== 'cancelled' && e.status !== 'confirmed');
  
  if (date) {
    entries = entries.filter(e => {
      const entryDate = new Date(e.preferredStartTime).toISOString().split('T')[0];
      return entryDate === date;
    });
  }
  
  return entries.sort((a, b) => a.position - b.position);
}

export function getWaitlistById(entryId: string): WaitlistEntry | undefined {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  return entries.find(e => e.id === entryId);
}

export function addToWaitlist(data: {
  customerName: string;
  customerPhone: string;
  preferredStartTime: string;
  preferredEndTime: string;
  roomId?: string;
}): WaitlistEntry {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  const activeEntries = entries.filter(e => e.status !== 'cancelled' && e.status !== 'confirmed');
  
  const newEntry: WaitlistEntry = {
    id: generateId(),
    ...data,
    position: activeEntries.length + 1,
    status: 'waiting',
    createdAt: new Date().toISOString()
  };
  
  entries.push(newEntry);
  writeData(DataFiles.WAITLIST, entries);
  
  return newEntry;
}

export function notifyWaitlistEntry(entryId: string): WaitlistEntry | { error: string } {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  const index = entries.findIndex(e => e.id === entryId);
  
  if (index === -1) {
    return { error: '候补记录不存在' };
  }
  
  const entry = entries[index];
  if (entry.status !== 'waiting') {
    return { error: '状态不允许通知' };
  }
  
  entry.status = 'notified';
  entry.notifiedAt = new Date().toISOString();
  
  writeData(DataFiles.WAITLIST, entries);
  
  addNotification({
    type: 'waitlist',
    title: '补位通知已发送',
    message: `已向 ${entry.customerName} 发送补位通知，请等待确认`
  });
  
  return entry;
}

export function confirmWaitlistEntry(entryId: string): Booking | { error: string } {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  const index = entries.findIndex(e => e.id === entryId);
  
  if (index === -1) {
    return { error: '候补记录不存在' };
  }
  
  const entry = entries[index];
  
  let targetRoomId = entry.roomId;
  if (!targetRoomId) {
    const rooms = getRooms().filter(r => r.status === 'available');
    for (const room of rooms) {
      if (isRoomAvailable(room.id, entry.preferredStartTime, entry.preferredEndTime)) {
        targetRoomId = room.id;
        break;
      }
    }
  }
  
  if (!targetRoomId) {
    return { error: '没有可用的琴房' };
  }
  
  if (!isRoomAvailable(targetRoomId, entry.preferredStartTime, entry.preferredEndTime)) {
    return { error: '指定琴房该时段不可用' };
  }
  
  const bookingResult = createBooking({
    roomId: targetRoomId,
    customerName: entry.customerName,
    customerPhone: entry.customerPhone,
    startTime: entry.preferredStartTime,
    endTime: entry.preferredEndTime
  });
  
  if ('error' in bookingResult) {
    return { error: bookingResult.error };
  }
  
  entry.status = 'confirmed';
  writeData(DataFiles.WAITLIST, entries);
  
  reorderWaitlist();
  
  addNotification({
    type: 'waitlist',
    title: '候补补位成功',
    message: `${entry.customerName} 已确认补位，预约已生成`
  });
  
  return bookingResult;
}

export function cancelWaitlistEntry(entryId: string): WaitlistEntry | { error: string } {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  const index = entries.findIndex(e => e.id === entryId);
  
  if (index === -1) {
    return { error: '候补记录不存在' };
  }
  
  entries[index].status = 'cancelled';
  writeData(DataFiles.WAITLIST, entries);
  
  reorderWaitlist();
  
  return entries[index];
}

function reorderWaitlist(): void {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  const activeEntries = entries
    .filter(e => e.status === 'waiting' || e.status === 'notified')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  activeEntries.forEach((entry, index) => {
    entry.position = index + 1;
  });
  
  writeData(DataFiles.WAITLIST, entries);
}

export function processWaitlistForRoom(roomId: string, startTime: string, endTime: string): WaitlistEntry | null {
  const waitlist = getWaitlist();
  
  for (const entry of waitlist) {
    if (entry.status !== 'waiting') continue;
    
    if (entry.roomId && entry.roomId !== roomId) continue;
    
    const entryStart = new Date(entry.preferredStartTime).getTime();
    const entryEnd = new Date(entry.preferredEndTime).getTime();
    const slotStart = new Date(startTime).getTime();
    const slotEnd = new Date(endTime).getTime();
    
    const overlap = entryStart < slotEnd && entryEnd > slotStart;
    
    if (overlap && isRoomAvailable(roomId, entry.preferredStartTime, entry.preferredEndTime)) {
      notifyWaitlistEntry(entry.id);
      return entry;
    }
  }
  
  return null;
}

export function processExpiredNotifications(): void {
  const entries = readData<WaitlistEntry[]>(DataFiles.WAITLIST, []);
  const now = new Date();
  
  for (const entry of entries) {
    if (entry.status !== 'notified' || !entry.notifiedAt) continue;
    
    const notifiedAt = new Date(entry.notifiedAt);
    const timeoutAt = new Date(notifiedAt.getTime() + NOTIFICATION_TIMEOUT_MINUTES * 60 * 1000);
    
    if (now > timeoutAt) {
      entry.status = 'waiting';
      entry.notifiedAt = undefined;
    }
  }
  
  writeData(DataFiles.WAITLIST, entries);
}

export function getWaitlistCount(): number {
  return getWaitlist().filter(e => e.status === 'waiting').length;
}
