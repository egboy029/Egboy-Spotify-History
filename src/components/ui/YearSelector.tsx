interface YearSelectorProps {
  years: number[];
  selectedYear: number | 'all';
  onYearChange: (year: number | 'all') => void;
}

export function YearSelector({ years, selectedYear, onYearChange }: YearSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onYearChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          selectedYear === 'all'
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        All Time
      </button>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedYear === year
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

