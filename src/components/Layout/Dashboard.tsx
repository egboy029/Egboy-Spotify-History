import type { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Clock, 
  History, 
  PieChart,
  Music2
} from 'lucide-react';
import type { TabType } from '../../types/spotify';

interface DashboardProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: ReactNode;
  yearSelector?: ReactNode;
}

const tabs: { id: TabType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'top-charts', label: 'Top Charts', icon: TrendingUp },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

export function Dashboard({ activeTab, onTabChange, children, yearSelector }: DashboardProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-dark/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent-pink to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold gradient-text">Egboy's Spotify History</h1>
              </div>
            </div>
            
            {/* Year Selector in header for desktop */}
            <div className="hidden lg:block">
              {yearSelector}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 z-40 backdrop-blur-xl bg-bg-dark/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30 shadow-lg shadow-primary/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Year Selector for mobile */}
          <div className="lg:hidden pb-3">
            {yearSelector}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/40 text-sm">
            Built with your Spotify Extended Streaming History data
          </p>
        </div>
      </footer>
    </div>
  );
}

