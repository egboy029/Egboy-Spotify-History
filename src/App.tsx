import { useState } from 'react';
import { Dashboard } from './components/Layout/Dashboard';
import { StatsCards } from './components/Overview/StatsCards';
import { TopArtists } from './components/TopCharts/TopArtists';
import { TopTracks } from './components/TopCharts/TopTracks';
import { ListeningTimeline } from './components/Timeline/ListeningTimeline';
import { RecentHistory } from './components/History/RecentHistory';
import { PlatformBreakdown } from './components/Analytics/PlatformBreakdown';
import { SkipAnalysis } from './components/Analytics/SkipAnalysis';
import { YearSelector } from './components/ui/YearSelector';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useSpotifyData } from './hooks/useSpotifyData';
import type { TabType } from './types/spotify';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const {
    isLoading,
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
  } = useSpotifyData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsCards stats={overviewStats} yearlyStats={yearlyStats} />;
      
      case 'top-charts':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopArtists artists={topArtists} />
            <TopTracks tracks={topTracks} />
          </div>
        );
      
      case 'timeline':
        return (
          <ListeningTimeline 
            monthlyData={monthlyListening} 
            hourlyData={hourlyListening} 
          />
        );
      
      case 'history':
        return <RecentHistory records={filteredRecords} />;
      
      case 'analytics':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PlatformBreakdown platformStats={platformStats} />
            <SkipAnalysis skipStats={skipStats} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dashboard
      activeTab={activeTab}
      onTabChange={setActiveTab}
      yearSelector={
        <YearSelector
          years={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      }
    >
      {renderContent()}
    </Dashboard>
  );
}

export default App;
