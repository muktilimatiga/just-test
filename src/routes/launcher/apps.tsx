import * as React from 'react';
import { 
  Wifi, 
  Database, 
  ScrollText, 
  LayoutTemplate, 
  Plus, 
  Loader2,
  Activity,
  Ticket
} from 'lucide-react';

export interface AppItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  to?: string;
  color: string;
  iconColor: string;
  isEmpty?: boolean;
  isAction?: boolean;
}

export const APPS_CONFIG: AppItem[] = [
  {
    id: 'new',
    title: 'Add New',
    subtitle: 'Install app',
    icon: Plus,
    // Dashed border, solid card background (background or very light grey)
    color: 'bg-background border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-all',
    iconColor: 'text-foreground',
    isAction: true
  },
  {
    id: 'analytics',
    title: 'Overview',
    subtitle: 'Traffic & Stats',
    icon: Activity,
    to: '/overview',
    // Solid card
    color: 'bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
    iconColor: 'text-blue-600'
  },
  {
    id: 'broadband',
    title: 'Broadband',
    subtitle: 'Network status',
    icon: Wifi,
    to: '/monitor',
    color: 'bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
    iconColor: 'text-zinc-500' 
  },
  {
    id: 'database',
    title: 'Database',
    subtitle: 'Data management',
    icon: Database,
    to: '/database',
    color: 'bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
    iconColor: 'text-zinc-500' 
  },
  {
    id: 'logs',
    title: 'Logs',
    subtitle: 'System logs',
    icon: ScrollText,
    to: '/logs',
    color: 'bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
    iconColor: 'text-zinc-500'
  },
  {
    id: 'template',
    title: 'Template',
    subtitle: 'Layouts',
    icon: LayoutTemplate,
    to: '/topology',
    color: 'bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
    iconColor: 'text-zinc-500'
  },
  {
    id: 'tickets',
    title: 'Transactions',
    subtitle: 'Ticket management',
    icon: Ticket,
    to: '/tickets',
    color: 'bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
    iconColor: 'text-blue-600'
  },
  {
    id: 'empty',
    title: 'Empty Slot',
    subtitle: 'Available space',
    icon: Loader2,
    // Faded solid background
    color: 'bg-secondary/30 border-2 border-dashed border-border opacity-60 hover:opacity-100 transition-opacity',
    iconColor: 'text-muted-foreground',
    isEmpty: true
  }
];
