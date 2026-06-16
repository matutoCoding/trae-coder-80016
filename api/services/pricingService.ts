import { PricingTier, TimeSlot, PricingCalculation, PricingBreakdown } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';
import { DataFiles } from '../data/mockData.js';

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getPricingTiers(): PricingTier[] {
  return readData<PricingTier[]>(DataFiles.PRICING_TIERS, []);
}

export function getTimeSlots(): TimeSlot[] {
  return readData<TimeSlot[]>(DataFiles.TIME_SLOTS, []);
}

export function getTimeSlotsByDay(dayOfWeek: number): TimeSlot[] {
  const allSlots = getTimeSlots();
  return allSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
}

export function calculatePricing(
  startTimeStr: string,
  endTimeStr: string,
  roomType: string = 'standard'
): PricingCalculation {
  const tiers = getPricingTiers();
  const tierMap = new Map(tiers.map(t => [t.id, t]));
  
  const startDate = new Date(startTimeStr);
  const endDate = new Date(endTimeStr);
  
  if (endDate <= startDate) {
    return { totalAmount: 0, breakdown: [] };
  }

  const breakdownMap = new Map<string, { duration: number; amount: number }>();
  
  let currentDate = new Date(startDate);
  
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    const daySlots = getTimeSlotsByDay(dayOfWeek).sort((a, b) => 
      parseTime(a.startTime) - parseTime(b.startTime)
    );
    
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(24, 0, 0, 0);
    
    const segmentStart = currentDate > startDate ? currentDate : startDate;
    const segmentEnd = endDate < dayEnd ? endDate : dayEnd;
    
    for (const slot of daySlots) {
      const tier = tierMap.get(slot.tierId);
      if (!tier) continue;
      
      const slotStartMinutes = parseTime(slot.startTime);
      const slotEndMinutes = parseTime(slot.endTime);
      
      const slotStart = new Date(dayStart);
      slotStart.setMinutes(slotStartMinutes);
      
      const slotEnd = new Date(dayStart);
      slotEnd.setMinutes(slotEndMinutes);
      
      const overlapStart = segmentStart > slotStart ? segmentStart : slotStart;
      const overlapEnd = segmentEnd < slotEnd ? segmentEnd : slotEnd;
      
      if (overlapStart < overlapEnd) {
        const durationMs = overlapEnd.getTime() - overlapStart.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        const amount = (durationMinutes / 60) * tier.rate;
        
        if (breakdownMap.has(tier.id)) {
          const existing = breakdownMap.get(tier.id)!;
          existing.duration += durationMinutes;
          existing.amount += amount;
        } else {
          breakdownMap.set(tier.id, { duration: durationMinutes, amount });
        }
      }
    }
    
    currentDate = dayEnd;
  }
  
  let totalAmount = 0;
  const breakdown: PricingBreakdown[] = [];
  
  for (const [tierId, data] of breakdownMap) {
    const tier = tierMap.get(tierId);
    if (tier && data.duration > 0) {
      breakdown.push({
        tier: tierId,
        tierName: tier.name,
        duration: Math.round(data.duration * 100) / 100,
        amount: Math.round(data.amount * 100) / 100,
        color: tier.color
      });
      totalAmount += data.amount;
    }
  }
  
  const typeMultiplier = roomType === 'premium' ? 1.5 : roomType === 'grand' ? 2.5 : 1;
  
  return {
    totalAmount: Math.round(totalAmount * typeMultiplier * 100) / 100,
    breakdown: breakdown.map(b => ({
      ...b,
      amount: Math.round(b.amount * typeMultiplier * 100) / 100
    })).sort((a, b) => a.duration - b.duration)
  };
}

export function updatePricingTier(tierId: string, data: Partial<PricingTier>): PricingTier | null {
  const tiers = getPricingTiers();
  const index = tiers.findIndex(t => t.id === tierId);
  if (index === -1) return null;
  
  tiers[index] = { ...tiers[index], ...data };
  writeData(DataFiles.PRICING_TIERS, tiers);
  return tiers[index];
}

export function createPricingTier(data: Omit<PricingTier, 'id'>): PricingTier {
  const tiers = getPricingTiers();
  const newTier: PricingTier = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    ...data
  };
  tiers.push(newTier);
  writeData(DataFiles.PRICING_TIERS, tiers);
  return newTier;
}

export function deletePricingTier(tierId: string): boolean {
  const tiers = getPricingTiers();
  const filtered = tiers.filter(t => t.id !== tierId);
  if (filtered.length === tiers.length) return false;
  writeData(DataFiles.PRICING_TIERS, filtered);
  return true;
}

export function updateTimeSlot(slotId: string, data: Partial<TimeSlot>): TimeSlot | null {
  const slots = getTimeSlots();
  const index = slots.findIndex(s => s.id === slotId);
  if (index === -1) return null;
  
  slots[index] = { ...slots[index], ...data };
  writeData(DataFiles.TIME_SLOTS, slots);
  return slots[index];
}

export function createTimeSlot(data: Omit<TimeSlot, 'id'>): TimeSlot {
  const slots = getTimeSlots();
  const newSlot: TimeSlot = {
    id: generateId(),
    ...data
  };
  slots.push(newSlot);
  writeData(DataFiles.TIME_SLOTS, slots);
  return newSlot;
}

export function deleteTimeSlot(slotId: string): boolean {
  const slots = getTimeSlots();
  const filtered = slots.filter(s => s.id !== slotId);
  if (filtered.length === slots.length) return false;
  writeData(DataFiles.TIME_SLOTS, filtered);
  return true;
}

export function updateTimeSlotsForDay(dayOfWeek: number, newSlots: { tierId: string; startTime: string; endTime: string }[]): { tier: PricingTier; startTime: string; endTime: string }[] {
  const slots = getTimeSlots();
  const filtered = slots.filter(s => s.dayOfWeek !== dayOfWeek);
  
  for (const ns of newSlots) {
    filtered.push({
      id: generateId(),
      tierId: ns.tierId,
      startTime: ns.startTime,
      endTime: ns.endTime,
      dayOfWeek
    });
  }
  
  writeData(DataFiles.TIME_SLOTS, filtered);
  return getPricingScheduleByDay(dayOfWeek);
}

export function getPricingScheduleByDay(dayOfWeek: number): { tier: PricingTier; startTime: string; endTime: string }[] {
  const slots = getTimeSlotsByDay(dayOfWeek);
  const tiers = getPricingTiers();
  const tierMap = new Map(tiers.map(t => [t.id, t]));
  
  return slots
    .map(slot => ({
      tier: tierMap.get(slot.tierId)!,
      startTime: slot.startTime,
      endTime: slot.endTime
    }))
    .filter(item => item.tier)
    .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
}
