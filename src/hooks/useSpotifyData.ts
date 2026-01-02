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

// Import all JSON files
import data0 from '../data/Streaming_History_Audio_2021-2022_0.json';
import data1 from '../data/Streaming_History_Audio_2022_1.json';
import data2 from '../data/Streaming_History_Audio_2022_2.json';
import data3 from '../data/Streaming_History_Audio_2022_3.json';
import data4 from '../data/Streaming_History_Audio_2022-2023_4.json';
import data5 from '../data/Streaming_History_Audio_2023_5.json';
import data6 from '../data/Streaming_History_Audio_2023-2024_6.json';
import data7 from '../data/Streaming_History_Audio_2024_7.json';
import data8 from '../data/Streaming_History_Audio_2024_8.json';
import data9 from '../data/Streaming_History_Audio_2024_9.json';
import data10 from '../data/Streaming_History_Audio_2024-2025_10.json';
import data11 from '../data/Streaming_History_Audio_2025_11.json';
import data12 from '../data/Streaming_History_Audio_2025_12.json';
import data13 from '../data/Streaming_History_Audio_2025_13.json';
import data14 from '../data/Streaming_History_Audio_2025_14.json';

export function useSpotifyData() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Merge all data
  const allRecords = useMemo<SpotifyStreamingRecord[]>(() => {
    const merged = [
      ...data0,
      ...data1,
      ...data2,
      ...data3,
      ...data4,
      ...data5,
      ...data6,
      ...data7,
      ...data8,
      ...data9,
      ...data10,
      ...data11,
      ...data12,
      ...data13,
      ...data14,
    ] as SpotifyStreamingRecord[];
    
    // Sort by timestamp
    return merged.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
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

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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

