import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Music, Users, Settings } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import Button from '../components/Button';
import Modal from '../components/Modal';
import type { Room, RoomType, RoomStatus } from '../../shared/types';

export default function Rooms() {
  const { rooms, fetchRooms, createRoom, updateRoom, deleteRoom } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: RoomType;
    equipment: string[];
    capacity: number;
    status: RoomStatus;
    description: string;
  }>({
    name: '',
    type: 'standard',
    equipment: [],
    capacity: 1,
    status: 'available',
    description: ''
  });
  
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  
  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      type: 'standard',
      equipment: [],
      capacity: 1,
      status: 'available',
      description: ''
    });
    setShowModal(true);
  };
  
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      equipment: room.equipment,
      capacity: room.capacity,
      status: room.status,
      description: room.description || ''
    });
    setShowModal(true);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个琴房吗？')) {
      await deleteRoom(id);
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.name) return;
    
    if (editingRoom) {
      await updateRoom(editingRoom.id, formData);
    } else {
      await createRoom(formData);
    }
    
    setShowModal(false);
    fetchRooms();
  };
  
  const equipmentOptions = ['立式钢琴', '三角钢琴', '琴凳', '乐谱架', '空调', '隔音棉', '专业音响', '观众席'];
  
  const toggleEquipment = (equip: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equip)
        ? prev.equipment.filter(e => e !== equip)
        : [...prev.equipment, equip]
    }));
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return '标准琴房';
      case 'premium': return '精品琴房';
      case 'grand': return '演奏厅';
      default: return type;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'premium': return 'bg-gold-100 text-gold-700';
      case 'grand': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-walnut-500 text-sm">
            共 {rooms.length} 间琴房，其中 {rooms.filter(r => r.status === 'available').length} 间可用
          </p>
        </div>
        <Button icon={Plus} variant="gold" onClick={handleAdd}>
          添加琴房
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="card overflow-hidden group">
            <div className="h-40 bg-gradient-to-br from-walnut-200 to-walnut-300 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Music className="w-16 h-16 text-white/60" />
              </div>
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(room.type)}`}>
                  {getTypeLabel(room.type)}
                </span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(room)}
                  className="p-2 bg-white/90 rounded-lg hover:bg-white text-walnut-600 mr-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="p-2 bg-white/90 rounded-lg hover:bg-white text-danger-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-walnut-800">{room.name}</h3>
              
              <div className="mt-3 flex items-center gap-4 text-sm text-walnut-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity}人</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  <span>{room.equipment.length}项设备</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-1.5">
                {room.equipment.slice(0, 4).map(equip => (
                  <span
                    key={equip}
                    className="px-2 py-0.5 bg-walnut-50 text-walnut-600 rounded text-xs"
                  >
                    {equip}
                  </span>
                ))}
                {room.equipment.length > 4 && (
                  <span className="px-2 py-0.5 bg-walnut-50 text-walnut-500 rounded text-xs">
                    +{room.equipment.length - 4}
                  </span>
                )}
              </div>
              
              {room.description && (
                <p className="mt-4 text-sm text-walnut-500 line-clamp-2">
                  {room.description}
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-walnut-100 flex items-center justify-between">
                <span className={`status-badge ${
                  room.status === 'available' ? 'status-available' :
                  room.status === 'maintenance' ? 'status-waiting' : 'status-occupied'
                }`}>
                  {room.status === 'available' ? '正常使用' :
                   room.status === 'maintenance' ? '维护中' : '已停用'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoom ? '编辑琴房' : '添加琴房'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingRoom ? '保存修改' : '添加琴房'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                琴房名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="如：A101 - 标准琴房"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                琴房类型
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as RoomType }))}
                className="input-field"
              >
                <option value="standard">标准琴房</option>
                <option value="premium">精品琴房</option>
                <option value="grand">演奏厅</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                容纳人数
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={e => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                className="input-field"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as never }))}
                className="input-field"
              >
                <option value="available">正常使用</option>
                <option value="maintenance">维护中</option>
                <option value="disabled">已停用</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              设备配置
            </label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(equip => (
                <button
                  key={equip}
                  type="button"
                  onClick={() => toggleEquipment(equip)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    formData.equipment.includes(equip)
                      ? 'bg-gold-100 text-gold-700 border border-gold-300'
                      : 'bg-walnut-50 text-walnut-600 border border-walnut-200 hover:border-walnut-300'
                  }`}
                >
                  {equip}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field h-24 resize-none"
              placeholder="琴房描述..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
