
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { Ticket } from '@/types';


export const useSupabaseTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async (): Promise<Ticket[]> => {
      const { data: rows, error } = await supabase
        .from("log_komplain")
        .select("*")
        .order("id", { ascending: false })
        .limit(100);
      
      if (error) {
        toast.error("Failed to fetch tickets");
        return [];
      }

      return (rows || []).map((row: any) => ({
        ticketId: row.tiket ? String(row.tiket) : row.id ? String(row.id) : `tmp-${Math.random()}`,
        kendala: row.kendala || 'No Subject',
        status: mapDbStatusToUi(row.status),
        nama: row.nama || null,
        PIC: row.pic || null,
        createdAt: row.tanggal 
          ? new Date(row.tanggal).toISOString() 
          : row.created_at 
            ? new Date(row.created_at).toISOString() 
            : new Date().toISOString(),
      }));
    },
    staleTime: 1000 * 30, // 30s Cache
    refetchOnWindowFocus: true,
  })
};

// Helper to map DB statuses to UI expected values
const mapDbStatusToUi = (status: string): Ticket['status'] => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'open') return 'open';
    if (s === 'proses') return 'proses';
    if (s === 'fwd teknis') return 'fwd teknis'; // Map custom status
    if (s === 'done') return 'done';
    if (s === 'done/fwd') return 'closed';
    return 'open'; // Default fallback
};