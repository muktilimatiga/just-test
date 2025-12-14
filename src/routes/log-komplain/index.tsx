// pages/tickets/TicketsPage.tsx

import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AutoTanStackTable } from '@/components/AutoTable';
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/types';
import { 
  RefreshCw, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  Forward, 
  Plus, 
  Filter 
} from 'lucide-react';

// Custom Hooks
import { useSupabaseTickets } from '@/hooks/supabase/useSupabaeTicket';
import { useAppStore } from '@/store'

// Modals
import { CreateTicketModal } from '@/components/modal/TicketModal'

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/50",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/50",
    closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-400 dark:border-white/20"
  };
  // Fallback to 'open' style if status is unknown
  const style = styles[status] || styles['open'];
  
  // Format text: "in_progress" -> "In progress"
  const label = status.replace(/_/g, ' '); 
  
  return (
    <Badge variant="outline" className={`capitalize font-normal border ${style}`}>
      {label}
    </Badge>
  );
};

// --- Main Page Component ---

const LogTicketPage = () => {
  // 1. Data Fetching
  const { data: tickets, loading, refetch } = useSupabaseTickets();
  const updateTicketStatus = {
    mutate: ({ id, status }: { id: string; status: string }) => {
      console.log(`Updating ticket ${id} to status: ${status}`);
      // This is a placeholder implementation
      // In a real app, this would make an API call to update the ticket status
    }
  };
  const { toggleCreateTicketModal } = useAppStore();

  // 2. Local State for Modals
  const [processTicket, setProcessTicket] = useState<Ticket | null>(null);
  const [closeTicket, setCloseTicket] = useState<Ticket | null>(null);
  const [forwardTicket, setForwardTicket] = useState<Ticket | null>(null);

  // 3. Action Handlers
  const handleProcessConfirm = (id: string, status: 'in_progress' | 'closed', note: string) => {
    updateTicketStatus.mutate({ id, status });
    setProcessTicket(null);
    setTimeout(refetch, 500); 
  };

  const handleCloseConfirm = (id: string, note: string) => {
    updateTicketStatus.mutate({ id, status: 'closed' });
    setCloseTicket(null);
    setTimeout(refetch, 500);
  };

  const handleForwardConfirm = (id: string, note: string) => {
    console.log(`Forwarding ticket ${id}: ${note}`);
    updateTicketStatus.mutate({ id, status: 'in_progress' });
    setForwardTicket(null);
    setTimeout(refetch, 500);
  };

  // 4. Column Definitions (Overrides)
  // We only define columns that need CUSTOM rendering.
  // The AutoTable will handle 'id', 'title', 'createdAt', etc. automatically.
  const columnOverrides = useMemo(() => ({
    
    // Custom Badge for Status
    status: {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => <StatusBadge status={row.getValue('status')} />
    },

    // Custom Icon + Text for Assignee
    assigneeId: {
      header: 'Assignee',
      accessorKey: 'assigneeId',
      cell: ({ row }: any) => {
        const val = row.getValue('assigneeId');
        return val ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UserIcon className="h-3 w-3 text-muted-foreground" /> {val}
          </div>
        ) : <span className="text-xs text-slate-400 italic">Unassigned</span>;
      }
    },

    // Custom "Actions" Column
    // This key 'actions' is special (not in DB) but we inject it via AutoTable logic
    actions: {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: any) => {
        const t = row.original as Ticket; // Cast to Ticket type
        return (
          <div className="flex items-center justify-end gap-2">
            
            {/* Action: Process */}
            {t.status === 'open' && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                onClick={(e) => { e.stopPropagation(); setProcessTicket(t); }}
              >
                Process <ArrowRight className="h-3 w-3" />
              </Button>
            )}

            {/* Action: Forward */}
            {t.status === 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={(e) => { e.stopPropagation(); setForwardTicket(t); }}
              >
                Forward <Forward className="h-3 w-3" />
              </Button>
            )}

            {/* Action: Close */}
            {(t.status === 'open' || t.status === 'in_progress') && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[10px] gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={(e) => { e.stopPropagation(); setCloseTicket(t); }}
              >
                Close
              </Button>
            )}

            {/* State: Done */}
            {(t.status === 'resolved' || t.status === 'closed') && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            )}
          </div>
        );
      }
    }
  }), [setProcessTicket, setForwardTicket, setCloseTicket]);

  return (
    <div className="animate-in fade-in duration-500 py-8 space-y-4">
      
      {/* --- Modals --- */}
      {processTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Process Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to process this ticket?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProcessTicket(null)}>Cancel</Button>
              <Button onClick={() => handleProcessConfirm(processTicket.id, 'in_progress', '')}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
      
      {closeTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Close Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to close this ticket?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCloseTicket(null)}>Cancel</Button>
              <Button onClick={() => handleCloseConfirm(closeTicket.id, '')}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
      
      {forwardTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Forward Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to forward this ticket?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setForwardTicket(null)}>Cancel</Button>
              <Button onClick={() => handleForwardConfirm(forwardTicket.id, '')}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Header / Toolbar --- */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
         
         <div className="flex gap-2">
            <Button variant="ghost" onClick={refetch} disabled={loading} className="bg-background">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button variant="outline" className="bg-background">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button onClick={toggleCreateTicketModal} className="md:hidden">
              <Plus className="mr-2 h-4 w-4" /> New Ticket
            </Button>
         </div>
      </div>

      <AutoTanStackTable<Ticket>
        data={tickets}
        columnOverrides={columnOverrides}
        pageSize={10}
      />
    </div>
  );
};

export const Route = createFileRoute('/log-komplain/')({
  component: LogTicketPage,
})