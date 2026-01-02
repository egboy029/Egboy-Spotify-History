import { useState, useEffect, useMemo } from 'react';
import type { SpotifyStreamingRecord, OverviewStats } from '../types/spotify';
import {
  calculateOverviewStats,
  getTopTracks,
  getTopArtists,
  getMonthlyListening,
  getHourlyListening,
  getPlatformStats,
  getSkipStats,
  getYearlyStats,
  getAvailableYears,
  filterByYear,
} from '../utils/dataProcessing';

// List of data files to fetch
const DATA_FILES = [
  'Streaming_History_Audio_2021-2022_0.json',
  'Streaming_History_Audio_2022_1.json',
  'Streaming_History_Audio_2022_2.json',
  'Streaming_History_Audio_2022_3.json',
  'Streaming_History_Audio_2022-2023_4.json',
  'Streaming_History_Audio_2023_5.json',
  'Streaming_History_Audio_2023-2024_6.json',
  'Streaming_History_Audio_2024_7.json',
  'Streaming_History_Audio_2024_8.json',
  'Streaming_History_Audio_2024_9.json',
  'Streaming_History_Audio_2024-2025_10.json',
  'Streaming_History_Audio_2025_11.json',
  'Streaming_History_Audio_2025_12.json',
  'Streaming_History_Audio_2025_13.json',
  'Streaming_History_Audio_2025_14.json',
];

export function useSpotifyData() {
  const [isLoading, setIsLoading] = useState(true);
  const [allRecords, setAllRecords] = useState<SpotifyStreamingRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const promises = DATA_FILES.map(async (file) => {
          const response = await fetch(`/data/${file}`);
          if (!response.ok) {
            console.warn(`Failed to load ${file}`);
            return [];
          }
          return response.json();
        });

        const results = await Promise.all(promises);
        const merged = results.flat() as SpotifyStreamingRecord[];
        
        // Sort by timestamp
        merged.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        
        setAllRecords(merged);
      } catch (error) {
        console.error('Error loading Spotify data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter records by selected year
  const filteredRecords = useMemo(() => {
    return filterByYear(allRecords, selectedYear);
  }, [allRecords, selectedYear]);

  // Calculate all stats
  const overviewStats = useMemo<OverviewStats>(() => {
    return calculateOverviewStats(filteredRecords);
  }, [filteredRecords]);

  const topTracks = useMemo(() => getTopTracks(filteredRecords, 20), [filteredRecords]);
  const topArtists = useMemo(() => getTopArtists(filteredRecords, 20), [filteredRecords]);
  const monthlyListening = useMemo(() => getMonthlyListening(filteredRecords), [filteredRecords]);
  const hourlyListening = useMemo(() => getHourlyListening(filteredRecords), [filteredRecords]);
  const platformStats = useMemo(() => getPlatformStats(filteredRecords), [filteredRecords]);
  const skipStats = useMemo(() => getSkipStats(filteredRecords), [filteredRecords]);
  const yearlyStats = useMemo(() => getYearlyStats(allRecords), [allRecords]);
  const availableYears = useMemo(() => getAvailableYears(allRecords), [allRecords]);

  return {
    isLoading,
    allRecords,
    filteredRecords,
    selectedYear,
    setSelectedYear,
    overviewStats,
    topTracks,
    topArtists,
    monthlyListening,
    hourlyListening,
    platformStats,
    skipStats,
    yearlyStats,
    availableYears,
  };
}
