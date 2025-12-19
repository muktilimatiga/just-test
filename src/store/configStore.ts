import { create } from 'zustand';

// 1. Keep Types for external usage, but don't store them in state
export interface BatchQueueItem {
    sn: string;
    port: string;
    status: 'pending' | 'success' | 'failed';
}

interface ConfigStore {
    // --- SESSION CONTEXT (Keep these) ---
    mode: 'manual' | 'auto' | 'batch' | 'bridge';
    selectedOlt: string;

    // --- GLOBAL DATA (Keep these) ---
    // These persist even if the modal closes
    batchQueue: BatchQueueItem[];
    detectedOnts: any[];

    // --- ACTIONS ---
    setMode: (mode: 'manual' | 'auto' | 'batch' | 'bridge') => void;
    setSelectedOlt: (olt: string) => void;
    setDetectedOnts: (onts: any[]) => void;

    // Batch Actions
    addToBatch: (ont: any) => void;
    removeFromBatch: (sn: string) => void;
    clearBatch: () => void;

    reset: () => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
    mode: 'manual',
    selectedOlt: '',
    // ❌ REMOVED: formData (The form library handles this now)
    batchQueue: [],
    detectedOnts: [],

    setMode: (mode) => set({ mode }),
    setSelectedOlt: (olt) => set({ selectedOlt: olt }), // Simple update
    setDetectedOnts: (onts) => set({ detectedOnts: onts }),

    addToBatch: (ont) => set((state) => {
        if (state.batchQueue.find(i => i.sn === ont.sn)) return state;
        return {
            batchQueue: [...state.batchQueue, {
                sn: ont.sn,
                port: `${ont.pon_port}/${ont.pon_slot}`,
                status: 'pending'
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
        batchQueue: [],
        detectedOnts: []
    })
}));