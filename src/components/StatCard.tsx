import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'gold';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'default',
  trend
}: StatCardProps) {
  const colorClasses = {
    default: 'bg-walnut-100 text-walnut-700',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    gold: 'bg-gold-100 text-gold-600'
  };
  
  return (
    <div className="card p-6 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-walnut-500 text-sm font-medium">{title}</p>
          <p className="font-display text-3xl font-bold text-walnut-800 mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-walnut-400 text-sm mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-3 text-sm ${
              trend.isUp ? 'text-success-600' : 'text-danger-600'
            }`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
              <span className="text-walnut-400">较昨日</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
