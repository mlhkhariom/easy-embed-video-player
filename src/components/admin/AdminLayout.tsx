
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Settings,
  Radio,
  Film,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, settings } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      path: '/admin/settings',
      label: 'Site Settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      path: '/admin/live-tv',
      label: 'Live TV',
      icon: <Radio className="h-5 w-5" />
    },
    {
      path: '/admin/content',
      label: 'Content',
      icon: <Film className="h-5 w-5" />
    },
    {
      path: '/',
      label: 'View Site',
      icon: <Home className="h-5 w-5" />
    }
  ];
  
  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out of the admin panel',
    });
    navigate('/admin/login');
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-moviemate-background">
      {/* Mobile sidebar toggle button */}
      <button
        className="fixed left-4 top-4 z-50 block rounded-full bg-moviemate-primary p-2 text-white shadow-lg md:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-moviemate-card/90 backdrop-blur-md transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-20 items-center justify-center border-b border-gray-800">
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <Film className="h-6 w-6 text-moviemate-primary" />
            <span>{settings.siteName} Admin</span>
          </Link>
        </div>
        
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.path
                        ? "bg-moviemate-primary/20 text-moviemate-primary"
                        : "text-gray-400 hover:bg-moviemate-background hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                    {location.pathname === item.path && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
            
            <Separator className="my-4 bg-gray-800" />
            
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-red-900/20 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </Button>
          </div>
        </ScrollArea>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
