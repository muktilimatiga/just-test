import { create } from 'zustand';

// 1. Define the Unified Form Data (Union of all possible fields)
export interface ConfigFormData {
    // Global Fields
    olt_name: string;
    modem_type: string;
    
    // Manual / Auto Fields
    onu_sn: string;
    package: string;
    name: string;
    address: string;
    user_pppoe: string;
    pass_pppoe: string;
    eth_locks: boolean[];
    
    // Auto Specific
    data_psb: string; // The selected Pending Customer ID

    // Bridge Specific
    vlan_id: number;
}

// 2. Define Batch Item Type
export interface BatchQueueItem {
    sn: string;
    port: string;
    status: 'pending' | 'success' | 'failed';
    customer?: {
        name: string;
        address: string;
        pppoe: string;
    };
}

// 3. Initial Values
const INITIAL_FORM_DATA: ConfigFormData = {
    olt_name: '',
    modem_type: '',
    onu_sn: '',
    package: '',
    name: '',
    address: '',
    user_pppoe: '',
    pass_pppoe: '123456',
    eth_locks: [false, false, false, false],
    data_psb: '',
    vlan_id: 100
};

interface ConfigStore {
    // State
    mode: 'manual' | 'auto' | 'batch' | 'bridge';
    selectedOlt: string;
    formData: ConfigFormData;
    
    // Batch Logic
    batchQueue: BatchQueueItem[];
    detectedOnts: any[]; // Stores results from "Scan OLT"

    // Actions
    setMode: (mode: 'manual' | 'auto' | 'batch' | 'bridge') => void;
    setSelectedOlt: (olt: string) => void;
    setDetectedOnts: (onts: any[]) => void;
    
    // Form Actions
    updateFormData: (updates: Partial<ConfigFormData>) => void;
    
    // Batch Actions
    addToBatch: (ont: any, customer?: any) => void;
    removeFromBatch: (sn: string) => void;
    clearBatch: () => void;

    reset: () => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
    mode: 'manual',
    selectedOlt: '',
    formData: INITIAL_FORM_DATA,
    batchQueue: [],
    detectedOnts: [],

    setMode: (mode) => set({ mode }),
    setSelectedOlt: (olt) => set((state) => ({ 
        selectedOlt: olt,
        formData: { ...state.formData, olt_name: olt } // Sync with form data
    })),
    setDetectedOnts: (onts) => set({ detectedOnts: onts }),

    updateFormData: (updates) => set((state) => ({
        formData: { ...state.formData, ...updates }
    })),

    addToBatch: (ont, customer) => set((state) => {
        // Prevent duplicates
        if (state.batchQueue.find(i => i.sn === ont.sn)) return state;
        
        return {
            batchQueue: [...state.batchQueue, {
                sn: ont.sn,
                port: `${ont.pon_port}/${ont.pon_slot}`,
                status: 'pending',
                customer
            }]
        };
    }),

    removeFromBatch: (sn) => set((state) => ({
        batchQueue: state.batchQueue.filter(i => i.sn !== sn)
    })),

    clearBatch: () => set({ batchQueue: [] }),

    reset: () => set({
        mode: 'manual',
        selectedOlt: '',
        formData: INITIAL_FORM_DATA,
        batchQueue: [],
        detectedOnts: []
    })
}));