import { Clock, Music, Users, Disc3, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import type { OverviewStats, YearlyStats } from '../../types/spotify';
import { formatNumber, msToHours } from '../../utils/dataProcessing';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatsCardsProps {
  stats: OverviewStats;
  yearlyStats: YearlyStats[];
}

interface StatCardProps {
  icon: typeof Clock;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, subValue, color, delay }: StatCardProps) {
  return (
    <Card hover className={`animate-fade-in opacity-0`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subValue && <p className="text-white/40 text-sm mt-1">{subValue}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

export function StatsCards({ stats, yearlyStats }: StatsCardsProps) {
  const totalHours = Math.round(stats.totalListeningMs / (1000 * 60 * 60));
  const totalDays = Math.round(totalHours / 24);
  const avgDailyHours = (stats.averageDailyMs / (1000 * 60 * 60)).toFixed(1);

  const chartData = yearlyStats.map((y) => ({
    year: y.year.toString(),
    hours: msToHours(y.totalMs),
  }));

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Total Listening Time</p>
            <h2 className="text-5xl lg:text-6xl font-extrabold gradient-text mb-2">
              {formatNumber(totalHours)} hours
            </h2>
            <p className="text-white/50 text-lg">
              That's <span className="text-accent-gold font-semibold">{totalDays} days</span> of music
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-green/10 border border-accent-green/20">
            <TrendingUp className="w-5 h-5 text-accent-green" />
            <span className="text-accent-green font-medium">{avgDailyHours}h daily average</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Music}
          label="Total Plays"
          value={formatNumber(stats.totalTracks)}
          subValue={`${formatNumber(stats.uniqueTracks)} unique tracks`}
          color="text-secondary"
          delay={100}
        />
        <StatCard
          icon={Users}
          label="Artists Discovered"
          value={formatNumber(stats.uniqueArtists)}
          color="text-accent-pink"
          delay={200}
        />
        <StatCard
          icon={Disc3}
          label="Albums Explored"
          value={formatNumber(stats.uniqueAlbums)}
          color="text-accent-gold"
          delay={300}
        />
        <StatCard
          icon={Calendar}
          label="Time Span"
          value={stats.dateRange.start !== 'N/A' 
            ? `${new Date(stats.dateRange.start).getFullYear()} - ${new Date(stats.dateRange.end).getFullYear()}`
            : 'N/A'}
          subValue={stats.dateRange.start !== 'N/A' 
            ? `${stats.dateRange.start} to ${stats.dateRange.end}`
            : undefined}
          color="text-primary"
          delay={400}
        />
      </div>

      {/* Yearly Trend Chart */}
      <Card className="animate-fade-in opacity-0 delay-500">
        <h3 className="text-xl font-semibold text-white mb-4">Listening Over The Years</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 26, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: 'white', fontWeight: 600 }}
                itemStyle={{ color: '#8b5cf6' }}
                formatter={(value) => [`${value} hours`, 'Listening Time']}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#colorHours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

