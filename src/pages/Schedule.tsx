import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Schedule() {
  const { rooms, bookings, fetchRooms, fetchBookings, createBooking } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ roomId: string; startTime: string; endTime: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    duration: 60
  });
  
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);
  
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetchBookings(dateStr);
  }, [selectedDate, fetchBookings]);
  
  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };
  
  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };
  
  const getBookingsForRoomAndHour = (roomId: string, hour: number) => {
    return bookings.filter(b => {
      if (b.roomId !== roomId) return false;
      if (b.status === 'cancelled' || b.status === 'no_show') return false;
      
      const startHour = parseInt(b.startTime.slice(11, 13));
      const endHour = parseInt(b.endTime.slice(11, 13));
      const endMin = parseInt(b.endTime.slice(14, 16));
      const adjustedEndHour = endMin > 0 ? endHour + 1 : endHour;
      
      return hour >= startHour && hour < adjustedEndHour;
    });
  };
  
  const handleSlotClick = (roomId: string, hour: number) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    setSelectedSlot({
      roomId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    setShowBookingModal(true);
  };
  
  const handleBookingSubmit = async () => {
    if (!selectedSlot || !bookingForm.customerName || !bookingForm.customerPhone) return;
    
    const endTime = new Date(selectedSlot.startTime);
    endTime.setMinutes(endTime.getMinutes() + bookingForm.duration);
    
    await createBooking({
      roomId: selectedSlot.roomId,
      customerName: bookingForm.customerName,
      customerPhone: bookingForm.customerPhone,
      startTime: selectedSlot.startTime,
      endTime: endTime.toISOString()
    });
    
    setShowBookingModal(false);
    setBookingForm({ customerName: '', customerPhone: '', duration: 60 });
    setSelectedSlot(null);
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetchBookings(dateStr);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'bg-success-500';
      case 'booked': return 'bg-blue-500';
      case 'completed': return 'bg-walnut-400';
      default: return 'bg-walnut-300';
    }
  };
  
  const availableRooms = rooms.filter(r => r.status === 'available');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={goToPrevDay} icon={ChevronLeft} size="sm" />
          <div className="text-center">
            <h3 className="font-display text-xl font-bold text-walnut-800">
              {selectedDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <p className="text-sm text-walnut-500">
              {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
            </p>
          </div>
          <Button variant="secondary" onClick={goToNextDay} icon={ChevronRight} size="sm" />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            今日
          </Button>
          <Button icon={Plus} variant="gold" size="sm">
            新建预约
          </Button>
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="flex border-b border-walnut-100">
              <div className="w-20 flex-shrink-0 p-4 text-center text-sm text-walnut-500 font-medium bg-walnut-50">
                时间
              </div>
              {availableRooms.map(room => (
                <div
                  key={room.id}
                  className="flex-1 min-w-[160px] p-4 text-center border-l border-walnut-100"
                >
                  <div className="font-medium text-walnut-800">{room.name}</div>
                  <div className="text-xs text-walnut-500 mt-1">
                    {room.type === 'standard' ? '标准' : room.type === 'premium' ? '精品' : '演奏厅'}
                  </div>
                </div>
              ))}
            </div>
            
            {hours.map(hour => (
              <div key={hour} className="flex border-b border-walnut-50">
                <div className="w-20 flex-shrink-0 p-2 text-center text-sm text-walnut-500 bg-walnut-50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {availableRooms.map(room => {
                  const hourBookings = getBookingsForRoomAndHour(room.id, hour);
                  const hasBooking = hourBookings.length > 0;
                  
                  return (
                    <div
                      key={room.id}
                      className={`flex-1 min-w-[160px] h-16 border-l border-walnut-50 p-1 cursor-pointer transition-colors ${
                        hasBooking ? '' : 'hover:bg-gold-50'
                      }`}
                      onClick={() => !hasBooking && handleSlotClick(room.id, hour)}
                    >
                      {hourBookings.length > 0 ? (
                        <div
                          className={`h-full rounded-lg p-2 text-white text-xs ${getStatusColor(hourBookings[0].status)}`}
                        >
                          <div className="font-medium truncate">{hourBookings[0].customerName}</div>
                          <div className="opacity-80 truncate">
                            {hourBookings[0].startTime.slice(11, 16)}-
                            {hourBookings[0].endTime.slice(11, 16)}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full rounded-lg border border-dashed border-walnut-200 flex items-center justify-center text-walnut-300 hover:border-gold-400 hover:text-gold-400 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-walnut-600">已预约</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success-500" />
          <span className="text-walnut-600">进行中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-walnut-400" />
          <span className="text-walnut-600">已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-dashed border-walnut-300" />
          <span className="text-walnut-600">可预约</span>
        </div>
      </div>
      
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="新建预约"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleBookingSubmit}>
              确认预约
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-walnut-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-walnut-600">
              <Clock className="w-4 h-4" />
              <span>
                {selectedSlot?.startTime 
                  ? new Date(selectedSlot.startTime).toLocaleString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : ''}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              客户姓名
            </label>
            <input
              type="text"
              value={bookingForm.customerName}
              onChange={e => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
              className="input-field"
              placeholder="请输入客户姓名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              联系电话
            </label>
            <input
              type="tel"
              value={bookingForm.customerPhone}
              onChange={e => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
              className="input-field"
              placeholder="请输入联系电话"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              时长（分钟）
            </label>
            <select
              value={bookingForm.duration}
              onChange={e => setBookingForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
              className="input-field"
            >
              <option value={30}>30 分钟</option>
              <option value={60}>1 小时</option>
              <option value={90}>1.5 小时</option>
              <option value={120}>2 小时</option>
              <option value={180}>3 小时</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
