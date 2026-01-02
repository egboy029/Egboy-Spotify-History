import { useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import type { ProcessedTrack } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataProcessing';
import { useTrackImages } from '../../hooks/useSpotifyImages';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TopTracksProps {
  tracks: ProcessedTrack[];
}

const gradientColors = [
  '#06b6d4', '#22d3ee', '#67e8f9',
  '#ec4899', '#f472b6', '#f9a8d4',
  '#f59e0b', '#fbbf24', '#fcd34d',
  '#10b981',
];

export function TopTracks({ tracks }: TopTracksProps) {
  const top10Tracks = tracks.slice(0, 10);
  
  // Prepare track info for image fetching
  const trackInfos = useMemo(() => 
    top10Tracks.map(track => ({ name: track.name, artist: track.artist })),
    [top10Tracks.map(t => `${t.name}:${t.artist}`).join('|')]
  );
  
  const { getImage, loading: imagesLoading } = useTrackImages(trackInfos);

  const chartData = top10Tracks.map((track, index) => ({
    name: track.name.length > 20 ? track.name.slice(0, 20) + '...' : track.name,
    fullName: track.name,
    artist: track.artist,
    hours: Math.round(track.totalMs / (1000 * 60 * 60) * 10) / 10,
    plays: track.playCount,
    index,
  }));

  return (
    <Card className="animate-fade-in delay-100">
      <CardHeader 
        title="Top Tracks" 
        subtitle="Your most played songs"
      />
      
      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickFormatter={(value) => `${value}h`}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
              width={140}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                backgroundColor: 'rgba(15, 15, 26, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: 'white', fontWeight: 600, marginBottom: 4 }}
              formatter={(value, name) => {
                if (name === 'hours') return [`${value} hours`, 'Listening Time'];
                return [value, name];
              }}
              labelFormatter={(_, payload) => {
                const data = payload?.[0]?.payload;
                return data ? `${data.fullName} - ${data.artist}` : '';
              }}
            />
            <Bar 
              dataKey="hours" 
              radius={[0, 8, 8, 0]}
              maxBarSize={40}
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={gradientColors[index % gradientColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* List - show same top 10 as chart for consistency */}
      <div className="space-y-2">
        {top10Tracks.map((track, index) => {
          const imageUrl = getImage(track.name, track.artist);
          
          return (
            <div
              key={`${track.name}-${track.artist}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              {/* Ranking */}
              <span 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: `${gradientColors[index % gradientColors.length]}20`, color: gradientColors[index % gradientColors.length] }}
              >
                {index + 1}
              </span>
              
              {/* Album Cover */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/10">
                {imagesLoading ? (
                  <div className="w-full h-full animate-pulse bg-white/20" />
                ) : imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${track.album || track.name} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{track.name}</p>
                <p className="text-white/50 text-sm truncate">{track.artist}</p>
              </div>
              
              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-secondary font-semibold">{formatDuration(track.totalMs)}</p>
                <p className="text-white/40 text-xs">{formatNumber(track.playCount)} plays</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
