import { useEffect } from 'react';
import {
  Music2,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  BellRing,
  Activity
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const {
    dashboardStats,
    bookings,
    waitlist,
    fetchDashboardStats,
    fetchBookings,
    fetchWaitlist
  } = useAppStore();
  
  useEffect(() => {
    fetchDashboardStats();
    fetchBookings(new Date().toISOString().split('T')[0]);
    fetchWaitlist(new Date().toISOString().split('T')[0]);
  }, [fetchDashboardStats, fetchBookings, fetchWaitlist]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);
  
  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.startTime.startsWith(today) && b.status !== 'cancelled' && b.status !== 'no_show';
  });
  
  const utilizationPercent = dashboardStats?.utilizationRate || 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="可用琴房"
          value={`${dashboardStats?.totalRooms || 0} 间`}
          subtitle={`${dashboardStats?.occupiedRooms || 0} 间使用中`}
          icon={Music2}
          color="default"
        />
        
        <StatCard
          title="今日预约"
          value={dashboardStats?.todayBookings || 0}
          subtitle="单"
          icon={Calendar}
          color="success"
        />
        
        <StatCard
          title="今日营收"
          value={`¥${dashboardStats?.todayRevenue?.toFixed(2) || '0.00'}`}
          subtitle="人民币"
          icon={DollarSign}
          color="gold"
        />
        
        <StatCard
          title="候补排队"
          value={dashboardStats?.waitlistCount || 0}
          subtitle="人等待补位"
          icon={Clock}
          color="warning"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-walnut-800">琴房使用率</h3>
            <span className="text-sm text-walnut-500">实时</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-walnut-600">使用率</div>
              <div className="flex-1">
                <div className="h-4 bg-walnut-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${utilizationPercent}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right font-bold text-walnut-800">
                {utilizationPercent}%
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-walnut-50 rounded-xl">
              <div className="font-display text-2xl font-bold text-walnut-800">
                {dashboardStats?.occupiedRooms || 0}
              </div>
              <div className="text-sm text-walnut-500 mt-1">使用中</div>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-xl">
              <div className="font-display text-2xl font-bold text-success-600">
                {(dashboardStats?.totalRooms || 0) - (dashboardStats?.occupiedRooms || 0)}
              </div>
              <div className="text-sm text-walnut-500 mt-1">空闲</div>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-xl">
              <div className="font-display text-2xl font-bold text-warning-600">
                {dashboardStats?.waitlistCount || 0}
              </div>
              <div className="text-sm text-walnut-500 mt-1">候补中</div>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-walnut-800">快捷操作</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-walnut-50 hover:bg-walnut-100 rounded-xl transition-colors group">
              <div className="w-10 h-10 bg-gold-100 text-gold-600 rounded-lg flex items-center justify-center group-hover:bg-gold-200 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-walnut-800">新建预约</div>
                <div className="text-xs text-walnut-500">快速为客户预约琴房</div>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-walnut-50 hover:bg-walnut-100 rounded-xl transition-colors group">
              <div className="w-10 h-10 bg-success-100 text-success-600 rounded-lg flex items-center justify-center group-hover:bg-success-200 transition-colors">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-walnut-800">加入候补</div>
                <div className="text-xs text-walnut-500">客户可排队等待补位</div>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-walnut-50 hover:bg-walnut-100 rounded-xl transition-colors group">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-walnut-800">签到登记</div>
                <div className="text-xs text-walnut-500">客户到店签到开始计时</div>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-walnut-50 hover:bg-walnut-100 rounded-xl transition-colors group">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-walnut-800">费用计算</div>
                <div className="text-xs text-walnut-500">预览时段费用明细</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-walnut-800">今日预约</h3>
            <span className="text-sm text-walnut-500">{todayBookings.length} 个预约</span>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {todayBookings.length === 0 ? (
              <div className="text-center py-8 text-walnut-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>今日暂无预约</p>
              </div>
            ) : (
              todayBookings.slice(0, 5).map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-3 bg-walnut-50 rounded-xl hover:bg-walnut-100 transition-colors"
                >
                  <div className={`w-2 h-12 rounded-full ${
                    booking.status === 'checked_in' ? 'bg-success-500' :
                    booking.status === 'booked' ? 'bg-blue-500' :
                    booking.status === 'completed' ? 'bg-walnut-400' :
                    'bg-danger-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-walnut-800 truncate">
                      {booking.customerName}
                    </div>
                    <div className="text-sm text-walnut-500">
                      {booking.startTime.slice(11, 16)} - {booking.endTime.slice(11, 16)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-walnut-700">
                      ¥{booking.totalAmount.toFixed(2)}
                    </div>
                    <span className={`status-badge ${
                      booking.status === 'checked_in' ? 'status-available' :
                      booking.status === 'booked' ? 'status-booked' :
                      'status-waiting'
                    }`}>
                      {booking.status === 'checked_in' ? '进行中' :
                       booking.status === 'booked' ? '已预约' :
                       booking.status === 'completed' ? '已完成' :
                       '已取消'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-walnut-800">候补队列</h3>
            <span className="text-sm text-warning-600 font-medium">
              {waitlist.length} 人等待
            </span>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {waitlist.length === 0 ? (
              <div className="text-center py-8 text-walnut-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无候补用户</p>
              </div>
            ) : (
              waitlist.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-3 bg-walnut-50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-warning-100 text-warning-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-walnut-800 truncate">
                      {entry.customerName}
                    </div>
                    <div className="text-sm text-walnut-500">
                      {entry.preferredStartTime.slice(11, 16)} - {entry.preferredEndTime.slice(11, 16)}
                    </div>
                  </div>
                  <span className={`status-badge ${
                    entry.status === 'notified' ? 'status-waiting' : 'status-booked'
                  }`}>
                    {entry.status === 'notified' ? '已通知' : '等待中'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-walnut-800">营收趋势</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-gold-100 text-gold-700 rounded-lg font-medium">
              本周
            </button>
            <button className="px-3 py-1 text-sm text-walnut-500 hover:bg-walnut-100 rounded-lg">
              本月
            </button>
          </div>
        </div>
        
        <div className="h-48 flex items-end justify-around gap-2">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, i) => {
            const height = 30 + Math.random() * 70;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-gold-400 to-gold-300 rounded-t-lg transition-all hover:from-gold-500 hover:to-gold-400"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-walnut-500">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
