import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  MoonStar, 
  Sun, 
  Menu, 
  X, 
  Settings, 
  Film, 
  Radio, 
  Home, 
  Cloud,
  Upload,
  RefreshCw,
  Layers,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AdminErrorBoundary from './AdminErrorBoundary';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout, settings } = useAdmin();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} mode`,
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
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { path: '/admin/content', label: 'Content', icon: <Film className="mr-2 h-4 w-4" /> },
    { path: '/admin/live-tv', label: 'Live TV', icon: <Radio className="mr-2 h-4 w-4" /> },
    { path: '/admin/cloudstream', label: 'CloudStream', icon: <Cloud className="mr-2 h-4 w-4" /> },
    { path: '/admin/player', label: 'Player', icon: <Layers className="mr-2 h-4 w-4" /> },
    { path: '/admin/media', label: 'Media', icon: <Upload className="mr-2 h-4 w-4" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  const renderMenuItems = () => (
    <ul className="space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? `bg-primary text-primary-foreground`
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => isMobile && setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderHeader = () => (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {isMobile && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <MoonStar className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const sidebar = (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="px-3 py-2">
        <Link to="/admin" className="flex items-center mb-8">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-6 w-auto mr-2" />
          ) : null}
          <span className="font-semibold text-xl">{settings.siteName || 'Admin'}</span>
        </Link>
        {renderMenuItems()}
      </div>
      
      {isMobile && (
        <div className="px-3 pt-2 border-t mt-auto">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <AdminErrorBoundary>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="left" className="w-[240px] p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
        ) : (
          <div className="hidden border-r bg-background md:block">
            {sidebar}
          </div>
        )}
        
        <div className="flex min-h-screen flex-col">
          {renderHeader()}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminErrorBoundary>
  );
};

export default AdminLayout;
