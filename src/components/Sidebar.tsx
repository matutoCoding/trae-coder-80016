import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  DoorOpen,
  Clock,
  DollarSign,
  Receipt,
  QrCode,
  Music2
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '总览', icon: LayoutDashboard },
  { path: '/schedule', label: '排期管理', icon: Calendar },
  { path: '/rooms', label: '琴房管理', icon: DoorOpen },
  { path: '/waitlist', label: '候补队列', icon: Clock },
  { path: '/pricing', label: '费率设置', icon: DollarSign },
  { path: '/bills', label: '账单管理', icon: Receipt },
  { path: '/checkin', label: '签到签退', icon: QrCode },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-walnut-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-walnut-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
            <Music2 className="w-6 h-6 text-walnut-900" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">琴韵坊</h1>
            <p className="text-walnut-300 text-xs">共享琴房管理系统</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gold-500 text-walnut-900 font-medium'
                  : 'text-walnut-200 hover:bg-walnut-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-walnut-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 bg-walnut-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">管</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">管理员</p>
            <p className="text-walnut-400 text-xs truncate">admin@qinyunfang.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
