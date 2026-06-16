export type RoomType = 'standard' | 'premium' | 'grand';
export type RoomStatus = 'available' | 'maintenance' | 'disabled';
export type BookingStatus = 'booked' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
export type WaitlistStatus = 'waiting' | 'notified' | 'confirmed' | 'cancelled' | 'timed_out';
export type BillStatus = 'unpaid' | 'paid' | 'refunded';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  equipment: string[];
  capacity: number;
  status: RoomStatus;
  description?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  checkInTime?: string;
  checkOutTime?: string;
  totalAmount: number;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  roomId?: string;
  customerName: string;
  customerPhone: string;
  preferredStartTime: string;
  preferredEndTime: string;
  position: number;
  status: WaitlistStatus;
  notifiedAt?: string;
  createdAt: string;
}

export interface PricingTier {
  id: string;
  name: string;
  rate: number;
  color: string;
}

export interface TimeSlot {
  id: string;
  tierId: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface PricingBreakdown {
  tier: string;
  tierName: string;
  duration: number;
  amount: number;
  color: string;
}

export interface PricingCalculation {
  totalAmount: number;
  breakdown: PricingBreakdown[];
}

export interface Bill {
  id: string;
  bookingId: string;
  customerName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  actualDuration: number;
  totalAmount: number;
  breakdown: PricingBreakdown[];
  status: BillStatus;
  paidAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  todayRevenue: number;
  todayBookings: number;
  waitlistCount: number;
  utilizationRate: number;
}

export interface Notification {
  id: string;
  type: 'waitlist' | 'booking' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
