
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { Tv, Film, Radio, TrendingUp, ListFilter } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Web Series', path: '/tv' },
    { label: 'Live TV', path: '/live-tv' },
    { label: 'Trending', path: '/trending' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-moviemate-background/95 shadow-lg backdrop-blur-lg'
          : 'bg-gradient-to-b from-moviemate-background to-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-moviemate-primary"
            >
              <path d="m7 2 8 4-8 4 8 4-8 4 8 4"></path>
            </svg>
            <span className="hidden md:inline">FreeCinema</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-moviemate-card ${
                  isActive(item.path)
                    ? 'bg-moviemate-primary text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Search */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center md:hidden"
            aria-label="Toggle menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-white"
            >
              {isMobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12"></path>
              ) : (
                <path d="M4 12h16M4 6h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-slide-down border-t border-gray-800 py-4 md:hidden">
            <div className="mb-4">
              <SearchBar minimal />
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-moviemate-primary text-white'
                      : 'text-gray-300 hover:bg-moviemate-card hover:text-white'
                  }`}
                >
                  {item.label === 'Home' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>}
                  {item.label === 'Movies' && <Film size={18} />}
                  {item.label === 'Web Series' && <Tv size={18} />}
                  {item.label === 'Live TV' && <Radio size={18} />}
                  {item.label === 'Trending' && <TrendingUp size={18} />}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
