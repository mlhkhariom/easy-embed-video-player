
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlaySquare,
  Settings,
  Film,
  Tv,
  Layers,
  CloudLightning,
  FileVideo
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={`h-screen w-64 bg-sidebar-background border-r border-border ${className}`}>
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="font-semibold text-lg">Admin Panel</span>
      </div>
      <nav className="space-y-1 p-4">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
          end
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/content"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Layers className="h-4 w-4" />
          <span>Content</span>
        </NavLink>

        <NavLink
          to="/admin/media"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <FileVideo className="h-4 w-4" />
          <span>Media</span>
        </NavLink>

        <NavLink
          to="/admin/player"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <PlaySquare className="h-4 w-4" />
          <span>Player</span>
        </NavLink>

        <NavLink
          to="/admin/livetv"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Tv className="h-4 w-4" />
          <span>Live TV</span>
        </NavLink>
        
        <NavLink
          to="/admin/cloudstream"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <CloudLightning className="h-4 w-4" />
          <span>CloudStream</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </NavLink>
        
        <div className="pt-4">
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            View Site
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            target="_blank"
          >
            <Film className="h-4 w-4" />
            <span>Open Site</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
