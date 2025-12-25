import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { Customer } from '@/types';

// 1. Accept a search term (default to empty string)
export const useSupabaseCustomerViews = (searchTerm: string = '') => {
    return useQuery({
        queryKey: ['customers_view', searchTerm],

        queryFn: async (): Promise<Customer[]> => {
            let query = supabase
                .from("customers_view")
                .select("*")
                .order("id", { ascending: false });

            if (searchTerm) {
                // 1. Split search term by spaces (e.g., "budi kedungwaru" -> ["budi", "kedungwaru"])
                const tokens = searchTerm.split(/\s+/).filter(t => t.length > 0);

                // 2. Loop through each word and add a filter
                // This creates logic: (Name/Addr has "budi") AND (Name/Addr has "kedungwaru")
                tokens.forEach(token => {
                    query = query.or(`name.ilike.%${token}%,user_pppoe.ilike.%${token}%,alamat.ilike.%${token}%,onu_sn.ilike.%${token}%`);
                });
            } else {
                query = query.limit(50);
            }

            const { data: rows, error } = await query;

            if (error) {
                toast.error("Failed to fetch customers");
                return [];
            }

            return (rows || []).map((row: any) => ({
                // ... keep your existing mapping logic ...
                id: row.id,
                name: row.name,
                user_pppoe: row.user_pppoe,
                pppoe_password: row.pppoe_password,
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