import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ModalOverlay } from '@/components/ModalOverlay';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Layers, Scan, X } from 'lucide-react';

// Hooks & Store
import { useConfigStore } from '@/store/configStore';
import { useConfigFormStrategy } from '@/store/useConfigForm';
import { useAppForm, FormProvider } from '@/components/form/hooks';
import { useConfigOptions, useScanOnts } from '@/hooks/useApi';

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'manual' | 'auto' | 'batch' | 'bridge';
}

export const ConfigModalTest = ({ isOpen, onClose, type }: ConfigModalProps) => {

    // --- STORE ---
    const {
        selectedOlt, setSelectedOlt,
        formData,
        batchQueue, addToBatch, removeFromBatch,
        detectedOnts, setDetectedOnts,
        reset
    } = useConfigStore();

    // --- API ---
    const { data: optionsData } = useConfigOptions();
    const { mutateAsync: scanOnts, isPending: isScanning } = useScanOnts();

    const oltOptions = optionsData?.olt_options || [];

    // --- STRATEGY ---
    const { title, FormFields, schema, execute, submitLabel } = useConfigFormStrategy(
        type === 'batch' ? 'batch' : type,
        selectedOlt
    );

    // --- FORM ENGINE ---
    const form = useAppForm({
        defaultValues: {
            olt_name: '',
            modem_type: '',
            onu_sn: '',
            eth_locks: [false, false, false, false],
            package: '',
            name: '',
            address: '',
            user_pppoe: '',
            pass_pppoe: '',
            data_psb: '',
            vlan_id: 0,
        },
        validators: { onChange: schema },
        onSubmit: async ({ value }) => {
            // Ensure OLT is selected (It's part of the form now, so validator handles it, but good to check)
            if (!value.olt_name) {
                toast.error("Please select an OLT");
                return;
            }
            // Sync store selectedOlt just in case logic depends on it
            setSelectedOlt(value.olt_name);

            try {
                await execute(value, batchQueue);
                toast.success("Configuration started successfully");
                handleClose();
            } catch (error: any) {
                toast.error(error.message || "Configuration failed");
            }
        }
    });

    // --- EFFECTS ---
    useEffect(() => {
        if (isOpen) {
            reset();
            form.reset(formData);
        }
    }, [isOpen]);

    // Sync OLT Selection from Form -> Store (So the Strategy knows which OLT to use for mutations)
    const formOltName = form.state.values.olt_name;
    useEffect(() => {
        if (formOltName) setSelectedOlt(formOltName);
    }, [formOltName, setSelectedOlt]);


    const handleClose = () => {
        onClose();
        setTimeout(() => reset(), 200);
    };

    const handleScan = async () => {
        if (!selectedOlt) return toast.error("Select OLT first");
        try {
            const results = await scanOnts(selectedOlt);
            setDetectedOnts(results || []);
            toast.success(`Found ${results?.length || 0} devices`);
        } catch (e) {
            toast.error("Scan failed");
        }
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-xl h-auto p-0 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900"
            hideCloseButton // We implement custom close
        >
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-white dark:bg-zinc-900 flex justify-between items-center">
                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* CONTENT */}
            <div className="p-5 overflow-y-auto max-h-[75vh]">
                <FormProvider value={form}>
                    {/* Pass OLT Options down to the fields */}
                    <FormFields oltOptions={oltOptions} />
                </FormProvider>

                {/* EXTRA: Batch Queue UI */}
                {type === 'batch' && (
                    <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-end">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Device Queue ({batchQueue.length})</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleScan}
                                disabled={isScanning || !selectedOlt}
                                className="h-8 text-xs"
                            >
                                {isScanning ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <Scan className="h-3 w-3 mr-2" />}
                                Scan Network
                            </Button>
                        </div>

                        {/* Dropdown to Add to Queue */}
                        {detectedOnts.length > 0 && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                {/* Simple native select for speed, or replace with Shadcn Select */}
                                <select
                                    className="w-full text-xs bg-transparent border-none outline-none text-blue-700 font-medium"
                                    onChange={(e) => {
                                        const sn = e.target.value;
                                        if (!sn) return;
                                        const ont = detectedOnts.find(o => o.sn === sn);
                                        if (ont) addToBatch(ont);
                                        e.target.value = ""; // reset
                                    }}
                                >
                                    <option value="">+ Add Detected Device...</option>
                                    {detectedOnts.map(ont => (
                                        <option key={ont.sn} value={ont.sn} disabled={!!batchQueue.find(b => b.sn === ont.sn)}>
                                            {ont.sn} (Port {ont.pon_port})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* The List */}
                        <div className="border rounded-lg overflow-hidden bg-slate-50/50 min-h-[150px]">
                            {batchQueue.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                                    <Layers className="h-8 w-8 opacity-20" />
                                    <p className="text-xs">Queue is empty</p>
                                </div>
                            ) : (
                                batchQueue.map(item => (
                                    <div key={item.sn} className="flex items-center justify-between p-2 border-b last:border-0 bg-white text-xs">
                                        <div className="font-mono font-bold">{item.sn}</div>
                                        <div className="text-slate-500">{item.port}</div>
                                        <button onClick={() => removeFromBatch(item.sn)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t flex justify-end gap-3 bg-slate-50/30">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={(e) => { e.preventDefault(); form.handleSubmit(); }}
                    disabled={form.state.isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                    {form.state.isSubmitting ? "Processing..." : submitLabel}
                </Button>
            </div>
        </ModalOverlay>
    );
};