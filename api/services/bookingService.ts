import { Booking, Room } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';
import { DataFiles } from '../data/mockData.js';
import { calculatePricing } from './pricingService.js';
import { getRoomById } from './roomService.js';

const GRACE_PERIOD_MINUTES = 15;

export function getBookings(date?: string): Booking[] {
  const bookings = readData<Booking[]>(DataFiles.BOOKINGS, []);
  
  if (date) {
    return bookings.filter(b => {
      const bookingDate = new Date(b.startTime).toISOString().split('T')[0];
      return bookingDate === date;
    });
  }
  
  return bookings;
}

export function getBookingById(bookingId: string): Booking | undefined {
  const bookings = getBookings();
  return bookings.find(b => b.id === bookingId);
}

export function getBookingsByRoom(roomId: string, date?: string): Booking[] {
  let bookings = getBookings(date);
  return bookings.filter(b => b.roomId === roomId && b.status !== 'cancelled' && b.status !== 'no_show');
}

export function isRoomAvailable(roomId: string, startTime: string, endTime: string, excludeBookingId?: string): boolean {
  const room = getRoomById(roomId);
  if (!room || room.status !== 'available') return false;
  
  const bookings = getBookingsByRoom(roomId);
  const newStart = new Date(startTime).getTime();
  const newEnd = new Date(endTime).getTime();
  
  return !bookings.some(b => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.status === 'cancelled' || b.status === 'no_show') return false;
    
    const bookingStart = new Date(b.startTime).getTime();
    const bookingEnd = new Date(b.endTime).getTime();
    
    return newStart < bookingEnd && newEnd > bookingStart;
  });
}

export function createBooking(data: {
  roomId: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
}): Booking | { error: string } {
  const room = getRoomById(data.roomId);
  if (!room) {
    return { error: '琴房不存在' };
  }
  
  if (!isRoomAvailable(data.roomId, data.startTime, data.endTime)) {
    return { error: '该时段琴房已被预约' };
  }
  
  const pricing = calculatePricing(data.startTime, data.endTime, room.type);
  
  const bookings = getBookings();
  const newBooking: Booking = {
    id: generateId(),
    ...data,
    status: 'booked',
    totalAmount: pricing.totalAmount,
    createdAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  writeData(DataFiles.BOOKINGS, bookings);
  
  return newBooking;
}

export function checkIn(bookingId: string): Booking | { error: string } {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) {
    return { error: '预约不存在' };
  }
  
  const booking = bookings[index];
  if (booking.status !== 'booked') {
    return { error: '预约状态不正确' };
  }
  
  booking.status = 'checked_in';
  booking.checkInTime = new Date().toISOString();
  
  writeData(DataFiles.BOOKINGS, bookings);
  return booking;
}

export function checkOut(bookingId: string): { booking: Booking; pricing: ReturnType<typeof calculatePricing> } | { error: string } {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) {
    return { error: '预约不存在' };
  }
  
  const booking = bookings[index];
  if (booking.status !== 'checked_in') {
    return { error: '未签到，无法签退' };
  }
  
  const room = getRoomById(booking.roomId);
  const checkOutTime = new Date().toISOString();
  const pricing = calculatePricing(booking.checkInTime!, checkOutTime, room?.type || 'standard');
  
  booking.status = 'completed';
  booking.checkOutTime = checkOutTime;
  booking.totalAmount = pricing.totalAmount;
  
  writeData(DataFiles.BOOKINGS, bookings);
  
  return { booking, pricing };
}

export function cancelBooking(bookingId: string): Booking | { error: string } {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) {
    return { error: '预约不存在' };
  }
  
  const booking = bookings[index];
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return { error: '无法取消该预约' };
  }
  
  booking.status = 'cancelled';
  writeData(DataFiles.BOOKINGS, bookings);
  return booking;
}

export function processNoShows(): Booking[] {
  const bookings = getBookings();
  const now = new Date();
  const noShows: Booking[] = [];
  
  for (const booking of bookings) {
    if (booking.status !== 'booked') continue;
    
    const startTime = new Date(booking.startTime);
    const gracePeriodEnd = new Date(startTime.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);
    
    if (now > gracePeriodEnd) {
      booking.status = 'no_show';
      noShows.push(booking);
    }
  }
  
  if (noShows.length > 0) {
    writeData(DataFiles.BOOKINGS, bookings);
  }
  
  return noShows;
}

export function getActiveBookingsCount(): number {
  const bookings = getBookings();
  const now = new Date();
  
  return bookings.filter(b => {
    if (b.status !== 'checked_in') return false;
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return now >= start && now <= end;
  }).length;
}
