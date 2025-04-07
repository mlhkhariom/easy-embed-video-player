
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '../ui/animations';
import { GlassCard } from '../ui/effects';

interface WebSeriesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterYear: string;
  onYearChange: (value: string) => void;
  filterLanguage: string;
  onLanguageChange: (value: string) => void;
  onResetFilters: () => void;
  showAdvancedFilters: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const WebSeriesFilters = ({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  filterLanguage,
  onLanguageChange,
  onResetFilters,
  showAdvancedFilters,
  onSubmit
}: WebSeriesFiltersProps) => {
  return (
    <>
      <form onSubmit={onSubmit} className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search web series..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </form>
      
      {showAdvancedFilters && (
        <ScrollReveal>
          <GlassCard intensity="medium" className="p-6 mb-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Release Year
                </label>
                <Input
                  type="number"
                  placeholder="Filter by year (e.g., 2023)"
                  value={filterYear}
                  onChange={(e) => onYearChange(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Language
                </label>
                <select
                  className="w-full p-2 rounded-md bg-card text-white border border-input"
                  value={filterLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                >
                  <option value="">All Languages</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <Button onClick={onResetFilters} variant="outline">
                  Reset Filters
                </Button>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      )}
    </>
  );
};

export default WebSeriesFilters;
