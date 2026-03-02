import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
}: StatsCardProps) {
  return (
    <Card className="p-6 flex items-start gap-4" hover>
      <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {title}
        </span>
        <span className="text-2xl font-semibold text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-xs text-gray-500 mt-0.5">{trend}</span>
        )}
      </div>
    </Card>
  );
}
