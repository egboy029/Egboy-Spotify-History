import { useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import type { ProcessedArtist } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataProcessing';
import { useArtistImages } from '../../hooks/useSpotifyImages';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TopArtistsProps {
  artists: ProcessedArtist[];
}

const gradientColors = [
  '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe',
  '#ec4899', '#f472b6', '#f9a8d4',
  '#06b6d4', '#22d3ee', '#67e8f9',
];

export function TopArtists({ artists }: TopArtistsProps) {
  const top10Artists = artists.slice(0, 10);
  
  // Prepare artist names for image fetching
  const artistNames = useMemo(() => 
    top10Artists.map(artist => artist.name),
    [top10Artists.map(a => a.name).join('|')]
  );
  
  const { getImage, loading: imagesLoading } = useArtistImages(artistNames);

  const chartData = top10Artists.map((artist, index) => ({
    name: artist.name.length > 15 ? artist.name.slice(0, 15) + '...' : artist.name,
    fullName: artist.name,
    hours: Math.round(artist.totalMs / (1000 * 60 * 60) * 10) / 10,
    plays: artist.playCount,
    index,
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader 
        title="Top Artists" 
        subtitle="By total listening time"
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
              width={120}
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
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
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
        {top10Artists.map((artist, index) => {
          const imageUrl = getImage(artist.name);
          
          return (
            <div
              key={artist.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              {/* Ranking */}
              <span 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: `${gradientColors[index % gradientColors.length]}20`, color: gradientColors[index % gradientColors.length] }}
              >
                {index + 1}
              </span>
              
              {/* Artist Picture */}
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white/10">
                {imagesLoading ? (
                  <div className="w-full h-full animate-pulse bg-white/20" />
                ) : imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${artist.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Artist Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{artist.name}</p>
                <p className="text-white/50 text-sm">
                  {formatNumber(artist.playCount)} plays · {artist.trackCount} tracks
                </p>
              </div>
              
              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-primary font-semibold">{formatDuration(artist.totalMs)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
