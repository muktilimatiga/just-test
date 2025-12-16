import { create } from 'zustand';
import type { Customer, Ticket } from '@/types'; // Adjust imports to your project
import { supabase } from '@/lib/supabaseClient';

export type TicketMode = 'create' | 'open' | 'forward' | 'close';
// 1. Unified Form Data Interface
// This MUST match the union of all fields in your Zod Schemas (Create, Open, Forward, Close)
export interface TicketFormData {
    // --- Common Fields ---
    name: string;
    address: string;
    description: string;

    // --- Technical / Infrastructure ---
    olt_name: string;
    user_pppoe: string;
    onu_sn: string;
    interface: string;

    // --- Ticket Metadata ---
    ticketRef: string;
    priority: string; // 'Low' | 'Medium' | 'High' | 'Critical'
    type: string;     // 'FREE' | 'CHARGED' (for Create), 'Technical' etc.

    // --- Action Specific Fields ---
    action_ticket: string;    // Used in Open
    action_close: string;     // Used in Close

    // --- Forwarding Specific ---
    last_action: string;
    service_impact: string;
    root_cause: string;
    network_impact: string;
    person_in_charge: string;
    recomended_action: string;
    pic: string;
}

// 2. Default Values (Clean Slate)
const INITIAL_FORM_DATA: TicketFormData = {
    name: '',
    address: '',
    description: '',
    priority: 'Low',

    olt_name: '',
    user_pppoe: '',
    onu_sn: '',
    interface: '',

    ticketRef: '',
    type: 'FREE', // Default for new tickets

    action_ticket: '',
    action_close: '',

    last_action: '',
    service_impact: '',
    root_cause: '',
    network_impact: '',
    person_in_charge: '',
    recomended_action: '',
    pic: ''
};

interface TicketStore {
    // State
    step: number;
    selectedUser: Customer | null;
    formData: TicketFormData;

    // Search State (For Create Mode)
    searchQuery: string;
    searchResults: Customer[];
    isSearching: boolean;

    // Actions
    setStep: (step: number) => void;
    setSearchQuery: (query: string) => void;
    searchCustomers: (query: string) => Promise<void>;
    selectUser: (user: Customer) => void;
    updateFormData: (updates: Partial<TicketFormData>) => void;

    // The "Magic" Action for Open/Close/Forward
    initializeFromTicket: (ticket: any) => void;

    reset: () => void;
}

export const useTicketStore = create<TicketStore>((set) => ({
    // Initial State
    step: 1,
    selectedUser: null,
    formData: INITIAL_FORM_DATA,
    searchQuery: '',
    searchResults: [],
    isSearching: false,

    // Simple Setters
    setStep: (step) => set({ step }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    updateFormData: (updates) => set((state) => ({
        formData: { ...state.formData, ...updates }
    })),

    // --- 1. Search Logic (For Create Mode) ---
    searchCustomers: async (query: string) => {
        if (query.length <= 1) {
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

            const mappedResults: any[] = (data || []).map(row => ({
                id: row.user_pppoe || `fiber-${Math.random()}`,
                name: row.name || 'Unknown',
                _address: row.alamat,
                _pppoe: row.user_pppoe,
                _sn: row.onu_sn,
                _olt: row.olt_name,
                _interface: row.interface
            }));

            set({ searchResults: mappedResults, isSearching: false });
        } catch (error) {
            console.error('Search failed:', error);
            set({ searchResults: [], isSearching: false });
        }
    },

    // --- 2. Select User Logic (For Create Mode) ---
    selectUser: (customer: any) => {
        // Auto-generate a Reference ID for the UI
        const randomRef = `TN${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

        set({
            selectedUser: customer,
            step: 2, // Jump to Form
            formData: {
                ...INITIAL_FORM_DATA,
                name: customer.name?.toUpperCase() || '',
                address: customer._address || '',
                user_pppoe: customer._pppoe || '',
                onu_sn: customer._sn || '',
                olt_name: customer._olt || '',
                interface: customer._interface || '',

                ticketRef: randomRef,
                priority: 'Low',
                type: 'CHARGED'
            }
        });
    },

    // --- 3. Initialize Logic (For Edit / Forward / Close Modes) ---
    initializeFromTicket: (ticket: any) => {
        // This function prepares the store when you click "Forward" on an EXISTING ticket
        set({
            step: 2, // Skip Search, go straight to form
            selectedUser: {
                id: ticket.customerId || 'unknown',
                name: ticket.name || 'Customer'
            } as any,

            formData: {
                ...INITIAL_FORM_DATA,
                ticketRef: ticket.ticketRef || ticket.id,
                name: ticket.name || '',
                address: ticket.address || '',
                description: ticket.description || '',

                olt_name: ticket.olt_name || '',
                user_pppoe: ticket.user_pppoe || '',
                onu_sn: ticket.onu_sn || '',
                interface: ticket.interface || '',

                priority: ticket.priority || 'Low',
                type: ticket.type || 'FREE',

                // Ensure action fields are clean
                action_close: '',
                recomended_action: '',
                root_cause: ''
            }
        });
    },

    reset: () => set({
        step: 1,
        selectedUser: null,
        formData: INITIAL_FORM_DATA,
        searchQuery: '',
        searchResults: [],
        isSearching: false
    })
}));