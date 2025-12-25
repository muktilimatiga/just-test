import { useEffect } from 'react';
import { ModalOverlay } from '@/components/ModalOverlay';

// Helper to sync form state to store
const EffectSync = ({ value, onChange }: { value: any, onChange: (val: any) => void }) => {
    useEffect(() => {
        if (typeof value !== 'undefined') onChange(value);
    }, [value, onChange]);
    return null;
};
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { toast } from "sonner"
import { X, RefreshCw, Trash2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

// Store & Hooks
import { useConfigStore } from '@/store/configStore';
import { useAppForm, FormProvider } from '@/components/form/hooks';
import { usePsbData, useScanOnts } from '@/hooks/useApi';
import { useFiberStore } from '@/store/useFiberStore';
import { useConfigMutation } from '@/store/useConfigApi';

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'manual' | 'auto' | 'batch' | 'bridge';
}

export const ConfigModalTest = ({ isOpen, onClose, type }: ConfigModalProps) => {

    // UI State    // Store
    const {
        mode, setMode, selectedOlt, setSelectedOlt,
        batchQueue, addToBatch, removeFromBatch,
        detectedOnts, setDetectedOnts,
        reset
    } = useConfigStore();

    const {
        data: psbList,

        refetch: refetchPsb,
        isRefetching: isRefetching,
    } = usePsbData();

    const {
        searchTerm,
        setSearchTerm,
        searchCustomers,
        searchResults,
        resetSearch
    } = useFiberStore();

    // API
    const { mutateAsync: scanOnts, isPending: isScanning } = useScanOnts();
    const currentType = type === 'batch' ? 'batch' : type === 'bridge' ? 'bridge' : mode;
    const { FormFields, schema, execute, submitLabel } = useConfigMutation(currentType, selectedOlt);

    const handleClose = () => {
        onClose();
        setTimeout(() => reset(), 200);
    };

    // Form
    const form = useAppForm({
        defaultValues: {
            olt_name: '', modem_type: '', onu_sn: '', package: '',
            name: '', address: '', user_pppoe: '',
            pass_pppoe: '', // Match Store Default
            eth_locks: [true],
            vlan_id: '', // Match Store Default
            data_psb: '',
            fiber_source_id: '' // Helpers for Search
        },
        validators: { onChange: schema },
        onSubmit: async ({ value }) => {
            if (!value.olt_name) return toast.error("Please select an OLT");

            try {
                if (currentType === 'batch') {
                    // @ts-ignore
                    await execute(value, batchQueue);
                } else {
                    await execute(value);
                }
                toast.success("Configuration started");
                handleClose();
            } catch (error: any) {
                toast.error(error.message || "Failed");
            }
        }
    });

    const handleSelectUser = (data: any) => {
        const selectedId = data; // Assuming data is the value (user_pppoe)
        const selected = searchResults?.find(p => p.user_pppoe === selectedId);
        if (selected) {
            form.setFieldValue('name', selected.name || '');
            form.setFieldValue('address', selected.alamat || '');
            form.setFieldValue('user_pppoe', selected.user_pppoe || '');
            form.setFieldValue('pass_pppoe', selected.user_pppoe || ''); // Assuming password is same as user for now? Or maybe empty? 
            // In original code: form.setFieldValue('pass_pppoe', selected.user_pppoe || ''); 
            // It seems weird to set password to username, but restoring original behavior.
            resetSearch();
            setSearchTerm('');
            console.log(selected);
        }
    };

    const handleSelectPsb = (value: string) => { // Changed from (e: any)
        const selectedId = value; // Use value directly
        const selected = psbList?.find(p => p.user_pppoe === selectedId);

        if (selected) {
            form.setFieldValue('name', selected.name || '');
            form.setFieldValue('address', selected.address || '');
            form.setFieldValue('user_pppoe', selected.user_pppoe || '');
            form.setFieldValue('pass_pppoe', selected.pppoe_password || '');
            if (selected.paket) form.setFieldValue('package', selected.paket);
        }
    };


    const handleScan = async () => {
        if (!selectedOlt) return toast.error("Select OLT first");
        try {
            const res = await scanOnts(selectedOlt);
            setDetectedOnts(res || []);
            if (currentType !== 'batch' && res?.length) form.setFieldValue('onu_sn', res[0].sn);
            toast.success(`Found ${res?.length || 0} devices`);
        } catch {
            toast.error("Scan failed");
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={handleClose} hideCloseButton className="max-w-xl h-auto p-0 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white dark:bg-zinc-900">
                <h2 className="text-lg font-bold">{mode === 'manual' ? 'Manual' : 'Auto (API)'}</h2>
                <div className="flex items-center gap-4">
                    {/* Mode Toggle */}
                    {type !== 'batch' && type !== 'bridge' && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 pr-3 rounded-full border">
                            <Switch checked={mode === 'manual'} onCheckedChange={(c) => setMode(c ? 'manual' : 'auto')} className="scale-75" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{mode === 'manual' ? 'Manual' : 'Auto (API)'}</span>
                        </div>
                    )}
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[75vh]">
                <FormProvider value={form}>
                    {/* Sync OLT */}
                    <form.Subscribe
                        selector={(state) => state.values.olt_name}
                        children={(olt) => <EffectSync value={olt} onChange={setSelectedOlt} />}
                    />
                    <form.Subscribe
                        selector={(state) => state.values.data_psb}
                        children={(selectedId) => {
                            // This runs whenever 'data_psb' changes
                            useEffect(() => {
                                if (!selectedId || !psbList) return;

                                // Find the full object from the ID
                                const selectedPsb = psbList.find((p: any) => p.id === selectedId);

                                if (selectedPsb) {
                                    handleSelectPsb(selectedId);
                                }
                            }, [selectedId, psbList]);

                            return null; // Render nothing
                        }}
                    />
                    {/* THE MAGIC: All complexity is hidden here */}
                    <FormFields
                        mode={currentType}
                        detectedOnts={detectedOnts}
                        onScan={handleScan}
                        isScanning={isScanning}
                        psbList={psbList}
                        fetchPsbData={refetchPsb}
                        isFetchingPSB={isRefetching}
                        selectPSBList={handleSelectPsb}
                        selectUser={(fiberUser) => {
                            handleSelectUser(fiberUser);
                            // Optional: Clear search term to close dropdown
                            // setSearchTerm(''); 
                        }}
                        fiberList={searchResults}         // The Array of results
                        fiberSearchTerm={searchTerm}      // The Search Input String
                        setFiberSearchTerm={setSearchTerm}// Function to update input
                        onFiberSearch={() => searchCustomers(searchTerm)}   // Function to trigger API call
                    />
                </FormProvider>

                {/* Batch Queue UI (Only for batch mode) */}
                {type === 'batch' && (
                    <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-end">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Queue ({batchQueue.length})</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning} className="h-8 text-xs">
                                    <RefreshCw className={cn("h-3 w-3 mr-2", isScanning && "animate-spin")} />
                                    Scan
                                </Button>
                            </div>
                        </div>

                        {/* Add to Queue Dropdown */}
                        {detectedOnts.length > 0 && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                <select
                                    className="w-full text-xs bg-transparent border-none outline-none text-blue-700 font-medium cursor-pointer"
                                    onChange={(e) => {
                                        const sn = e.target.value;
                                        if (!sn) return;
                                        const ont = detectedOnts.find(o => o.sn === sn);
                                        if (ont) addToBatch(ont);
                                        e.target.value = ""; // reset
                                    }}
                                >
                                    <option value="">+ Add Detected Device to Queue...</option>
                                    {detectedOnts.map(ont => (
                                        <option key={ont.sn} value={ont.sn} disabled={!!batchQueue.find(b => b.sn === ont.sn)}>
                                            {ont.sn} (Port {ont.pon_port || '?'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Queue List */}
                        <div className="border rounded-lg overflow-hidden bg-slate-50/50 min-h-[150px]">
                            {batchQueue.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                                    <Layers className="h-8 w-8 opacity-20" />
                                    <p className="text-xs">Queue is empty</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {batchQueue.map(item => (
                                        <div key={item.sn} className="flex items-center justify-between p-2.5 bg-white text-xs hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                    {batchQueue.indexOf(item) + 1}
                                                </div>
                                                <div>
                                                    <div className="font-mono font-bold text-slate-700">{item.sn}</div>
                                                    <div className="text-[10px] text-slate-400">Port {item.port}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromBatch(item.sn)}
                                                className="h-6 w-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-3 bg-slate-50/30">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={(e) => { e.preventDefault(); form.handleSubmit(); }} disabled={form.state.isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    {form.state.isSubmitting ? "Processing..." : submitLabel}
                </Button>
            </div>
        </ModalOverlay>
    );
}