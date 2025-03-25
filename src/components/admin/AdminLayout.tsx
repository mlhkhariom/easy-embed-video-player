
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/ui/use-toast';
import { MoonStar, Sun, Menu, X, Settings, Film, Radio, Home, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout } = useAdmin();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    toast({
      title: "Theme Changed",
      description: `Switched to ${theme === 'light' ? 'dark' : 'light'} mode`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/admin/content', label: 'Content', icon: <Film className="mr-2 h-4 w-4" /> },
    { path: '/admin/live-tv', label: 'Live TV', icon: <Radio className="mr-2 h-4 w-4" /> },
    { path: '/admin/cloudstream', label: 'CloudStream', icon: <Cloud className="mr-2 h-4 w-4" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  const renderMenuItems = () => (
    <ul className="space-y-2">
      {menuItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
              location.pathname === item.path
                ? 'bg-moviemate-primary text-white'
                : 'hover:bg-moviemate-card/50 text-gray-300 hover:text-white'
            }`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const sidebar = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/admin" className="flex items-center">
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        {renderMenuItems()}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Dark Mode</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <MoonStar className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full border-gray-700"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 md:hidden"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] border-r border-gray-700 bg-moviemate-background p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="hidden border-r border-gray-700 bg-moviemate-background md:block">
          {sidebar}
        </div>
      )}
      <main className="bg-moviemate-background">{children}</main>
    </div>
  );
};

export default AdminLayout;
