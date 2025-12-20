
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { Customer } from '@/types';


export const useSupabaseCustomerViews = () => {
    return useQuery({
        queryKey: ['customers_view'],
        queryFn: async (): Promise<Customer[]> => {
            const { data: rows, error } = await supabase
                .from("customers_view")
                .select("*")
                .order("id", { ascending: false })
                .limit(50);

            if (error) {
                toast.error("Failed to fetch tickets");
                return [];
            }

            return (rows || []).map((row: any) => ({
                id: row.id,
                name: row.name,
                user_pppoe: row.user_pppoe,
                pass_pppoe: row.pass_pppoe,
                alamat: row.alamat,
                onu_sn: row.onu_sn,
                olt_name: row.olt_name,
                olt_port: row.olt_port,
                interface: row.interface,
                paket: row.paket,
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
        staleTime: 1000 * 30, // 30s Cache
        refetchOnWindowFocus: true,
    })
};
