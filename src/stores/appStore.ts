import { create } from 'zustand';
import type {
  Room,
  Booking,
  WaitlistEntry,
  PricingTier,
  Bill,
  DashboardStats,
  Notification,
  RoomStatus
} from '../../shared/types';
import { api } from '../services/api';

interface AppState {
  rooms: Room[];
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  pricingTiers: PricingTier[];
  bills: Bill[];
  dashboardStats: DashboardStats | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  fetchRooms: () => Promise<void>;
  createRoom: (data: Partial<Room>) => Promise<Room | null>;
  updateRoom: (id: string, data: Partial<Room>) => Promise<Room | null>;
  deleteRoom: (id: string) => Promise<boolean>;
  
  fetchBookings: (date?: string) => Promise<void>;
  fetchWaitlist: (date?: string) => Promise<void>;
  fetchPricingTiers: () => Promise<void>;
  fetchBills: (params?: Record<string, unknown>) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  
  createBooking: (data: {
    roomId: string;
    customerName: string;
    customerPhone: string;
    startTime: string;
    endTime: string;
  }) => Promise<Booking | null>;
  
  cancelBooking: (id: string) => Promise<boolean>;
  checkIn: (id: string) => Promise<Booking | null>;
  checkOut: (id: string) => Promise<{ booking: Booking; bill: Bill } | null>;
  
  addToWaitlist: (data: {
    customerName: string;
    customerPhone: string;
    preferredStartTime: string;
    preferredEndTime: string;
    roomId?: string;
  }) => Promise<WaitlistEntry | null>;
  
  confirmWaitlist: (id: string) => Promise<Booking | null>;
  cancelWaitlist: (id: string) => Promise<boolean>;
  
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  rooms: [],
  bookings: [],
  waitlist: [],
  pricingTiers: [],
  bills: [],
  dashboardStats: null,
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  fetchRooms: async () => {
    set({ loading: true });
    try {
      const { rooms } = await api.rooms.getAll();
      set({ rooms, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  createRoom: async (data) => {
    try {
      const { room } = await api.rooms.create(data);
      const rooms = [...get().rooms, room];
      set({ rooms, error: null });
      return room;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  updateRoom: async (id, data) => {
    try {
      const { room } = await api.rooms.update(id, data);
      const rooms = get().rooms.map(r => r.id === id ? room : r);
      set({ rooms, error: null });
      return room;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  deleteRoom: async (id) => {
    try {
      await api.rooms.delete(id);
      const rooms = get().rooms.filter(r => r.id !== id);
      set({ rooms, error: null });
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
  
  fetchBookings: async (date?: string) => {
    set({ loading: true });
    try {
      const { bookings } = await api.bookings.getAll(date);
      set({ bookings, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchWaitlist: async (date?: string) => {
    set({ loading: true });
    try {
      const { entries } = await api.waitlist.getAll(date);
      set({ waitlist: entries, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchPricingTiers: async () => {
    set({ loading: true });
    try {
      const { tiers } = await api.pricing.getTiers();
      set({ pricingTiers: tiers, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchBills: async (params?: Record<string, unknown>) => {
    set({ loading: true });
    try {
      const { bills } = await api.bills.getAll(params as never);
      set({ bills, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchDashboardStats: async () => {
    try {
      const stats = await api.dashboard.getStats();
      set({ dashboardStats: stats, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  fetchNotifications: async () => {
    try {
      const { notifications } = await api.notifications.getAll();
      set({ notifications, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  fetchUnreadCount: async () => {
    try {
      const { count } = await api.notifications.getUnreadCount();
      set({ unreadCount: count, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  createBooking: async (data) => {
    try {
      const { booking } = await api.bookings.create(data);
      const currentBookings = get().bookings;
      set({ bookings: [...currentBookings, booking], error: null });
      return booking;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  cancelBooking: async (id) => {
    try {
      await api.bookings.cancel(id);
      const bookings = get().bookings.map(b =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      );
      set({ bookings, error: null });
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
  
  checkIn: async (id) => {
    try {
      const { booking } = await api.bookings.checkIn(id);
      const bookings = get().bookings.map(b =>
        b.id === id ? booking : b
      );
      set({ bookings, error: null });
      return booking;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  checkOut: async (id) => {
    try {
      const result = await api.bookings.checkOut(id);
      const bookings = get().bookings.map(b =>
        b.id === id ? result.booking : b
      );
      set({ bookings, error: null });
      return result;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  addToWaitlist: async (data) => {
    try {
      const { entry } = await api.waitlist.add(data);
      const waitlist = [...get().waitlist, entry];
      set({ waitlist, error: null });
      return entry;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  confirmWaitlist: async (id) => {
    try {
      const { booking } = await api.waitlist.confirm(id);
      const waitlist = get().waitlist.filter(e => e.id !== id);
      const bookings = [...get().bookings, booking];
      set({ waitlist, bookings, error: null });
      return booking;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },
  
  cancelWaitlist: async (id) => {
    try {
      await api.waitlist.cancel(id);
      const waitlist = get().waitlist.filter(e => e.id !== id);
      set({ waitlist, error: null });
      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },
  
  markNotificationRead: async (id) => {
    try {
      await api.notifications.markAsRead(id);
      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      set({ notifications, unreadCount: get().unreadCount - 1 });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  markAllNotificationsRead: async () => {
    try {
      await api.notifications.markAllAsRead();
      const notifications = get().notifications.map(n => ({ ...n, read: true }));
      set({ notifications, unreadCount: 0 });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  setError: (error) => set({ error })
}));
