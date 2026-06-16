import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Clock, Calculator } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { api } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import type { PricingTier, PricingCalculation } from '../../shared/types';

export default function Pricing() {
  const { pricingTiers, fetchPricingTiers } = useAppStore();
  const [schedule, setSchedule] = useState<{ tier: PricingTier; startTime: string; endTime: string }[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [tierForm, setTierForm] = useState({ name: '', rate: 0, color: '#FFB300' });
  
  const [calcResult, setCalcResult] = useState<PricingCalculation | null>(null);
  const [calcForm, setCalcForm] = useState({
    startTime: '',
    endTime: '',
    roomType: 'standard'
  });
  
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  useEffect(() => {
    fetchPricingTiers();
  }, [fetchPricingTiers]);
  
  useEffect(() => {
    loadSchedule();
  }, [selectedDay]);
  
  const loadSchedule = async () => {
    try {
      const { schedule: sched } = await api.pricing.getSchedule(selectedDay);
      setSchedule(sched);
    } catch (err) {
      console.error('加载时段失败', err);
    }
  };
  
  const handleAddTier = () => {
    setEditingTier(null);
    setTierForm({ name: '', rate: 0, color: '#FFB300' });
    setShowTierModal(true);
  };
  
  const handleEditTier = (tier: PricingTier) => {
    setEditingTier(tier);
    setTierForm({ name: tier.name, rate: tier.rate, color: tier.color });
    setShowTierModal(true);
  };
  
  const handleSaveTier = async () => {
    if (!tierForm.name || tierForm.rate <= 0) return;
    
    try {
      if (editingTier) {
        await api.pricing.updateTier(editingTier.id, tierForm);
      } else {
        await api.pricing.createTier(tierForm);
      }
      setShowTierModal(false);
      fetchPricingTiers();
      loadSchedule();
    } catch (err) {
      console.error('保存失败', err);
    }
  };
  
  const handleDeleteTier = async (id: string) => {
    if (confirm('确定要删除这个费率档位吗？')) {
      try {
        await api.pricing.deleteTier(id);
        fetchPricingTiers();
        loadSchedule();
      } catch (err) {
        console.error('删除失败', err);
      }
    }
  };
  
  const handleCalculate = async () => {
    if (!calcForm.startTime || !calcForm.endTime) return;
    
    try {
      const result = await api.pricing.calculate(
        calcForm.startTime,
        calcForm.endTime,
        calcForm.roomType
      );
      setCalcResult(result);
    } catch (err) {
      console.error('计算失败', err);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-walnut-800">费率档位</h3>
                  <p className="text-sm text-walnut-500">管理不同时段的费率标准</p>
                </div>
              </div>
              <Button icon={Plus} variant="gold" size="sm" onClick={handleAddTier}>
                添加档位
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pricingTiers.map(tier => (
                <div
                  key={tier.id}
                  className="p-4 rounded-xl border-2 transition-all group relative"
                  style={{ borderColor: tier.color + '40', backgroundColor: tier.color + '10' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg mb-3"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div className="font-bold text-walnut-800">{tier.name}</div>
                  <div className="text-2xl font-display font-bold" style={{ color: tier.color }}>
                    ¥{tier.rate}
                    <span className="text-sm font-normal text-walnut-500">/小时</span>
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEditTier(tier)}
                      className="p-1.5 bg-white rounded-md shadow-sm text-walnut-600 hover:bg-walnut-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-1.5 bg-white rounded-md shadow-sm text-danger-500 hover:bg-danger-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-walnut-800">时段分布</h3>
                  <p className="text-sm text-walnut-500">查看各天的费率时段安排</p>
                </div>
              </div>
              
              <div className="flex gap-1 bg-walnut-50 p-1 rounded-lg">
                {days.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(index)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      selectedDay === index
                        ? 'bg-white text-walnut-800 shadow-sm font-medium'
                        : 'text-walnut-500 hover:text-walnut-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative h-16 bg-walnut-50 rounded-xl overflow-hidden">
              {schedule.map((slot, index) => {
                const startMinutes = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
                const endMinutes = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);
                const totalMinutes = 14 * 60;
                const offsetMinutes = startMinutes - 8 * 60;
                
                const left = (offsetMinutes / totalMinutes) * 100;
                const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
                
                return (
                  <div
                    key={index}
                    className="absolute top-2 bottom-2 flex items-center justify-center text-white text-xs font-medium rounded-lg"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: slot.tier.color
                    }}
                  >
                    <span className="truncate px-2">
                      {slot.tier.name} {slot.startTime}-{slot.endTime}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-walnut-400">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>22:00</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-walnut-800">费用试算</h3>
                <p className="text-sm text-walnut-500">预览跨档计费明细</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-walnut-700 mb-2">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  value={calcForm.startTime}
                  onChange={e => setCalcForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-walnut-700 mb-2">
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  value={calcForm.endTime}
                  onChange={e => setCalcForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-walnut-700 mb-2">
                  琴房类型
                </label>
                <select
                  value={calcForm.roomType}
                  onChange={e => setCalcForm(prev => ({ ...prev, roomType: e.target.value }))}
                  className="input-field"
                >
                  <option value="standard">标准琴房</option>
                  <option value="premium">精品琴房 (1.5倍)</option>
                  <option value="grand">演奏厅 (2.5倍)</option>
                </select>
              </div>
              
              <Button variant="primary" onClick={handleCalculate} className="w-full">
                计算费用
              </Button>
            </div>
            
            {calcResult && (
              <div className="mt-6 p-4 bg-walnut-50 rounded-xl">
                <div className="text-center mb-4">
                  <div className="text-sm text-walnut-500">预估费用</div>
                  <div className="font-display text-3xl font-bold text-walnut-800 mt-1">
                    ¥{calcResult.totalAmount.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {calcResult.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-walnut-600">{item.tierName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-walnut-500">
                          {Math.round(item.duration)}分钟
                        </span>
                        <span className="text-walnut-800 font-medium ml-3">
                          ¥{item.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        title={editingTier ? '编辑费率档位' : '添加费率档位'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTierModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSaveTier}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              档位名称
            </label>
            <input
              type="text"
              value={tierForm.name}
              onChange={e => setTierForm(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="如：高峰时段"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              每小时费率（元）
            </label>
            <input
              type="number"
              value={tierForm.rate}
              onChange={e => setTierForm(prev => ({ ...prev, rate: Number(e.target.value) }))}
              className="input-field"
              min="0"
              step="0.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-walnut-700 mb-2">
              标识颜色
            </label>
            <div className="flex gap-2">
              {['#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FFB300', '#795548'].map(color => (
                <button
                  key={color}
                  onClick={() => setTierForm(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    tierForm.color === color ? 'ring-2 ring-offset-2 ring-walnut-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
