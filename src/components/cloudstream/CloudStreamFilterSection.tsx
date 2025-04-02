
import { useState } from 'react';
import { CLOUDSTREAM_SOURCES, CloudStreamSource } from '@/services/cloudstream';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CloudStreamSourceCard from './CloudStreamSourceCard';

interface CloudStreamFilterSectionProps {
  selectedSources: string[];
  toggleSource: (name: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  isLoading: boolean;
  categories: string[];
  groupedSources: Record<string, CloudStreamSource[]>;
}

const CloudStreamFilterSection = ({
  selectedSources,
  toggleSource,
  applyFilters,
  clearFilters,
  isLoading,
  categories,
  groupedSources
}: CloudStreamFilterSectionProps) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    indian: true // Start with Indian category open
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select Content Sources:</h3>
      
      <div className="space-y-2">
        {categories.map(category => (
          <Collapsible
            key={category}
            open={openCategories[category]}
            onOpenChange={() => toggleCategory(category)}
            className="border border-gray-700 rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 bg-moviemate-card/50 hover:bg-moviemate-card transition-colors">
              <span className="capitalize font-medium">{category === 'indian' ? 'Indian Content' : category}</span>
              {openCategories[category] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 space-y-2">
              {(groupedSources[category] || []).map(source => (
                <CloudStreamSourceCard
                  key={source.name}
                  source={source}
                  isSelected={selectedSources.includes(source.name)}
                  onToggle={toggleSource}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default CloudStreamFilterSection;
