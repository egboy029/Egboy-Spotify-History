export interface SpotifyStreamingRecord {
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  offline_timestamp: number;
  incognito_mode: boolean;
}

export interface ProcessedTrack {
  name: string;
  artist: string;
  album: string;
  playCount: number;
  totalMs: number;
  spotifyUri: string | null;
}

export interface ProcessedArtist {
  name: string;
  playCount: number;
  totalMs: number;
  trackCount: number;
}

export interface MonthlyListening {
  month: string;
  year: number;
  totalMs: number;
  trackCount: number;
}

export interface HourlyListening {
  hour: number;
  totalMs: number;
  trackCount: number;
}

export interface PlatformStats {
  platform: string;
  totalMs: number;
  playCount: number;
  percentage: number;
}

export interface SkipStats {
  totalTracks: number;
  skippedTracks: number;
  skipRate: number;
  mostSkippedArtists: { name: string; skipCount: number; skipRate: number }[];
}

export interface YearlyStats {
  year: number;
  totalMs: number;
  trackCount: number;
  uniqueArtists: number;
  uniqueTracks: number;
}

export interface OverviewStats {
  totalListeningMs: number;
  totalTracks: number;
  uniqueTracks: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  dateRange: { start: string; end: string };
  averageDailyMs: number;
}

export type TabType = 'overview' | 'top-charts' | 'timeline' | 'history' | 'analytics';

