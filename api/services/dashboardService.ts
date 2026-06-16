import { DashboardStats } from '../../shared/types.js';
import { getRooms } from './roomService.js';
import { getActiveBookingsCount, getBookings } from './bookingService.js';
import { getWaitlistCount } from './waitlistService.js';
import { getBillsStats } from './billingService.js';

export function getDashboardStats(): DashboardStats {
  const rooms = getRooms();
  const totalRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = getActiveBookingsCount();
  const utilizationRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  const todayStats = getBillsStats('day');
  const todayBookings = getTodayBookingsCount();
  const waitlistCount = getWaitlistCount();
  
  return {
    totalRooms,
    occupiedRooms,
    todayRevenue: todayStats.totalRevenue,
    todayBookings,
    waitlistCount,
    utilizationRate
  };
}

function getTodayBookingsCount(): number {
  const today = new Date().toISOString().split('T')[0];
  const bookings = getBookings(today);
  return bookings.filter(b => b.status !== 'cancelled' && b.status !== 'no_show').length;
}
