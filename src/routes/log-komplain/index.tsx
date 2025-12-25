import { useState, useMemo, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { AutoTanStackTable } from '@/components/AutoTable';
import { Button } from '@/components/ui/button';
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
import { useTicketStore, type TicketMode } from '@/store/ticketStore';

// Custom Hooks
import { useSupabaseTickets } from '@/hooks/supabase/useSupabaeTicket';
import { ColumnFilter } from '@/components/ColumnFilter';

// Unified Modal
import { TicketModal } from '@/components/modal/openTicketModal';

// --- Helper Components ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    open: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50",
    proses: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50",
    "fwd teknis": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50",
    done: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50",
  };

  const style = styles[status] || styles['open'];
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
  const { data: tickets = [], isFetching, refetch } = useSupabaseTickets();

  // 2. Store Actions
  const initializeFromTicket = useTicketStore((state) => state.initializeFromTicket);
  const resetStore = useTicketStore((state) => state.reset);

  // 3. Local Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    mode: TicketMode;
    ticketData?: Ticket;
  }>({
    isOpen: false,
    mode: 'create',
    ticketData: undefined
  });

  // 4. Modal Handlers
  const openModal = useCallback((mode: TicketMode, ticket?: Ticket) => {
    // 1. Prepare Store Data
    if (ticket) {
      // Load existing ticket data into the generic store
      initializeFromTicket(ticket);
    } else {
      // Clear store for a new ticket
      resetStore();
    }

    // 2. Open Modal with the Data attached
    setModalConfig({
      isOpen: true,
      mode,
      ticketData: ticket
    });

  }, [initializeFromTicket, resetStore]);

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // 5. Column Definitions
  const columnOverrides = useMemo<Partial<Record<keyof Ticket | 'actions', ColumnDef<Ticket>>>>(() => ({
    status: {
      accessorKey: "status",
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: "equalsString",
      meta: {
        filterType: "select",
        filterOptions: ["open", "proses", "fwd teknis", "done"],
      },
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span>Status</span>
          <ColumnFilter column={column} />
        </div>
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },

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

    // --- ACTIONS COLUMN ---
    actions: {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: any) => {
        const t = row.original as Ticket;

        // Handler defined inside cell to access 'row'
        const handleAction = (e: React.MouseEvent, mode: TicketMode) => {
          e.preventDefault();
          e.stopPropagation();
          openModal(mode, t);
        };

        return (
          <div className="flex items-center justify-end gap-2">

            {/* ACTION: PROCESS (Mode: open) */}
            {t.status === 'open' && (
              <Button
                size="sm"
                variant="outline"
                className="relative z-50 h-7 px-2 text-[10px] gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                onClick={(e) => handleAction(e, 'open')}
              >
                Process <ArrowRight className="h-3 w-3" />
              </Button>
            )}

            {/* ACTION: FORWARD (Mode: forward) */}
            {t.status === 'proses' && (
              <Button
                size="sm"
                variant="outline"
                className="relative z-50 h-7 px-2 text-[10px] gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={(e) => handleAction(e, 'forward')}
              >
                Forward <Forward className="h-3 w-3" />
              </Button>
            )}

            {/* ACTION: CLOSE (Mode: close) */}
            {(t.status === 'proses') && (
              <Button
                size="sm"
                variant="ghost"
                className="relative z-50 h-4 px-2 text-[10px] gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={(e) => handleAction(e, 'close')}
              >
                Close
              </Button>
            )}

            {/* DONE STATE */}
            {(t.status === 'fwd teknis' || t.status === 'done' || t.status === 'closed') && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            )}
          </div>
        );
      }
    }
  }), [openModal]);

  return (
    <div className="animate-in fade-in duration-500 px-8 py-8 space-y-4">

      {/* --- THE UNIFIED MODAL --- */}
      <TicketModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        mode={modalConfig.mode}
        ticketData={modalConfig.ticketData}
      />

      {/* --- Header / Toolbar --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Log Komplain</h1>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()} disabled={isFetching} className="bg-background">
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Loading...' : 'Refresh'}
          </Button>

          <Button variant="outline" className="bg-background">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>

          {/* CREATE NEW TICKET */}
          <Button onClick={() => openModal('create')} className="ml-2">
            <Plus className="mr-2 h-4 w-4" /> Open Ticket
          </Button>
        </div>
      </div>

      <AutoTanStackTable<Ticket>
        data={tickets}
        columnOverrides={columnOverrides}
        pageSize={15}
      />
    </div>
  );
};

export const Route = createFileRoute('/log-komplain/')({
  component: LogTicketPage,
});