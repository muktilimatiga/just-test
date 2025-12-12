
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface FiberCustomer {
    id: string;
    name: string;
    user_pppoe: string;
    alamat: string;
    onu_sn?: string;
    olt_name?: string;
    olt_port?: string;
    paket?: string;
    // Add other fields as they appear in your DB
}

interface FiberStore {
    searchTerm: string;
    searchResults: FiberCustomer[];
    isSearching: boolean;

    setSearchTerm: (term: string) => void;
    searchCustomers: (query: string) => Promise<void>;
    resetSearch: () => void;
}

export const useFiberStore = create<FiberStore>((set) => ({
    searchTerm: '',
    searchResults: [],
    isSearching: false,

    setSearchTerm: (term) => set({ searchTerm: term }),

    searchCustomers: async (query) => {
        if (!query || query.length <= 1) {
            set({ searchResults: [], isSearching: false });
            return;
        }

        set({ isSearching: true });
        try {
            const { data, error } = await supabase
                .from('data_fiber')
                .select('*')
                .or(`name.ilike.%${query}%,user_pppoe.ilike.%${query}%,alamat.ilike.%${query}%`)
                .limit(10);

            if (error) throw error;

            // Map raw data to FiberCustomer shape if necessary, or use as is
            const mappedResults: FiberCustomer[] = (data || []).map((row: any) => ({
                id: row.user_pppoe || row.id || `fiber-${Math.random()}`,
                name: row.name || 'Unknown',
                user_pppoe: row.user_pppoe || '',
                alamat: row.alamat || '',
                onu_sn: row.onu_sn,
                olt_name: row.olt_name,
                olt_port: row.olt_port,
                paket: row.paket || row.packet
            }));

            set({ searchResults: mappedResults, isSearching: false });
        } catch (error) {
            console.error('Fiber search failed:', error);
            set({ searchResults: [], isSearching: false });
        }
    },

    resetSearch: () => set({ searchTerm: '', searchResults: [], isSearching: false })
}));