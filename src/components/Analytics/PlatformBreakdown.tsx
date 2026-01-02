import { Card, CardHeader } from '../ui/Card';
import type { PlatformStats } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataProcessing';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Monitor, Smartphone, Globe, Speaker, Laptop } from 'lucide-react';

interface PlatformBreakdownProps {
  platformStats: PlatformStats[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#6366f1', '#f472b6'];

const platformIcons: Record<string, typeof Monitor> = {
  Windows: Monitor,
  Android: Smartphone,
  iOS: Smartphone,
  macOS: Laptop,
  'Web Player': Globe,
  'Cast Device': Speaker,
};

export function PlatformBreakdown({ platformStats }: PlatformBreakdownProps) {
  const chartData = platformStats.map((p, index) => ({
    name: p.platform,
    value: p.totalMs,
    hours: Math.round(p.totalMs / (1000 * 60 * 60) * 10) / 10,
    percentage: p.percentage,
    plays: p.playCount,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-dark/95 border border-white/10 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-white mb-2">{data.name}</p>
          <p className="text-white/70 text-sm">
            <span className="text-white font-medium">{data.hours}</span> hours
          </p>
          <p className="text-white/70 text-sm">
            <span className="text-white font-medium">{formatNumber(data.plays)}</span> plays
          </p>
          <p className="text-white/70 text-sm">
            <span className="text-white font-medium">{data.percentage.toFixed(1)}%</span> of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader 
        title="Platform Breakdown" 
        subtitle="Where you listen to music"
      />
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform List */}
        <div className="w-full lg:w-1/2 space-y-3">
          {platformStats.map((platform, index) => {
            const Icon = platformIcons[platform.platform] || Monitor;
            const color = COLORS[index % COLORS.length];
            
            return (
              <div
                key={platform.platform}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium">{platform.platform}</p>
                    <p className="text-white/60 text-sm">{platform.percentage.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${platform.percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-1">
                    {formatDuration(platform.totalMs)} · {formatNumber(platform.playCount)} plays
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

