
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  minimal?: boolean;
  className?: string;
}

const SearchBar = ({ minimal = false, className = '' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      inputRef.current?.blur();
    }
  };
  
  // Handle keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !minimal) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minimal]);
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={`${className} relative transition-all ${
        minimal 
          ? 'w-full' 
          : isFocused 
            ? 'w-full max-w-lg' 
            : 'w-full max-w-xs'
      }`}
    >
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder={minimal ? "Search" : "Search movies, TV shows..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`peer w-full rounded-full border border-gray-700 bg-gray-800/50 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none backdrop-blur-lg transition-all focus:border-moviemate-primary focus:ring-1 focus:ring-moviemate-primary ${
            minimal ? 'h-10' : 'h-12'
          }`}
        />
        <div className="absolute left-3 text-gray-400 peer-focus:text-moviemate-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        {!minimal && !isFocused && (
          <div className="absolute right-3 rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
            /
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
