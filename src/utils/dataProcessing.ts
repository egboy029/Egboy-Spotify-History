import type {
  SpotifyStreamingRecord,
  ProcessedTrack,
  ProcessedArtist,
  MonthlyListening,
  HourlyListening,
  PlatformStats,
  SkipStats,
  YearlyStats,
  OverviewStats,
} from '../types/spotify';

// Filter out null/empty tracks and very short plays (< 30 seconds)
export function filterValidTracks(records: SpotifyStreamingRecord[]): SpotifyStreamingRecord[] {
  return records.filter(
    (r) => r.master_metadata_track_name && r.ms_played >= 30000
  );
}

export function calculateOverviewStats(records: SpotifyStreamingRecord[]): OverviewStats {
  const validRecords = filterValidTracks(records);
  
  const totalListeningMs = validRecords.reduce((sum, r) => sum + r.ms_played, 0);
  const totalTracks = validRecords.length;
  
  const uniqueTracksSet = new Set(
    validRecords.map((r) => `${r.master_metadata_track_name}|${r.master_metadata_album_artist_name}`)
  );
  const uniqueArtistsSet = new Set(
    validRecords.map((r) => r.master_metadata_album_artist_name).filter(Boolean)
  );
  const uniqueAlbumsSet = new Set(
    validRecords.map((r) => r.master_metadata_album_album_name).filter(Boolean)
  );
  
  // Use reduce instead of spread operator to avoid stack overflow with large arrays
  let minTime = Infinity;
  let maxTime = -Infinity;
  for (const record of records) {
    const time = new Date(record.ts).getTime();
    if (time < minTime) minTime = time;
    if (time > maxTime) maxTime = time;
  }
  
  const start = new Date(minTime).toISOString().split('T')[0];
  const end = new Date(maxTime).toISOString().split('T')[0];
  
  const daysDiff = (maxTime - minTime) / (1000 * 60 * 60 * 24);
  const averageDailyMs = daysDiff > 0 ? totalListeningMs / daysDiff : 0;
  
  return {
    totalListeningMs,
    totalTracks,
    uniqueTracks: uniqueTracksSet.size,
    uniqueArtists: uniqueArtistsSet.size,
    uniqueAlbums: uniqueAlbumsSet.size,
    dateRange: { start, end },
    averageDailyMs,
  };
}

export function getTopTracks(records: SpotifyStreamingRecord[], limit = 20): ProcessedTrack[] {
  const validRecords = filterValidTracks(records);
  const trackMap = new Map<string, ProcessedTrack>();
  
  for (const record of validRecords) {
    const key = `${record.master_metadata_track_name}|${record.master_metadata_album_artist_name}`;
    const existing = trackMap.get(key);
    
    if (existing) {
      existing.playCount++;
      existing.totalMs += record.ms_played;
    } else {
      trackMap.set(key, {
        name: record.master_metadata_track_name!,
        artist: record.master_metadata_album_artist_name || 'Unknown Artist',
        album: record.master_metadata_album_album_name || 'Unknown Album',
        playCount: 1,
        totalMs: record.ms_played,
        spotifyUri: record.spotify_track_uri,
      });
    }
  }
  
  return Array.from(trackMap.values())
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, limit);
}

export function getTopArtists(records: SpotifyStreamingRecord[], limit = 20): ProcessedArtist[] {
  const validRecords = filterValidTracks(records);
  const artistMap = new Map<string, ProcessedArtist & { tracks: Set<string> }>();
  
  for (const record of validRecords) {
    const artistName = record.master_metadata_album_artist_name;
    if (!artistName) continue;
    
    const existing = artistMap.get(artistName);
    
    if (existing) {
      existing.playCount++;
      existing.totalMs += record.ms_played;
      existing.tracks.add(record.master_metadata_track_name!);
    } else {
      artistMap.set(artistName, {
        name: artistName,
        playCount: 1,
        totalMs: record.ms_played,
        trackCount: 0,
        tracks: new Set([record.master_metadata_track_name!]),
      });
    }
  }
  
  return Array.from(artistMap.values())
    .map(({ tracks, ...rest }) => ({ ...rest, trackCount: tracks.size }))
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, limit);
}

export function getMonthlyListening(records: SpotifyStreamingRecord[]): MonthlyListening[] {
  const validRecords = filterValidTracks(records);
  const monthMap = new Map<string, MonthlyListening>();
  
  for (const record of validRecords) {
    const date = new Date(record.ts);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const key = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = monthMap.get(key);
    
    if (existing) {
      existing.totalMs += record.ms_played;
      existing.trackCount++;
    } else {
      monthMap.set(key, {
        month: `${month} ${year}`,
        year,
        totalMs: record.ms_played,
        trackCount: 1,
      });
    }
  }
  
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);
}

export function getHourlyListening(records: SpotifyStreamingRecord[]): HourlyListening[] {
  const validRecords = filterValidTracks(records);
  const hourMap = new Map<number, HourlyListening>();
  
  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourMap.set(i, { hour: i, totalMs: 0, trackCount: 0 });
  }
  
  for (const record of validRecords) {
    const hour = new Date(record.ts).getHours();
    const existing = hourMap.get(hour)!;
    existing.totalMs += record.ms_played;
    existing.trackCount++;
  }
  
  return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour);
}

export function getPlatformStats(records: SpotifyStreamingRecord[]): PlatformStats[] {
  const validRecords = filterValidTracks(records);
  const platformMap = new Map<string, { totalMs: number; playCount: number }>();
  
  for (const record of validRecords) {
    const platform = record.platform || 'unknown';
    const existing = platformMap.get(platform);
    
    if (existing) {
      existing.totalMs += record.ms_played;
      existing.playCount++;
    } else {
      platformMap.set(platform, { totalMs: record.ms_played, playCount: 1 });
    }
  }
  
  const totalMs = validRecords.reduce((sum, r) => sum + r.ms_played, 0);
  
  return Array.from(platformMap.entries())
    .map(([platform, data]) => ({
      platform: formatPlatformName(platform),
      totalMs: data.totalMs,
      playCount: data.playCount,
      percentage: (data.totalMs / totalMs) * 100,
    }))
    .sort((a, b) => b.totalMs - a.totalMs);
}

function formatPlatformName(platform: string): string {
  const platformNames: Record<string, string> = {
    windows: 'Windows',
    android: 'Android',
    ios: 'iOS',
    osx: 'macOS',
    web_player: 'Web Player',
    cast_to_device: 'Cast Device',
    unknown: 'Unknown',
  };
  return platformNames[platform.toLowerCase()] || platform;
}

export function getSkipStats(records: SpotifyStreamingRecord[]): SkipStats {
  const validRecords = records.filter((r) => r.master_metadata_track_name);
  const totalTracks = validRecords.length;
  const skippedTracks = validRecords.filter((r) => r.skipped).length;
  
  // Calculate skip rate by artist
  const artistSkipMap = new Map<string, { total: number; skipped: number }>();
  
  for (const record of validRecords) {
    const artist = record.master_metadata_album_artist_name;
    if (!artist) continue;
    
    const existing = artistSkipMap.get(artist);
    if (existing) {
      existing.total++;
      if (record.skipped) existing.skipped++;
    } else {
      artistSkipMap.set(artist, { total: 1, skipped: record.skipped ? 1 : 0 });
    }
  }
  
  const mostSkippedArtists = Array.from(artistSkipMap.entries())
    .filter(([, data]) => data.total >= 10) // Only artists with enough plays
    .map(([name, data]) => ({
      name,
      skipCount: data.skipped,
      skipRate: (data.skipped / data.total) * 100,
    }))
    .sort((a, b) => b.skipCount - a.skipCount)
    .slice(0, 10);
  
  return {
    totalTracks,
    skippedTracks,
    skipRate: totalTracks > 0 ? (skippedTracks / totalTracks) * 100 : 0,
    mostSkippedArtists,
  };
}

export function getYearlyStats(records: SpotifyStreamingRecord[]): YearlyStats[] {
  const validRecords = filterValidTracks(records);
  const yearMap = new Map<number, { 
    totalMs: number; 
    trackCount: number; 
    artists: Set<string>; 
    tracks: Set<string> 
  }>();
  
  for (const record of validRecords) {
    const year = new Date(record.ts).getFullYear();
    const existing = yearMap.get(year);
    
    if (existing) {
      existing.totalMs += record.ms_played;
      existing.trackCount++;
      if (record.master_metadata_album_artist_name) {
        existing.artists.add(record.master_metadata_album_artist_name);
      }
      existing.tracks.add(`${record.master_metadata_track_name}|${record.master_metadata_album_artist_name}`);
    } else {
      yearMap.set(year, {
        totalMs: record.ms_played,
        trackCount: 1,
        artists: new Set(record.master_metadata_album_artist_name ? [record.master_metadata_album_artist_name] : []),
        tracks: new Set([`${record.master_metadata_track_name}|${record.master_metadata_album_artist_name}`]),
      });
    }
  }
  
  return Array.from(yearMap.entries())
    .map(([year, data]) => ({
      year,
      totalMs: data.totalMs,
      trackCount: data.trackCount,
      uniqueArtists: data.artists.size,
      uniqueTracks: data.tracks.size,
    }))
    .sort((a, b) => a.year - b.year);
}

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function msToHours(ms: number): number {
  return Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
}

export function getAvailableYears(records: SpotifyStreamingRecord[]): number[] {
  const years = new Set(records.map((r) => new Date(r.ts).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}

export function filterByYear(records: SpotifyStreamingRecord[], year: number | 'all'): SpotifyStreamingRecord[] {
  if (year === 'all') return records;
  return records.filter((r) => new Date(r.ts).getFullYear() === year);
}

