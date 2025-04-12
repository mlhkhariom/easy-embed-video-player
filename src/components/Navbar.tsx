
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
import { Tv, Film, Radio, TrendingUp, ListFilter, Cloud, Settings, Home, History, Clock, ChevronDown, Languages } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, isAuthenticated } = useAdmin();
  const isMobile = useIsMobile();
  
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
  
  const primaryNavItems = [
    { label: 'Home', path: '/', icon: <Home size={16} /> },
    { label: 'Movies', path: '/movies', icon: <Film size={16} /> },
    { label: 'Web Series', path: '/tv', icon: <Tv size={16} /> },
    { label: 'TV Serials', path: '/tv-serials', icon: <Languages size={16} /> },
  ];
  
  const secondaryNavItems = [
    { label: 'Live TV', path: '/live-tv', isConditional: true, enabledSetting: 'enableLiveTV', icon: <Radio size={16} /> },
    { label: 'CloudStream', path: '/cloudstream', isConditional: true, enabledSetting: 'enableCloudStream', icon: <Cloud size={16} /> },
    { label: 'Trending', path: '/trending', icon: <TrendingUp size={16} /> },
    { label: 'History', path: '/history', icon: <History size={16} /> },
  ];
  
  // Filter out conditional nav items based on settings
  const filteredSecondaryNavItems = secondaryNavItems.filter(item => 
    !item.isConditional || settings[item.enabledSetting as keyof typeof settings]
  );
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Animation variants
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-moviemate-background/95 shadow-lg backdrop-blur-lg'
          : 'bg-gradient-to-b from-moviemate-background to-transparent'
      }`}
    >
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
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
              <span className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>
                {settings.siteName || 'FreeCinema'}
              </span>
            </Link>
            
            {/* Primary Navigation - Desktop */}
            {!isMobile && (
              <div className="ml-3 md:ml-6 hidden md:flex md:items-center md:gap-1">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium transition-all hover:bg-moviemate-card ${
                      isActive(item.path)
                        ? 'bg-moviemate-primary text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Dropdown for secondary nav items */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:bg-moviemate-card hover:text-white"
                    >
                      More <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-moviemate-card/95 backdrop-blur-md w-48">
                    {filteredSecondaryNavItems.map((item) => (
                      <DropdownMenuItem 
                        key={item.path} 
                        className={cn(
                          "cursor-pointer",
                          isActive(item.path) && "bg-moviemate-primary/20 text-moviemate-primary"
                        )}
                        onClick={() => navigate(item.path)}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {/* Right Side - Desktop */}
          <div className="hidden sm:flex items-center gap-3 md:gap-4">
            <SearchBar minimal={isMobile} />
            
            {!isMobile && (
              /* User Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 border border-moviemate-primary/30">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-moviemate-card text-white">U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-moviemate-card/95 backdrop-blur-md">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/history')}>
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Watch History</span>
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  {!isAuthenticated && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/login')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Login</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Mobile Menu Button and Search */}
          <div className="flex items-center gap-2 sm:hidden">
            <SearchBar minimal />
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-full bg-moviemate-card/80 p-2"
              aria-label="Toggle menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
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
        </div>
        
        {/* Mobile Menu with animations */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="overflow-hidden sm:hidden border-t border-gray-800 py-3"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
            >
              <div className="grid grid-cols-2 gap-2">
                {primaryNavItems.map((item) => (
                  <motion.div key={item.path} variants={mobileMenuItemVariants}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-moviemate-primary text-white'
                          : 'text-gray-300 hover:bg-moviemate-card hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {filteredSecondaryNavItems.map((item) => (
                  <motion.div key={item.path} variants={mobileMenuItemVariants}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-moviemate-primary text-white'
                          : 'text-gray-300 hover:bg-moviemate-card hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Bottom actions for mobile */}
                <motion.div variants={mobileMenuItemVariants} className="col-span-2">
                  <hr className="border-gray-800 my-2" />
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <Link
                    to="/history"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-moviemate-card hover:text-white"
                  >
                    <History size={16} />
                    Watch History
                  </Link>
                </motion.div>
                
                <motion.div variants={mobileMenuItemVariants}>
                  {isAuthenticated ? (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-moviemate-card hover:text-white"
                    >
                      <Settings size={16} />
                      Admin
                    </Link>
                  ) : (
                    <Link
                      to="/admin/login"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-moviemate-card hover:text-white"
                    >
                      <Settings size={16} />
                      Admin Login
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
