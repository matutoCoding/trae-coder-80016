import { Bell, Search, Settings } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useState, useEffect } from 'react';

export default function Header({ title }: { title: string }) {
  const { unreadCount, fetchUnreadCount } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);
  
  return (
    <header className="bg-white border-b border-walnut-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-walnut-800">{title}</h2>
          <p className="text-walnut-500 text-sm mt-1">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-walnut-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-10 pr-4 py-2 bg-walnut-50 border border-walnut-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 w-64"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-walnut-600 hover:text-walnut-800 hover:bg-walnut-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-soft">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-walnut-100 z-50 animate-slide-in-right">
                <div className="p-4 border-b border-walnut-100">
                  <h3 className="font-semibold text-walnut-800">通知</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 text-center text-walnat-500 text-sm">
                    暂无新通知
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button className="p-2 text-walnut-600 hover:text-walnut-800 hover:bg-walnut-50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
