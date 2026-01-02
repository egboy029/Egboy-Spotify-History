import { Card, CardHeader } from '../ui/Card';
import type { MonthlyListening, HourlyListening } from '../../types/spotify';
import { msToHours, formatNumber } from '../../utils/dataProcessing';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ListeningTimelineProps {
  monthlyData: MonthlyListening[];
  hourlyData: HourlyListening[];
}

export function ListeningTimeline({ monthlyData, hourlyData }: ListeningTimelineProps) {
  const monthlyChartData = monthlyData.map((m) => ({
    month: m.month,
    hours: msToHours(m.totalMs),
    tracks: m.trackCount,
  }));

  const hourlyChartData = hourlyData.map((h) => ({
    hour: formatHour(h.hour),
    hours: msToHours(h.totalMs),
    tracks: h.trackCount,
    rawHour: h.hour,
  }));

  // Find peak listening time
  const peakHour = hourlyData.reduce((max, h) => h.totalMs > max.totalMs ? h : max, hourlyData[0]);
  const peakMonth = monthlyData.reduce((max, m) => m.totalMs > max.totalMs ? m : max, monthlyData[0]);

  return (
    <div className="space-y-6">
      {/* Monthly Timeline */}
      <Card className="animate-fade-in">
        <CardHeader 
          title="Monthly Listening Trend" 
          subtitle={`Peak month: ${peakMonth?.month || 'N/A'} with ${msToHours(peakMonth?.totalMs || 0)} hours`}
        />
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="monthlyStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 26, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: 'white', fontWeight: 600 }}
                formatter={(value, name) => {
                  if (name === 'hours') return [`${value} hours`, 'Listening Time'];
                  if (name === 'tracks') return [formatNumber(value as number), 'Tracks Played'];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="url(#monthlyStroke)"
                strokeWidth={3}
                fill="url(#monthlyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Hourly Distribution */}
      <Card className="animate-fade-in delay-100">
        <CardHeader 
          title="Listening by Hour of Day" 
          subtitle={`Peak listening time: ${formatHour(peakHour?.hour || 0)}`}
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 26, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: 'white', fontWeight: 600 }}
                formatter={(value, name) => {
                  if (name === 'hours') return [`${value} hours`, 'Total Time'];
                  if (name === 'tracks') return [formatNumber(value as number), 'Tracks'];
                  return [value, name];
                }}
              />
              <Bar 
                dataKey="hours" 
                radius={[4, 4, 0, 0]}
                fill="#8b5cf6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Time of day insights */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <TimeOfDayCard 
            label="Morning" 
            hours="6 AM - 12 PM" 
            data={hourlyChartData.filter(h => h.rawHour >= 6 && h.rawHour < 12)}
            color="text-accent-gold"
          />
          <TimeOfDayCard 
            label="Afternoon" 
            hours="12 PM - 6 PM" 
            data={hourlyChartData.filter(h => h.rawHour >= 12 && h.rawHour < 18)}
            color="text-secondary"
          />
          <TimeOfDayCard 
            label="Night" 
            hours="6 PM - 12 AM" 
            data={hourlyChartData.filter(h => h.rawHour >= 18 && h.rawHour < 24)}
            color="text-primary"
          />
        </div>
      </Card>
    </div>
  );
}

interface TimeOfDayCardProps {
  label: string;
  hours: string;
  data: { hours: number; tracks: number }[];
  color: string;
}

function TimeOfDayCard({ label, hours, data, color }: TimeOfDayCardProps) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const totalTracks = data.reduce((sum, d) => sum + d.tracks, 0);
  
  return (
    <div className="p-4 rounded-xl bg-white/5">
      <p className={`font-semibold ${color}`}>{label}</p>
      <p className="text-xs text-white/40 mb-2">{hours}</p>
      <p className="text-2xl font-bold text-white">{Math.round(totalHours)}h</p>
      <p className="text-xs text-white/50">{formatNumber(totalTracks)} tracks</p>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

