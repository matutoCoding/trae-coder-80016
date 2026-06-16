import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, User, Phone, Calendar, Bell, Check, X, ChevronRight, AlertCircle } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { api } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import type { WaitlistEntry } from '../../shared/types';

export default function Waitlist() {
  const {
    rooms,
    fetchRooms,
  } = useAppStore();
  
  const [waitlistAll, setWaitlistAll] = useState<WaitlistEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    preferredStartTime: '',
    preferredEndTime: '',
    roomId: ''
  });
  
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  
  const loadWaitlist = useCallback(async () => {
    try {
      const result = await api.waitlist.getAll(selectedDate);
      setWaitlistAll(result.entries);
    } catch (err) {
      console.error('加载候补列表失败', err);
    }
  }, [selectedDate]);
  
  useEffect(() => {
    loadWaitlist();
    fetchRooms();
  }, [loadWaitlist, fetchRooms]);
  
  useEffect(() => {
    const timer = setInterval(loadWaitlist, 10000);
    return () => clearInterval(timer);
  }, [loadWaitlist]);
  
  const handleAdd = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      preferredStartTime: `${selectedDate}T10:00:00`,
      preferredEndTime: `${selectedDate}T11:00:00`,
      roomId: ''
    });
    setShowAddModal(true);
  };
  
  const handleSubmit = async () => {
    if (!formData.customerName || !formData.customerPhone || 
        !formData.preferredStartTime || !formData.preferredEndTime) return;
    
    await api.waitlist.add({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      preferredStartTime: formData.preferredStartTime,
      preferredEndTime: formData.preferredEndTime,
      roomId: formData.roomId || undefined
    });
    
    setShowAddModal(false);
    loadWaitlist();
  };
  
  const handleConfirm = async (id: string) => {
    setConfirmingId(id);
    try {
      await api.waitlist.confirm(id);
      loadWaitlist();
    } catch (err) {
      console.error('确认补位失败', err);
      alert('确认补位失败，可能琴房已不可用');
    } finally {
      setConfirmingId(null);
    }
  };
  
  const handleCancel = async (id: string) => {
    if (confirm('确定要取消这位用户的候补吗？')) {
      await api.waitlist.cancel(id);
      loadWaitlist();
    }
  };
  
  const getNotifiedRemaining = (notifiedAt: string) => {
    const notified = new Date(notifiedAt).getTime();
    const deadline = notified + 5 * 60 * 1000;
    const remaining = Math.max(0, deadline - Date.now());
    return Math.ceil(remaining / 1000);
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return '等待中';
      case 'notified': return '已通知';
      case 'confirmed': return '已补位';
      case 'cancelled': return '已取消';
      case 'timed_out': return '已超时';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'status-waiting';
      case 'notified': return 'status-booked';
      case 'confirmed': return 'status-available';
      case 'cancelled': return 'bg-walnut-100 text-walnut-400';
      case 'timed_out': return 'bg-danger-50 text-danger-500';
      default: return '';
    }
  };
  
  const activeList = waitlistAll.filter(e => e.status === 'waiting' || e.status === 'notified');
  const historyList = waitlistAll.filter(e => e.status === 'confirmed' || e.status === 'cancelled' || e.status === 'timed_out');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-walnut-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field w-40"
            />
          </div>
          <span className="text-walnut-500 text-sm">
            共 {activeList.length} 人排队
            {waitlistAll.filter(e => e.status === 'notified').length > 0 && (
              <span className="ml-2 text-gold-600">
                · {waitlistAll.filter(e => e.status === 'notified').length} 人待确认
              </span>
            )}
          </span>
        </div>
        <Button icon={Plus} variant="gold" onClick={handleAdd}>
          添加候补
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-walnut-800">排队队列</h3>
              <p className="text-sm text-walnut-500">按加入时间排序</p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activeList.length === 0 ? (
              <div className="text-center py-12 text-walnut-400">
                <Clock className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>暂无候补用户</p>
                <p className="text-sm mt-1">点击右上角添加候补</p>
              </div>
            ) : (
              activeList.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors group ${
                    entry.status === 'notified'
                      ? 'bg-gold-50 ring-2 ring-gold-300'
                      : 'bg-walnut-50 hover:bg-walnut-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-gold-400 text-walnut-900' :
                    index === 1 ? 'bg-walnut-300 text-walnut-700' :
                    index === 2 ? 'bg-walnut-200 text-walnut-600' :
                    'bg-walnut-100 text-walnut-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-walnut-800">
                        {entry.customerName}
                      </span>
                      <span className={`status-badge ${getStatusColor(entry.status)}`}>
                        {getStatusLabel(entry.status)}
                      </span>
                    </div>
                    <div className="text-sm text-walnut-500 mt-1">
                      {new Date(entry.preferredStartTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(entry.preferredEndTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      {entry.roomId && (
                        <span className="ml-2 text-walnut-400">
                          · 指定琴房
                        </span>
                      )}
                    </div>
                    {entry.status === 'notified' && entry.notifiedAt && (
                      <div className="text-xs text-gold-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        请在 {getNotifiedRemaining(entry.notifiedAt)} 秒内确认
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {entry.status === 'notified' && (
                      <button
                        onClick={() => handleConfirm(entry.id)}
                        disabled={confirmingId === entry.id}
                        className="p-2 bg-success-100 text-success-600 rounded-lg hover:bg-success-200 disabled:opacity-50"
                        title="确认补位"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {(entry.status === 'waiting' || entry.status === 'notified') && (
                      <button
                        onClick={() => handleCancel(entry.id)}
                        className="p-2 bg-danger-100 text-danger-600 rounded-lg hover:bg-danger-200"
                        title="取消候补"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {historyList.length > 0 && (
            <div className="mt-6 pt-4 border-t border-walnut-100">
              <h4 className="text-sm font-medium text-walnut-500 mb-3">历史记录</h4>
              <div className="space-y-2">
                {historyList.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-walnut-50/50 opacity-70"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-walnut-600">{entry.customerName}</span>
                        <span className={`status-badge text-xs ${getStatusColor(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                      </div>
                      <div className="text-xs text-walnut-400 mt-0.5">
                        {new Date(entry.preferredStartTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(entry.preferredEndTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-walnut-800">补位规则</h3>
              </div>
            </div>
            
            <ul className="space-y-3 text-sm text-walnut-600">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span>候补按加入时间先后顺序排列，先到先得</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span>当有琴房释放时，自动通知排队首位的用户</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span>收到通知后需在 5 分钟内确认，否则自动顺延下一位</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span>支持指定琴房候补和通用候补两种模式</span>
              </li>
            </ul>
          </div>
          
          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-walnut-800 mb-4">
              候补统计
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-walnut-50 rounded-xl">
                <div className="font-display text-2xl font-bold text-walnut-800">
                  {waitlistAll.filter(e => e.status === 'waiting').length}
                </div>
                <div className="text-sm text-walnut-500 mt-1">等待中</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="font-display text-2xl font-bold text-blue-600">
                  {waitlistAll.filter(e => e.status === 'notified').length}
                </div>
                <div className="text-sm text-walnut-500 mt-1">已通知</div>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-xl">
                <div className="font-display text-2xl font-bold text-success-600">
                  {waitlistAll.filter(e => e.status === 'confirmed').length}
                </div>
                <div className="text-sm text-walnut-500 mt-1">已补位</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加候补"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              加入候补
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              客户姓名
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
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
              value={formData.customerPhone}
              onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              className="input-field"
              placeholder="请输入联系电话"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                期望开始时间
              </label>
              <input
                type="datetime-local"
                value={formData.preferredStartTime.slice(0, 16)}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  preferredStartTime: e.target.value + ':00' 
                }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                期望结束时间
              </label>
              <input
                type="datetime-local"
                value={formData.preferredEndTime.slice(0, 16)}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  preferredEndTime: e.target.value + ':00' 
                }))}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              指定琴房（可选）
            </label>
            <select
              value={formData.roomId}
              onChange={e => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
              className="input-field"
            >
              <option value="">不指定（任意琴房）</option>
              {rooms.filter(r => r.status === 'available').map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
