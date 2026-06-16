import type {
  Room,
  Booking,
  WaitlistEntry,
  PricingTier,
  TimeSlot,
  Bill,
  DashboardStats,
  PricingCalculation,
  Notification
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }
  
  return response.json();
}

export const api = {
  rooms: {
    getAll: () => request<{ rooms: Room[] }>('/rooms'),
    getById: (id: string) => request<{ room: Room }>(`/rooms/${id}`),
    create: (data: Partial<Room>) => request<{ room: Room }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: Partial<Room>) => request<{ room: Room }>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<{ success: boolean }>(`/rooms/${id}`, {
      method: 'DELETE'
    })
  },
  
  bookings: {
    getAll: (date?: string) => {
      const params = date ? `?date=${date}` : '';
      return request<{ bookings: Booking[] }>(`/bookings${params}`);
    },
    getById: (id: string) => request<{ booking: Booking }>(`/bookings/${id}`),
    checkAvailability: (roomId: string, startTime: string, endTime: string) => 
      request<{ available: boolean }>('/bookings/check-availability', {
        method: 'POST',
        body: JSON.stringify({ roomId, startTime, endTime })
      }),
    create: (data: {
      roomId: string;
      customerName: string;
      customerPhone: string;
      startTime: string;
      endTime: string;
    }) => request<{ booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    checkIn: (id: string) => request<{ booking: Booking }>(`/bookings/${id}/checkin`, {
      method: 'POST'
    }),
    checkOut: (id: string) => request<{ booking: Booking; bill: Bill }>(`/bookings/${id}/checkout`, {
      method: 'POST'
    }),
    cancel: (id: string) => request<{ success: boolean; booking: Booking }>(`/bookings/${id}`, {
      method: 'DELETE'
    })
  },
  
  waitlist: {
    getAll: (date?: string) => {
      const params = date ? `?date=${date}` : '';
      return request<{ entries: WaitlistEntry[] }>(`/waitlist${params}`);
    },
    getById: (id: string) => request<{ entry: WaitlistEntry }>(`/waitlist/${id}`),
    add: (data: {
      customerName: string;
      customerPhone: string;
      preferredStartTime: string;
      preferredEndTime: string;
      roomId?: string;
    }) => request<{ entry: WaitlistEntry }>('/waitlist', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    notify: (id: string) => request<{ entry: WaitlistEntry }>(`/waitlist/${id}/notify`, {
      method: 'POST'
    }),
    confirm: (id: string) => request<{ booking: Booking }>(`/waitlist/${id}/confirm`, {
      method: 'POST'
    }),
    cancel: (id: string) => request<{ success: boolean; entry: WaitlistEntry }>(`/waitlist/${id}`, {
      method: 'DELETE'
    })
  },
  
  pricing: {
    getTiers: () => request<{ tiers: PricingTier[] }>('/pricing/tiers'),
    createTier: (data: { name: string; rate: number; color: string }) => 
      request<{ tier: PricingTier }>('/pricing/tiers', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateTier: (id: string, data: Partial<PricingTier>) => 
      request<{ tier: PricingTier }>(`/pricing/tiers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deleteTier: (id: string) => request<{ success: boolean }>(`/pricing/tiers/${id}`, {
      method: 'DELETE'
    }),
    getSlots: () => request<{ slots: TimeSlot[] }>('/pricing/slots'),
    getSchedule: (dayOfWeek: number) => 
      request<{ schedule: { tier: PricingTier; startTime: string; endTime: string }[] }>(`/pricing/schedule/${dayOfWeek}`),
    calculate: (startTime: string, endTime: string, roomType?: string) =>
      request<PricingCalculation>('/pricing/calculate', {
        method: 'POST',
        body: JSON.stringify({ startTime, endTime, roomType })
      })
  },
  
  bills: {
    getAll: (params?: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
      status?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
      if (params?.startDate) queryParams.set('startDate', params.startDate);
      if (params?.endDate) queryParams.set('endDate', params.endDate);
      if (params?.status) queryParams.set('status', params.status);
      
      const queryString = queryParams.toString();
      return request<{ bills: Bill[]; total: number; page: number; pageSize: number }>(
        `/bills${queryString ? `?${queryString}` : ''}`
      );
    },
    getById: (id: string) => request<{ bill: Bill }>(`/bills/${id}`),
    getStats: (period: 'day' | 'week' | 'month' = 'day') =>
      request<{ totalRevenue: number; totalHours: number; billCount: number; averageAmount: number }>(
        `/bills/stats?period=${period}`
      ),
    pay: (id: string) => request<{ bill: Bill }>(`/bills/${id}/pay`, {
      method: 'POST'
    })
  },
  
  dashboard: {
    getStats: () => request<DashboardStats>('/dashboard/stats')
  },
  
  notifications: {
    getAll: (unreadOnly?: boolean) => {
      const params = unreadOnly ? '?unread=true' : '';
      return request<{ notifications: Notification[] }>(`/notifications${params}`);
    },
    getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    markAsRead: (id: string) => request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
    markAllAsRead: () => request<{ success: boolean; count: number }>('/notifications/read-all', {
      method: 'PUT'
    })
  }
};
