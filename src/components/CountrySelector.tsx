
import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SupportedCountry, CountryOption } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const countryOptions: CountryOption[] = [
  {
    id: 'global',
    name: 'Global',
    flag: '🌎',
    region: 'Global',
    language: 'English'
  },
  {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    language: 'English'
  },
  {
    id: 'in',
    name: 'India',
    flag: '🇮🇳',
    region: 'South Asia',
    language: 'Hindi'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    language: 'English'
  }
];

export const CountrySelector = () => {
  const { settings, setSelectedCountry } = useAdmin();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentCountry = countryOptions.find(c => c.id === settings.selectedCountry) || countryOptions[0];
  
  const handleSelectCountry = (country: SupportedCountry) => {
    setSelectedCountry(country);
    setIsOpen(false);
    
    toast({
      title: "Region Changed",
      description: `Content will now be shown for ${countryOptions.find(c => c.id === country)?.name}`,
      duration: 3000,
    });
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <span className="text-lg">{currentCountry.flag}</span>
          <span className="hidden md:inline">{currentCountry.name}</span>
          <ChevronDown size={14} className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-60 bg-gradient-to-br from-moviemate-card/80 to-moviemate-card/95 backdrop-blur-xl border border-white/10"
        )}
      >
        {countryOptions.map((country) => (
          <DropdownMenuItem
            key={country.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
              settings.selectedCountry === country.id ? 'bg-moviemate-primary/20' : ''
            )}
            onClick={() => handleSelectCountry(country.id)}
          >
            <span className="text-xl">{country.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{country.name}</span>
              <span className="text-xs text-gray-400">{country.region} • {country.language}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
