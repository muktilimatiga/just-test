import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { Customer } from '@/types';

// 1. Accept a search term (default to empty string)
export const useSupabaseCustomerViews = (searchTerm: string = '') => {
    return useQuery({
        // 2. Add searchTerm to the queryKey so it auto-refetches when you type
        queryKey: ['customers_view', searchTerm],
        
        queryFn: async (): Promise<Customer[]> => {
            let query = supabase
                .from("customers_view")
                .select("*")
                .order("id", { ascending: false });

            // 3. Dynamic Logic:
            if (searchTerm) {
                // If searching: Look in name, pppoe, address, or SN. Remove the limit!
                // Using .ilike for case-insensitive search
                query = query.or(`name.ilike.%${searchTerm}%,user_pppoe.ilike.%${searchTerm}%,alamat.ilike.%${searchTerm}%,onu_sn.ilike.%${searchTerm}%`);
            } else {
                // If NOT searching: Just get the latest 50 to save data
                query = query.limit(50);
            }

            const { data: rows, error } = await query;

            if (error) {
                toast.error("Failed to fetch customers");
                return [];
            }

            return (rows || []).map((row: any) => ({
                id: row.id,
                name: row.name,
                user_pppoe: row.user_pppoe,
                alamat: row.alamat,
                onu_sn: row.onu_sn,
                olt_name: row.olt_name,
                interface: row.interface,
                snmp_status: row.snmp_status,
                rx_power_str: row.rx_power_str,
                modem_type: row.modem_type,
                snmp_last_updated: row.snmp_last_updated,
                latest_kendala: row.latest_kendala,
                latest_ticket: row.latest_ticket,
                latest_action: row.latest_action,
                createdAt: row.tanggal
                    ? new Date(row.tanggal).toISOString()
                    : row.created_at
                        ? new Date(row.created_at).toISOString()
                        : new Date().toISOString(),
            }));
        },
        staleTime: 1000 * 30, 
        refetchOnWindowFocus: true,
    })
};