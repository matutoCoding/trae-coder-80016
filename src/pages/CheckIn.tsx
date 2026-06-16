import { useState, useEffect } from 'react';
import { Play, Square, Clock, User, Phone, Music2, Search, CheckCircle } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import Button from '../components/Button';
import Modal from '../components/Modal';
import type { Booking, Bill } from '../../shared/types';
import { api } from '../services/api';

export default function CheckIn() {
  const { bookings, rooms, fetchBookings, fetchRooms, checkIn, checkOut } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [lastBill, setLastBill] = useState<Bill | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchBookings(today);
    fetchRooms();
  }, [fetchBookings, fetchRooms]);
  
  const filteredBookings = bookings.filter(b => {
    if (b.status === 'cancelled' || b.status === 'no_show') return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (!b.startTime.startsWith(today)) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(query) ||
        b.customerPhone.includes(query)
      );
    }
    
    return true;
  });
  
  const bookedBookings = filteredBookings.filter(b => b.status === 'booked');
  const activeBookings = filteredBookings.filter(b => b.status === 'checked_in');
  
  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCheckInModal(true);
  };
  
  const handleCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCheckOutModal(true);
  };
  
  const confirmCheckIn = async () => {
    if (!selectedBooking) return;
    await checkIn(selectedBooking.id);
    setShowCheckInModal(false);
    setSelectedBooking(null);
    const today = new Date().toISOString().split('T')[0];
    fetchBookings(today);
  };
  
  const confirmCheckOut = async () => {
    if (!selectedBooking) return;
    const result = await checkOut(selectedBooking.id);
    if (result) {
      setLastBill(result.bill);
    }
    setShowCheckOutModal(false);
    setSelectedBooking(null);
    const today = new Date().toISOString().split('T')[0];
    fetchBookings(today);
  };
  
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || '未知琴房';
  };
  
  const formatDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = currentTime.getTime();
    const diff = now - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-walnut-500 text-sm mb-2">当前时间</div>
          <div className="font-display text-4xl font-bold text-walnut-800 font-mono">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
          <div className="text-walnut-500 text-sm mt-2">
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-walnut-500 text-sm mb-2">进行中</div>
          <div className="font-display text-4xl font-bold text-success-600">
            {activeBookings.length}
          </div>
          <div className="text-walnut-500 text-sm mt-2">间琴房使用中</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-walnut-500 text-sm mb-2">待签到</div>
          <div className="font-display text-4xl font-bold text-gold-600">
            {bookedBookings.length}
          </div>
          <div className="text-walnut-500 text-sm mt-2">个预约待签到</div>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索客户姓名或电话..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-walnut-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-walnut-100 bg-gold-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-walnut-800">待签到预约</h3>
                <p className="text-sm text-walnut-500">{bookedBookings.length} 个预约等待签到</p>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {bookedBookings.length === 0 ? (
              <div className="p-12 text-center text-walnut-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无待签到预约</p>
              </div>
            ) : (
              <div className="divide-y divide-walnut-50">
                {bookedBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-walnut-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-walnut-100 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-walnut-500" />
                        </div>
                        <div>
                          <div className="font-medium text-walnut-800">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-walnut-500 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            {booking.customerPhone}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-walnut-600">
                          {booking.startTime.slice(11, 16)} - {booking.endTime.slice(11, 16)}
                        </div>
                        <div className="text-xs text-walnut-400 mt-1">
                          {getRoomName(booking.roomId)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="gold"
                        icon={Play}
                        onClick={() => handleCheckIn(booking)}
                      >
                        签到
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-walnut-100 bg-success-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                <Music2 className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-walnut-800">进行中</h3>
                <p className="text-sm text-walnut-500">{activeBookings.length} 间琴房使用中</p>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {activeBookings.length === 0 ? (
              <div className="p-12 text-center text-walnut-400">
                <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无进行中的练琴</p>
              </div>
            ) : (
              <div className="divide-y divide-walnut-50">
                {activeBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-walnut-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                          <div className="relative">
                            <User className="w-6 h-6 text-success-600" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full animate-pulse-soft" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-walnut-800">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-walnut-500">
                            {getRoomName(booking.roomId)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold text-success-600">
                          {formatDuration(booking.checkInTime || booking.startTime)}
                        </div>
                        <div className="text-xs text-walnut-400 mt-1">
                          已练琴时长
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Square}
                        onClick={() => handleCheckOut(booking)}
                      >
                        结束
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="确认签到"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCheckInModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={confirmCheckIn}>
              确认签到
            </Button>
          </>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="p-4 bg-gold-50 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-gold-500 mx-auto mb-2" />
              <div className="text-walnut-800 font-medium">
                {selectedBooking.customerName}
              </div>
              <div className="text-sm text-walnut-500 mt-1">
                {getRoomName(selectedBooking.roomId)}
              </div>
            </div>
            
            <div className="text-center text-sm text-walnut-500">
              <p>预约时间：{selectedBooking.startTime.slice(11, 16)} - {selectedBooking.endTime.slice(11, 16)}</p>
              <p className="mt-1">签到后开始计时计费</p>
            </div>
          </div>
        )}
      </Modal>
      
      <Modal
        isOpen={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        title="结束练琴"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCheckOutModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmCheckOut}>
              确认结束
            </Button>
          </>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="p-4 bg-danger-50 rounded-xl text-center">
              <div className="text-walnut-800 font-medium">
                {selectedBooking.customerName}
              </div>
              <div className="text-sm text-walnut-500 mt-1">
                {getRoomName(selectedBooking.roomId)}
              </div>
              <div className="font-mono text-2xl font-bold text-danger-600 mt-3">
                {formatDuration(selectedBooking.checkInTime || selectedBooking.startTime)}
              </div>
              <div className="text-xs text-walnut-400 mt-1">已练琴时长</div>
            </div>
            
            <p className="text-center text-sm text-walnut-500">
              结束后将生成账单，按实际使用时长计费
            </p>
          </div>
        )}
      </Modal>
      
      {lastBill && (
        <Modal
          isOpen={!!lastBill}
          onClose={() => setLastBill(null)}
          title="练琴结束"
          size="sm"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            
            <div>
              <div className="text-walnut-500 text-sm">本次费用</div>
              <div className="font-display text-4xl font-bold text-walnut-800 mt-1">
                ¥{lastBill.totalAmount.toFixed(2)}
              </div>
            </div>
            
            <div className="text-sm text-walnut-500">
              <p>客户：{lastBill.customerName}</p>
              <p>琴房：{lastBill.roomName}</p>
              <p>时长：{Math.round(lastBill.actualDuration)} 分钟</p>
            </div>
            
            <Button
              variant="gold"
              className="w-full"
              onClick={() => setLastBill(null)}
            >
              完成
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
