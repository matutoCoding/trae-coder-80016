import { Bill, PricingBreakdown } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';
import { DataFiles } from '../data/mockData.js';

export function getBills(params?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}): { bills: Bill[]; total: number; page: number; pageSize: number } {
  let bills = readData<Bill[]>(DataFiles.BILLS, []);
  
  if (params?.startDate) {
    bills = bills.filter(b => new Date(b.createdAt) >= new Date(params.startDate!));
  }
  
  if (params?.endDate) {
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    bills = bills.filter(b => new Date(b.createdAt) <= end);
  }
  
  if (params?.status) {
    bills = bills.filter(b => b.status === params.status);
  }
  
  bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const total = bills.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    bills: bills.slice(start, end),
    total,
    page,
    pageSize
  };
}

export function getBillById(billId: string): Bill | undefined {
  const bills = readData<Bill[]>(DataFiles.BILLS, []);
  return bills.find(b => b.id === billId);
}

export function createBill(data: {
  bookingId: string;
  customerName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  actualDuration: number;
  totalAmount: number;
  breakdown: PricingBreakdown[];
}): Bill {
  const bills = readData<Bill[]>(DataFiles.BILLS, []);
  
  const newBill: Bill = {
    id: generateId(),
    ...data,
    status: 'unpaid',
    createdAt: new Date().toISOString()
  };
  
  bills.push(newBill);
  writeData(DataFiles.BILLS, bills);
  
  return newBill;
}

export function payBill(billId: string): Bill | { error: string } {
  const bills = readData<Bill[]>(DataFiles.BILLS, []);
  const index = bills.findIndex(b => b.id === billId);
  
  if (index === -1) {
    return { error: '账单不存在' };
  }
  
  if (bills[index].status !== 'unpaid') {
    return { error: '账单状态不正确' };
  }
  
  bills[index].status = 'paid';
  bills[index].paidAt = new Date().toISOString();
  
  writeData(DataFiles.BILLS, bills);
  return bills[index];
}

export function getBillsStats(period: 'day' | 'week' | 'month' = 'day'): {
  totalRevenue: number;
  totalHours: number;
  billCount: number;
  averageAmount: number;
} {
  const bills = readData<Bill[]>(DataFiles.BILLS, []);
  const now = new Date();
  
  let startDate: Date;
  switch (period) {
    case 'day':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate = new Date(0);
  }
  
  const filteredBills = bills.filter(b => 
    new Date(b.createdAt) >= startDate && b.status === 'paid'
  );
  
  const totalRevenue = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalHours = filteredBills.reduce((sum, b) => sum + b.actualDuration, 0) / 60;
  
  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    billCount: filteredBills.length,
    averageAmount: filteredBills.length > 0 
      ? Math.round((totalRevenue / filteredBills.length) * 100) / 100 
      : 0
  };
}
