import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, SkipForward, Shuffle } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import type { SpotifyStreamingRecord } from '../../types/spotify';
import { formatDuration } from '../../utils/dataProcessing';

interface RecentHistoryProps {
  records: SpotifyStreamingRecord[];
}

const ITEMS_PER_PAGE = 20;

export function RecentHistory({ records }: RecentHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter records with valid track names and search query
  const filteredRecords = useMemo(() => {
    const validRecords = records
      .filter((r) => r.master_metadata_track_name)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

    if (!searchQuery.trim()) return validRecords;

    const query = searchQuery.toLowerCase();
    return validRecords.filter(
      (r) =>
        r.master_metadata_track_name?.toLowerCase().includes(query) ||
        r.master_metadata_album_artist_name?.toLowerCase().includes(query) ||
        r.master_metadata_album_album_name?.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader 
        title="Listening History" 
        subtitle={`${filteredRecords.length.toLocaleString()} records found`}
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search tracks, artists, or albums..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-white/50 text-sm border-b border-white/10">
              <th className="pb-3 font-medium">Track</th>
              <th className="pb-3 font-medium hidden sm:table-cell">Artist</th>
              <th className="pb-3 font-medium hidden md:table-cell">Platform</th>
              <th className="pb-3 font-medium text-right">Duration</th>
              <th className="pb-3 font-medium text-right hidden lg:table-cell">Date</th>
              <th className="pb-3 font-medium text-center w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((record, index) => (
              <tr
                key={`${record.ts}-${index}`}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 pr-4">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
                      {record.master_metadata_track_name}
                    </p>
                    <p className="text-white/50 text-sm sm:hidden truncate">
                      {record.master_metadata_album_artist_name}
                    </p>
                  </div>
                </td>
                <td className="py-4 pr-4 hidden sm:table-cell">
                  <p className="text-white/70 truncate max-w-[150px]">
                    {record.master_metadata_album_artist_name || 'Unknown'}
                  </p>
                </td>
                <td className="py-4 pr-4 hidden md:table-cell">
                  <span className="px-2 py-1 rounded-md bg-white/5 text-white/60 text-xs capitalize">
                    {record.platform}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <span className="text-white/70 text-sm">
                    {formatDuration(record.ms_played)}
                  </span>
                </td>
                <td className="py-4 text-right hidden lg:table-cell">
                  <div>
                    <p className="text-white/70 text-sm">{formatDate(record.ts)}</p>
                    <p className="text-white/40 text-xs">{formatTime(record.ts)}</p>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-center gap-1">
                    {record.skipped && (
                      <span className="p-1 rounded bg-accent-pink/10" title="Skipped">
                        <SkipForward className="w-4 h-4 text-accent-pink" />
                      </span>
                    )}
                    {record.shuffle && (
                      <span className="p-1 rounded bg-accent-gold/10" title="Shuffle">
                        <Shuffle className="w-4 h-4 text-accent-gold" />
                      </span>
                    )}
                    {!record.skipped && !record.shuffle && (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <p className="text-white/50 text-sm">
            Showing {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredRecords.length)} of{' '}
            {filteredRecords.length.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((page, index) =>
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 text-white/40">
                    ...
                  </span>
                )
              )}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

