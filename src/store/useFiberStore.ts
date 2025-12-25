
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface FiberCustomer {
    id: string;
    name: string;
    user_pppoe: string;
    alamat: string;
    paket?: string;
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

    searchCustomers: async (queryStr: string) => {
        if (!queryStr || queryStr.length <= 1) {
            set({ searchResults: [], isSearching: false });
            return;
        }

        set({ isSearching: true });
        try {
            let query = supabase.from('data_fiber').select('*');
            const tokens = queryStr.split(/\s+/).filter(t => t.length > 0);

            tokens.forEach(token => {
                query = query.or(`name.ilike.%${token}%,user_pppoe.ilike.%${token}%,alamat.ilike.%${token}%`);
            });

            const { data, error } = await query.limit(10);

            if (error) throw error;

            // Map raw data to FiberCustomer shape if necessary, or use as is
            const mappedResults: FiberCustomer[] = (data || []).map((row: any) => ({
                id: row.user_pppoe || row.id || `fiber-${Math.random()}`,
                name: row.name || 'Unknown',
                user_pppoe: row.user_pppoe || '',
                pppoe_password: row.pppoe_password || '',
                alamat: row.alamat || '',
                paket: row.paket || ''
            }));

            set({ searchResults: mappedResults, isSearching: false });
        } catch (error) {
            console.error('Fiber search failed:', error);
            set({ searchResults: [], isSearching: false });
        }
    },

    resetSearch: () => set({ searchTerm: '', searchResults: [], isSearching: false })
}));