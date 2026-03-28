'use client';
import Link from 'next/link';

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  teal: 'bg-teal-50 text-teal-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, href, trend }) {
  const content = (
    <div className="stat-card group cursor-pointer hover:shadow-md transition-all">
      <div className={`w-12 h-12 ${colorMap[color]} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-500 text-sm leading-tight">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        {trend !== undefined && (
          <div className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
