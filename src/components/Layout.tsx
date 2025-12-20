import { useEffect, useState } from 'react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { cn } from '../lib/utils';
import {
  Ticket as TicketIcon,
  Settings,
  Users,
  Search,
  Sun,
  Moon,
  Terminal,
  Network,
  LifeBuoy,
  Monitor,
  LogOut,
  Sparkles,
  Activity,
  Home,
  Database,
  Plus,
  ScrollText,
  Check,
  Menu,
  X
} from 'lucide-react';
import { Toaster } from 'sonner';
import {
  Button,
  Tooltip as TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './ui';
import { NotificationDropdown } from './NotificationDropdown';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@/types';
import { useAppStore } from '@/store';

// Helper component to match existing usage
const Tooltip = ({ text, children }: { text: React.ReactNode; children: React.ReactNode }) => (
  <TooltipRoot>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent>
      {text}
    </TooltipContent>
  </TooltipRoot>
);

// --- Sidebar Icon / Item Component ---
interface SidebarIconProps {
  icon: any;

  label: string;
  to?: string;
  isActive?: boolean;
  onClick?: () => void;
  isSidebarCollapsed: boolean;
  badgeCount?: number;
  badgeVariant?: 'destructive' | 'warning' | 'success' | 'info';
}

const SidebarIcon = ({
  icon: Icon,
  label,
  to,
  isActive,
  onClick,
  isSidebarCollapsed,
  badgeCount,
  badgeVariant = 'destructive'
}: SidebarIconProps) => {

  const getBadgeStyles = () => {
    switch (badgeVariant) {
      case 'warning': return "bg-amber-500 text-white";
      case 'success': return "bg-emerald-500 text-white";
      case 'info': return "bg-blue-600 text-white";
      case 'destructive': default: return "bg-red-500 text-white";
    }
  };

  const getDotStyles = () => {
    switch (badgeVariant) {
      case 'warning': return "bg-amber-500";
      case 'success': return "bg-emerald-500";
      case 'info': return "bg-blue-500";
      case 'destructive': default: return "bg-red-500";
    }
  };

  const content = (
    <div
      className={cn(
        "relative flex items-center transition-all duration-200 ease-out group select-none",
        isSidebarCollapsed
          ? "w-10 h-10 justify-center rounded-lg mx-auto mb-2"
          : "px-3 py-2.5 gap-3 rounded-lg mx-2 mb-1",

        isActive
          ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-black"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      )}
    >
      <Icon
        strokeWidth={isActive ? 2.5 : 2}
        className={cn(
          "shrink-0 transition-all",
          isSidebarCollapsed ? "h-5 w-5" : "h-4 w-4",
        )}
      />

      {!isSidebarCollapsed && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1 tracking-tight">
          {label}
        </span>
      )}

      {!isSidebarCollapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto min-w-[18px] text-center",
          getBadgeStyles()
        )}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}

      {isSidebarCollapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className={cn(
          "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-black",
          getDotStyles()
        )} />
      )}
    </div>
  );

  const wrapperClass = "block w-full focus:outline-none relative";

  if (isSidebarCollapsed) {
    const wrapped = (
      <Tooltip text={label + (badgeCount ? ` (${badgeCount})` : '')}>
        {content}
      </Tooltip>
    );
    return to ? (
      <Link to={to} className={wrapperClass}>{wrapped}</Link>
    ) : (
      <button onClick={onClick} className={wrapperClass}>{wrapped}</button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn(wrapperClass, "text-left")}>
      {content}
    </button>
  );
};

// Mobile Sidebar Overlay
const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex md:hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <aside className="relative w-64 h-full bg-white dark:bg-black border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="font-bold text-lg tracking-tight">Nexus Dashboard</span>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarContent collapsed={false} onNavClick={onClose} />
        </div>
      </aside>
    </div>
  );
};

const SidebarContent = ({ collapsed, onNavClick }: { collapsed: boolean, onNavClick?: () => void }) => {
  const { logout } = useAppStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <>
      <div className="flex flex-col w-full gap-1 px-2">
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Home} label="Launcher" to="/" isActive={isActive('/')} onClick={onNavClick} />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Search} label="Search" to="/search" isActive={isActive('/search')} onClick={onNavClick} />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Activity} label="Overview" to="/overview" isActive={isActive('/overview')} onClick={onNavClick} />
        <SidebarIcon
          isSidebarCollapsed={collapsed}
          icon={TicketIcon}
          label="Log Komplain"
          to="/log-komplain"
          isActive={isActive('/log-komplain')}
          badgeCount={0}
          badgeVariant="destructive"
          onClick={onNavClick}
        />
        <SidebarIcon
          isSidebarCollapsed={collapsed}
          icon={TicketIcon}
          label="Tickets"
          to="/tickets"
          isActive={isActive('/tickets')}
          badgeCount={0}
          badgeVariant="destructive"
          onClick={onNavClick}
        />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Users} label="Customers" to="/customers" isActive={isActive('/customers')} onClick={onNavClick} />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Network} label="Topology" to="/topology" isActive={isActive('/topology')} onClick={onNavClick} />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Network} label="Maps" to="/maps" isActive={isActive('/maps')} onClick={onNavClick} />
        <SidebarIcon
          isSidebarCollapsed={collapsed}
          icon={Monitor}
          label="Monitor"
          to="/monitor"
          isActive={isActive('/monitor')}
          badgeCount={0}
          badgeVariant="destructive"
          onClick={onNavClick}
        />
      </div>

      <div className={cn("flex flex-col w-full mt-4 pt-4 border-t border-slate-100 dark:border-white/10 gap-1 px-2")}>
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Database} label="Database" to="/database" isActive={isActive('/database')} onClick={onNavClick} />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={ScrollText} label="Logs" to="/logs" isActive={isActive('/logs')} onClick={onNavClick} />
        <SidebarIcon isSidebarCollapsed={collapsed} icon={LifeBuoy} label="Help Center" to="/help" isActive={isActive('/help')} onClick={onNavClick} />
      </div>

      <div className="mt-auto p-2 shrink-0 pb-6 flex flex-col gap-2 items-center border-t border-slate-100 dark:border-white/10 pt-4">
        <SidebarIcon isSidebarCollapsed={collapsed} icon={Settings} label="Settings" to="/settings" isActive={isActive('/settings')} onClick={onNavClick} />

        {collapsed ? (
          <Tooltip text="Log out">
            <button
              onClick={() => { logout(); if (onNavClick) onNavClick(); }}
              className="relative flex items-center justify-center transition-all duration-200 group rounded-lg w-10 h-10 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="shrink-0 h-5 w-5" strokeWidth={2} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => { logout(); if (onNavClick) onNavClick(); }}
            className="flex items-center gap-3 w-full px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        )}
      </div>
    </>
  );
};

export const Sidebar = () => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen hidden md:flex flex-col transition-all duration-300 ease-in-out border-r",
        "bg-white dark:bg-black border-slate-200 dark:border-slate-800",
        "w-[64px]"
      )}
    >
      <div className="flex-1 overflow-y-auto pt-20 pb-4 scrollbar-none flex flex-col items-center">
        <SidebarContent collapsed={true} />
      </div>
    </aside>
  );
};

export const Navbar = ({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) => {
  const { theme, toggleTheme, toggleCli, toggleAIChat, isCliOpen, user, setCreateTicketModalOpen, login, logout } = useAppStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users for switcher
    const loadUsers = async () => {
      const { data } = await supabase.from('users').select('*').limit(10);
      if (data) {
        setUsers(data.map((u: User) => ({
          name: u.full_name || u.username || 'User',
          email: u.username || '',
          role: u.role || 'user',
        })));
      }
    };
    loadUsers();
  }, []);

  const pageTitle = () => {
    const path = currentPath.split('/')[1] || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 flex h-16 items-center justify-between px-4 md:px-8 transition-all duration-300 ease-in-out backdrop-blur-md",
        "bg-white/80 dark:bg-black/80 border-b border-slate-200 dark:border-slate-800",
        "left-0 md:left-[64px]"
      )}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobileMenu}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{pageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden lg:block mr-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            className="h-9 w-64 rounded-full bg-slate-100 dark:bg-slate-900/50 pl-9 pr-4 text-xs outline-none placeholder:text-slate-500 text-slate-900 dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:bg-white dark:focus:bg-black"
            placeholder="Global search (Ctrl+K)..."
          />
        </div>

        <div className="flex items-center gap-1">
          {currentPath.includes('/tickets') && (
            <Button onClick={() => setCreateTicketModalOpen(true)} size="sm" className="hidden md:flex h-8 gap-2 mr-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4">
              <Plus className="h-3.5 w-3.5" /> New Ticket
            </Button>
          )}

          <Tooltip text="AI Assistant">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAIChat}
              className="h-9 w-9 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 rounded-full"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip text="Terminal">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCli}
              className={cn(
                "h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full",
                isCliOpen && "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
              )}
            >
              <Terminal className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip text="Toggle Theme">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 rounded-full"
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>

          <NotificationDropdown />
        </div>

        <div className="pl-2 border-l border-slate-200 dark:border-slate-800 ml-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500/20 transition-all">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal p-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 pt-2">Switch Account</DropdownMenuLabel>
              {users.map((u) => (
                <DropdownMenuItem key={u.id} onClick={() => login(u)}>
                  <div className="flex items-center gap-3 w-full cursor-pointer py-1">
                    <Avatar className="h-6 w-6 text-[10px]">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1 truncate">{u.name}</span>
                    {user?.id === u.id && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export const AppLayout = () => {
  const { theme, isCreateTicketModalOpen, setCreateTicketModalOpen, fetchUser } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Initialize user session from Supabase
    fetchUser();
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/20">
      <Sidebar />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          "pt-24 pb-12 px-4 md:px-8", // Increased padding top/bottom and responsiveness
          "pl-4 md:pl-[88px]" // Responsive left padding for sidebar
        )}
      >
        <Outlet />
      </main>

      <Toaster position="bottom-right" theme={theme as 'light' | 'dark'} />
    </div>
  );
};