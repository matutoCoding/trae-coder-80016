import { useState, useEffect, useCallback } from 'react';
import { Receipt, Download, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import type { Bill } from '../../shared/types';

export default function Bills() {
  const [billList, setBillList] = useState<Bill[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalHours: 0,
    billCount: 0,
    averageAmount: 0
  });
  
  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.bills.getAll({
        page,
        pageSize,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || undefined
      });
      setBillList(result.bills);
      setTotal(result.total);
    } catch (err) {
      console.error('加载账单失败', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);
  
  const loadStats = useCallback(async () => {
    try {
      const data = await api.bills.getStats('month');
      setStats(data);
    } catch (err) {
      console.error('加载统计失败', err);
    }
  }, []);
  
  useEffect(() => {
    loadBills();
    loadStats();
  }, [loadBills, loadStats]);
  
  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };
  
  const handlePay = async (billId: string) => {
    if (confirm('确认已收到款项？')) {
      try {
        await api.bills.pay(billId);
        loadBills();
        loadStats();
        setShowDetailModal(false);
      } catch (err) {
        console.error('支付失败', err);
      }
    }
  };
  
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unpaid': return '待支付';
      case 'paid': return '已支付';
      case 'refunded': return '已退款';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-warning-50 text-warning-600';
      case 'paid': return 'bg-success-50 text-success-600';
      case 'refunded': return 'bg-walnut-100 text-walnut-600';
      default: return '';
    }
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
    }
    return `${mins}分钟`;
  };
  
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-sm text-walnut-500">本月营收</div>
          <div className="font-display text-2xl font-bold text-walnut-800 mt-1">
            ¥{stats.totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-walnut-500">总练琴时长</div>
          <div className="font-display text-2xl font-bold text-walnut-800 mt-1">
            {stats.totalHours.toFixed(1)} 小时
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-walnut-500">账单数量</div>
          <div className="font-display text-2xl font-bold text-walnut-800 mt-1">
            {stats.billCount} 单
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-walnut-500">平均消费</div>
          <div className="font-display text-2xl font-bold text-walnut-800 mt-1">
            ¥{stats.averageAmount.toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="p-6 border-b border-walnut-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-walnut-800">账单列表</h3>
                <p className="text-sm text-walnut-500">共 {total} 条记录</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-walnut-400" />
                <select
                  value={filters.status}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, status: e.target.value }));
                    setPage(1);
                  }}
                  className="input-field w-32 py-1.5 text-sm"
                >
                  <option value="">全部状态</option>
                  <option value="unpaid">待支付</option>
                  <option value="paid">已支付</option>
                  <option value="refunded">已退款</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, startDate: e.target.value }));
                    setPage(1);
                  }}
                  className="input-field w-36 py-1.5 text-sm"
                />
                <span className="text-walnut-400">至</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, endDate: e.target.value }));
                    setPage(1);
                  }}
                  className="input-field w-36 py-1.5 text-sm"
                />
              </div>
              
              <Button variant="secondary" size="sm" icon={Download}>
                导出
              </Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-walnut-50 text-sm text-walnut-600">
                <th className="text-left py-3 px-6 font-medium">账单编号</th>
                <th className="text-left py-3 px-6 font-medium">客户</th>
                <th className="text-left py-3 px-6 font-medium">琴房</th>
                <th className="text-left py-3 px-6 font-medium">时长</th>
                <th className="text-left py-3 px-6 font-medium">时间</th>
                <th className="text-right py-3 px-6 font-medium">金额</th>
                <th className="text-center py-3 px-6 font-medium">状态</th>
                <th className="text-center py-3 px-6 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-walnut-400">
                    <div className="animate-pulse-soft">加载中...</div>
                  </td>
                </tr>
              ) : billList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-walnut-400">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无账单记录</p>
                  </td>
                </tr>
              ) : (
                billList.map(bill => (
                  <tr key={bill.id} className="hover:bg-walnut-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-walnut-600">
                      {bill.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-walnut-800">{bill.customerName}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-walnut-600">{bill.roomName}</td>
                    <td className="py-4 px-6 text-sm text-walnut-600">
                      {formatDuration(bill.actualDuration)}
                    </td>
                    <td className="py-4 px-6 text-sm text-walnut-500">
                      {new Date(bill.startTime).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-walnut-800">
                      ¥{bill.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`status-badge ${getStatusColor(bill.status)}`}>
                        {getStatusLabel(bill.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleViewDetail(bill)}
                        className="p-1.5 text-walnut-500 hover:text-walnut-700 hover:bg-walnut-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-walnut-100 flex items-center justify-between">
            <span className="text-sm text-walnut-500">
              第 {page} / {totalPages} 页，共 {total} 条
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-walnut-200 rounded-lg hover:bg-walnut-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-walnut-800 text-white'
                      : 'hover:bg-walnut-50 text-walnut-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-walnut-200 rounded-lg hover:bg-walnut-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="账单详情"
        size="md"
      >
        {selectedBill && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-sm text-walnut-500">账单金额</div>
              <div className="font-display text-4xl font-bold text-walnut-800 mt-2">
                ¥{selectedBill.totalAmount.toFixed(2)}
              </div>
              <span className={`status-badge mt-2 ${getStatusColor(selectedBill.status)}`}>
                {getStatusLabel(selectedBill.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-walnut-500">账单编号</span>
                <div className="font-medium text-walnut-800 mt-1 font-mono">
                  {selectedBill.id.slice(0, 12).toUpperCase()}
                </div>
              </div>
              <div>
                <span className="text-walnut-500">客户姓名</span>
                <div className="font-medium text-walnut-800 mt-1">
                  {selectedBill.customerName}
                </div>
              </div>
              <div>
                <span className="text-walnut-500">使用琴房</span>
                <div className="font-medium text-walnut-800 mt-1">
                  {selectedBill.roomName}
                </div>
              </div>
              <div>
                <span className="text-walnut-500">实际时长</span>
                <div className="font-medium text-walnut-800 mt-1">
                  {formatDuration(selectedBill.actualDuration)}
                </div>
              </div>
              <div>
                <span className="text-walnut-500">开始时间</span>
                <div className="font-medium text-walnut-800 mt-1">
                  {new Date(selectedBill.startTime).toLocaleString('zh-CN')}
                </div>
              </div>
              <div>
                <span className="text-walnut-500">结束时间</span>
                <div className="font-medium text-walnut-800 mt-1">
                  {new Date(selectedBill.endTime).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
            
            <div className="border-t border-walnut-100 pt-4">
              <h4 className="font-medium text-walnut-800 mb-3">费用明细</h4>
              <div className="space-y-2">
                {selectedBill.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-walnut-600">{item.tierName}</span>
                      <span className="text-walnut-400">
                        ({Math.round(item.duration)}分钟)
                      </span>
                    </div>
                    <span className="font-medium text-walnut-800">
                      ¥{item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-walnut-100 font-bold">
                <span className="text-walnut-800">合计</span>
                <span className="text-walnut-800 text-lg">
                  ¥{selectedBill.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            
            {selectedBill.status === 'unpaid' && (
              <div className="flex justify-end">
                <Button variant="gold" onClick={() => handlePay(selectedBill.id)}>
                  确认收款
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
