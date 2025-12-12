import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle, CheckCheck, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, Button } from './ui';
import { Badge } from './ui/badge';
import { useAppStore } from '@/store';
import { useNavigate } from '@tanstack/react-router';

export const NotificationDropdown = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } = useAppStore();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleItemClick = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.link) navigate({ to: n.link });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                    "h-9 w-9 rounded-lg transition-colors border border-transparent",
                    unreadCount > 0 
                        ? "text-primary bg-primary/10 hover:bg-primary/20 border-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
            >
                <Bell className={cn("h-4 w-4", unreadCount > 0 && "fill-current")} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
                )}
            </Button>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[400px] p-0 overflow-hidden bg-popover border border-border shadow-xl rounded-xl ring-0">
         {/* Header */}
         <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] bg-red-100 text-red-600 hover:bg-red-200 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800 shadow-none font-semibold">
                        {unreadCount} new
                    </Badge>
                )}
            </div>
            <div className="flex gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md" 
                    title="Mark all read" 
                    onClick={(e) => { e.stopPropagation(); markAllNotificationsAsRead(); }}
                >
                    <CheckCheck className="h-3.5 w-3.5" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md" 
                    title="Clear all" 
                    onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
         </div>
         
         {/* List */}
         <div className="max-h-[450px] overflow-y-auto bg-card">
            {notifications.length === 0 ? (
                <div className="py-16 px-8 text-center flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                        <Bell className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">All caught up!</p>
                        <p className="text-xs text-muted-foreground">No new notifications to display.</p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {notifications.map((n) => (
                        <div 
                            key={n.id}
                            onClick={() => handleItemClick(n)}
                            className={cn(
                                "flex gap-4 p-4 transition-colors cursor-pointer group relative",
                                !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-card hover:bg-secondary"
                            )}
                        >
                            {/* Icon */}
                            <div className={cn(
                                "mt-0.5 h-10 w-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                n.type === 'success' && "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800",
                                n.type === 'warning' && "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800",
                                n.type === 'error' && "bg-red-100 text-red-600 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",
                                n.type === 'info' && "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800",
                            )}>
                                {n.type === 'success' && <CheckCircle className="h-5 w-5" />}
                                {n.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                                {n.type === 'error' && <XCircle className="h-5 w-5" />}
                                {n.type === 'info' && <Info className="h-5 w-5" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex justify-between items-start">
                                    <p className={cn("text-sm font-semibold leading-tight", !n.read ? "text-foreground" : "text-foreground/80")}>
                                        {n.title}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                    {n.message}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1.5">
                                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                                    <p className="text-[10px] text-muted-foreground font-medium font-mono uppercase tracking-wide">
                                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Unread Indicator */}
                            {!n.read && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-900" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
         </div>
         
         {/* Footer */}
         <div className="p-2 border-t border-border bg-surface text-center">
            <div
                className="w-full text-xs text-muted-foreground h-7 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => navigate({ to: '/logs' as any })}
            >
                View Notification History
            </div>
         </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};