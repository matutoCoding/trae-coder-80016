import { Room, Booking, WaitlistEntry, PricingTier, TimeSlot, Bill, Notification } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';

const ROOMS_FILE = 'rooms.json';
const BOOKINGS_FILE = 'bookings.json';
const WAITLIST_FILE = 'waitlist.json';
const PRICING_TIERS_FILE = 'pricing-tiers.json';
const TIME_SLOTS_FILE = 'time-slots.json';
const BILLS_FILE = 'bills.json';
const NOTIFICATIONS_FILE = 'notifications.json';

export function initializeMockData(): void {
  const existingRooms = readData<Room[]>(ROOMS_FILE, []);
  if (existingRooms.length === 0) {
    const mockRooms: Room[] = [
      {
        id: generateId(),
        name: 'A101 - 标准琴房',
        type: 'standard',
        equipment: ['立式钢琴', '琴凳', '乐谱架'],
        capacity: 1,
        status: 'available',
        description: '基础练习琴房，配备雅马哈立式钢琴',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'A102 - 标准琴房',
        type: 'standard',
        equipment: ['立式钢琴', '琴凳', '乐谱架'],
        capacity: 1,
        status: 'available',
        description: '基础练习琴房，配备卡瓦依立式钢琴',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'B201 - 精品琴房',
        type: 'premium',
        equipment: ['三角钢琴', '琴凳', '乐谱架', '空调', '隔音棉'],
        capacity: 2,
        status: 'available',
        description: '高品质练习琴房，配备三角钢琴，专业隔音',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'B202 - 精品琴房',
        type: 'premium',
        equipment: ['三角钢琴', '琴凳', '乐谱架', '空调', '隔音棉'],
        capacity: 2,
        status: 'available',
        description: '高品质练习琴房，配备三角钢琴，专业隔音',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'C301 - 演奏厅',
        type: 'grand',
        equipment: ['三角演奏琴', '琴凳', '乐谱架', '专业音响', '空调', '观众席'],
        capacity: 10,
        status: 'available',
        description: '小型演奏厅，适合小型演出和大师课',
        createdAt: new Date().toISOString()
      }
    ];
    writeData(ROOMS_FILE, mockRooms);
  }

  const existingTiers = readData<PricingTier[]>(PRICING_TIERS_FILE, []);
  if (existingTiers.length === 0) {
    const mockTiers: PricingTier[] = [
      { id: generateId(), name: '早间优惠', rate: 40, color: '#4CAF50' },
      { id: generateId(), name: '平峰时段', rate: 60, color: '#2196F3' },
      { id: generateId(), name: '高峰时段', rate: 100, color: '#FF5722' },
      { id: generateId(), name: '夜间特惠', rate: 50, color: '#9C27B0' }
    ];
    writeData(PRICING_TIERS_FILE, mockTiers);
  }

  const existingSlots = readData<TimeSlot[]>(TIME_SLOTS_FILE, []);
  if (existingSlots.length === 0) {
    const tiers = readData<PricingTier[]>(PRICING_TIERS_FILE, []);
    const morningTier = tiers.find(t => t.name === '早间优惠')!;
    const offPeakTier = tiers.find(t => t.name === '平峰时段')!;
    const peakTier = tiers.find(t => t.name === '高峰时段')!;
    const nightTier = tiers.find(t => t.name === '夜间特惠')!;

    const mockSlots: TimeSlot[] = [];
    for (let day = 0; day < 7; day++) {
      const isWeekend = day === 0 || day === 6;
      
      if (isWeekend) {
        mockSlots.push({ id: generateId(), tierId: morningTier.id, startTime: '08:00', endTime: '10:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: peakTier.id, startTime: '10:00', endTime: '12:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: peakTier.id, startTime: '14:00', endTime: '18:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: offPeakTier.id, startTime: '18:00', endTime: '21:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: nightTier.id, startTime: '21:00', endTime: '22:00', dayOfWeek: day });
      } else {
        mockSlots.push({ id: generateId(), tierId: morningTier.id, startTime: '08:00', endTime: '10:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: offPeakTier.id, startTime: '10:00', endTime: '14:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: peakTier.id, startTime: '14:00', endTime: '20:00', dayOfWeek: day });
        mockSlots.push({ id: generateId(), tierId: nightTier.id, startTime: '20:00', endTime: '22:00', dayOfWeek: day });
      }
    }
    writeData(TIME_SLOTS_FILE, mockSlots);
  }

  readData<Booking[]>(BOOKINGS_FILE, []);
  readData<WaitlistEntry[]>(WAITLIST_FILE, []);
  readData<Bill[]>(BILLS_FILE, []);
  readData<Notification[]>(NOTIFICATIONS_FILE, []);
}

export const DataFiles = {
  ROOMS: ROOMS_FILE,
  BOOKINGS: BOOKINGS_FILE,
  WAITLIST: WAITLIST_FILE,
  PRICING_TIERS: PRICING_TIERS_FILE,
  TIME_SLOTS: TIME_SLOTS_FILE,
  BILLS: BILLS_FILE,
  NOTIFICATIONS: NOTIFICATIONS_FILE
};
