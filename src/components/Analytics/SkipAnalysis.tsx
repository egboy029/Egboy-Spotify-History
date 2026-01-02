import { Card, CardHeader } from '../ui/Card';
import type { SkipStats } from '../../types/spotify';
import { formatNumber } from '../../utils/dataProcessing';
import { SkipForward, AlertCircle, TrendingDown } from 'lucide-react';

interface SkipAnalysisProps {
  skipStats: SkipStats;
}

export function SkipAnalysis({ skipStats }: SkipAnalysisProps) {
  const skipPercentage = skipStats.skipRate;
  const listenedPercentage = 100 - skipPercentage;

  return (
    <Card className="animate-fade-in delay-100">
      <CardHeader 
        title="Skip Analysis" 
        subtitle="Your skip behavior patterns"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-gradient-to-br from-accent-pink/10 to-transparent border border-accent-pink/20">
          <div className="flex items-center gap-2 mb-2">
            <SkipForward className="w-5 h-5 text-accent-pink" />
            <span className="text-white/60 text-sm">Skipped</span>
          </div>
          <p className="text-3xl font-bold text-accent-pink">{formatNumber(skipStats.skippedTracks)}</p>
          <p className="text-white/40 text-sm">{skipPercentage.toFixed(1)}% of plays</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-accent-green/10 to-transparent border border-accent-green/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-accent-green" />
            <span className="text-white/60 text-sm">Completed</span>
          </div>
          <p className="text-3xl font-bold text-accent-green">
            {formatNumber(skipStats.totalTracks - skipStats.skippedTracks)}
          </p>
          <p className="text-white/40 text-sm">{listenedPercentage.toFixed(1)}% of plays</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <span className="text-white/60 text-sm">Total Plays</span>
          </div>
          <p className="text-3xl font-bold text-primary">{formatNumber(skipStats.totalTracks)}</p>
          <p className="text-white/40 text-sm">All track plays</p>
        </div>
      </div>

      {/* Skip Rate Visualization */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Skip Rate</span>
          <span className="text-white font-medium">{skipPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-accent-green transition-all duration-1000"
            style={{ width: `${listenedPercentage}%` }}
          />
          <div
            className="h-full bg-accent-pink transition-all duration-1000"
            style={{ width: `${skipPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent-green" />
            <span className="text-white/50 text-xs">Completed ({listenedPercentage.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent-pink" />
            <span className="text-white/50 text-xs">Skipped ({skipPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Most Skipped Artists */}
      {skipStats.mostSkippedArtists.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-4">Most Skipped Artists</h4>
          <div className="space-y-2">
            {skipStats.mostSkippedArtists.slice(0, 8).map((artist, index) => (
              <div
                key={artist.name}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-accent-pink/10 flex items-center justify-center text-accent-pink text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{artist.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-accent-pink font-semibold">{artist.skipCount} skips</p>
                  <p className="text-white/40 text-xs">{artist.skipRate.toFixed(1)}% skip rate</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-4 text-center">
            Only showing artists with 10+ plays
          </p>
        </div>
      )}
    </Card>
  );
}

