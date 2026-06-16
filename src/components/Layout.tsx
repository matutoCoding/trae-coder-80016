import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': '总览仪表盘',
  '/schedule': '琴房排期',
  '/rooms': '琴房管理',
  '/waitlist': '候补队列',
  '/pricing': '费率设置',
  '/bills': '账单管理',
  '/checkin': '签到签退',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '琴韵坊';
  
  return (
    <div className="flex min-h-screen bg-walnut-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
