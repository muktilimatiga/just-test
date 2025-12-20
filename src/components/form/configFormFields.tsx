import { z } from 'zod';
import {
    User, DownloadCloud, Settings, Unlock, Fingerprint,
    Scan, Router, Loader2, Database, Search, RefreshCw
} from 'lucide-react';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ==========================================
// 1. SCHEMAS
// ==========================================

export const BaseConfigSchema = z.object({
    olt_name: z.string().min(1, "OLT is required"),
    modem_type: z.string().min(1, "Modem Type is required"),
    onu_sn: z.string().min(1, "Serial Number is required"),
    eth_locks: z.boolean().default(true),
});

export const ConfigManualSchema = BaseConfigSchema.extend({
    package: z.string().min(1, "Package is required"),
    name: z.string().min(1, "Customer Name is required"),
    address: z.string().optional(),
    user_pppoe: z.string().min(1, "PPPoE User is required"),
    pass_pppoe: z.string().min(1, "PPPoE Password is required"),
    fiber_source_id: z.string().optional(),
});

export const ConfigAutoSchema = BaseConfigSchema.extend({
    data_psb: z.string().min(1, "Please select a pending customer"),
    name: z.string().optional(),
    package: z.string().optional(),
});

export const ConfigBatchSchema = BaseConfigSchema.pick({
    olt_name: true,
    modem_type: true,
}).extend({
    package: z.string().min(1, "Package is required"),
});

// ==========================================
// 2. CONSTANTS & TYPES
// ==========================================

const MODEM_ITEMS = ["C-DATA", "F609", "F670L"];
const PACKAGE_ITEMS = ["10M", "15M", "20M", "25M", "30M", "35M", "40M", "50M", "75M", "100M"];
const OLT_ITEMS = ["BOYOLANGU", "GANDUSARI", "KAUMAN", "BEJI", "DURENAN", "KALIDAWIR", "BLITAR", "CAMPUR BARU"];

interface FormFieldProps {
    mode: 'manual' | 'auto' | 'batch' | 'bridge';
    oltOptions?: string[];

    // Scanner
    detectedOnts?: any[];
    onScan?: () => void;
    isScanning?: boolean;

    // Auto Mode (PSB)
    psbList?: any[];
    fetchPsbData?: () => void;
    isFetchingPSB?: boolean;
    selectPSBList?: (value: string) => void;
    selectUser?: (value: any) => void;

    // Manual Mode (Fiber Search)
    fiberList?: any[];
    fiberSearchTerm?: string;
    setFiberSearchTerm?: (value: string) => void;
    onFiberSearch?: () => void;
    isSearchingFiber?: boolean;
}

// ==========================================
// 3. SECTIONS (Sub-Components)
// ==========================================

const SectionHeader = ({ icon: Icon, title, color, action }: { icon: any, title: string, color: string, action?: React.ReactNode }) => (
    <div className={`flex items-center justify-between mb-3 text-${color}-600`}>
        <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded bg-${color}-100 flex items-center justify-center`}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wide text-${color}-800`}>{title}</h3>
        </div>
        {action}
    </div>
);

// 🔍 SOURCE SELECTION (The part causing issues)
const SourceSelectionSection = (props: Partial<FormFieldProps>) => {
    const {
        mode,
        psbList, fetchPsbData, isFetchingPSB,
        fiberList, fiberSearchTerm, setFiberSearchTerm, onFiberSearch, isSearchingFiber, selectUser
    } = props;

    // --- CASE A: AUTO MODE ---
    if (mode === 'auto') {
        return (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 shadow-sm transition-all">
                <SectionHeader
                    icon={DownloadCloud}
                    title="Pending Registration"
                    color="indigo"
                    action={
                        <Button
                            type="button" variant="ghost" size="icon"
                            className="h-6 w-6 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100"
                            onClick={fetchPsbData} disabled={isFetchingPSB}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingPSB ? "animate-spin" : ""}`} />
                        </Button>
                    }
                />
                <Label className="text-[10px] font-medium text-indigo-600/70 mb-1.5 block">Select Pending Customer</Label>
                <FieldWrapper
                    name="data_psb"
                    component="Select"
                    items={psbList?.map(p => ({ value: p.id, label: `${p.name} - ${p.address}` })) || []}
                    placeholder={psbList?.length === 0 ? "No pending data" : "-- Pilih Pelanggan PSB --"}
                    className="bg-white h-10 text-xs border-indigo-200"
                />
            </div>
        );
    }

    // --- CASE B: MANUAL MODE (The Search Bar) ---
    if (mode === 'manual') {
        return (
            <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100 shadow-sm transition-all overflow-visible">
                <SectionHeader icon={Database} title="Database Search" color="orange" />

                {/* Search Input Group */}
                <div className="relative z-20">
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 pointer-events-none text-slate-400">
                            <Search className="h-4 w-4" />
                        </div>

                        {/* We use a standard Input here to handle the typing manually */}
                        <Input
                            placeholder="Search name, ID or address..."
                            className="pl-9 bg-white dark:bg-zinc-950 h-10 text-xs pr-10"
                            value={fiberSearchTerm} // Controlled value
                            onChange={e => setFiberSearchTerm?.(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onFiberSearch?.()}
                        />

                        {/* Search Button (Inside Input) */}
                        <div className="absolute right-1 top-1">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-orange-100 text-orange-500"
                                onClick={onFiberSearch}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* CUSTOM DROPDOWN RESULTS */}
                    {(fiberList?.length || 0) > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                            {fiberList?.map((u) => (
                                <div
                                    key={u.id} // Ensure 'id' exists
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                        selectUser?.(u); // Pass the selected user up
                                        setFiberSearchTerm?.(''); // Optional: Clear search after select
                                    }}
                                >
                                    <Avatar className="h-8 w-8 border border-slate-100">
                                        {/* Use u.customer_name or u.name based on your API */}
                                        <AvatarImage src="" alt={u.customer_name || u.name} />
                                        <AvatarFallback className="text-[10px] bg-orange-100 text-orange-600 font-bold">
                                            {(u.customer_name || u.name || '?').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden text-left">
                                        <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">
                                            {u.customer_name || u.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate">
                                            {u.serial_number || u.user_pppoe || 'No ID'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

// ... (Keep DeviceConfigSection, CustomerDataSection, BatchFormLayout unchanged) ...
const DeviceConfigSection = ({ detectedOnts = [], onScan, isScanning }: Partial<FormFieldProps>) => (
    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 shadow-sm relative group">
        <div className="absolute top-0 right-0 p-2 opacity-50">
            <Router className="h-10 w-10 text-blue-200 dark:text-blue-900" />
        </div>
        <SectionHeader icon={Fingerprint} title="Device Configuration" color="blue" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label className="text-[10px] font-semibold text-blue-600/80 mb-1.5 block">Modem Type</Label>
                <FieldWrapper
                    name="modem_type"
                    component="Select"
                    items={MODEM_ITEMS.map(opt => ({ value: opt, label: opt }))}
                    placeholder="Pilih Modem"
                    className="bg-white h-9 text-xs"
                />
            </div>

            <div>
                <Label className="text-[10px] font-semibold text-blue-600/80 mb-1.5 block">Serial Number</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        {detectedOnts.length > 0 ? (
                            <FieldWrapper
                                name="onu_sn"
                                component="Select"
                                items={detectedOnts.map(ont => ({ value: ont.sn, label: `${ont.sn} (Port ${ont.pon_port})` }))}
                                placeholder="Select Scanned Device"
                                className="bg-white h-9 text-xs"
                            />
                        ) : (
                            <FieldWrapper
                                name="onu_sn"
                                component="Select"
                                items={detectedOnts.map(ont => ({ value: ont.sn, label: `${ont.sn} (Port ${ont.pon_port})` }))}
                                placeholder="SN Terdeteksi"
                                className="bg-white font-mono text-xs h-9"
                            />
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shrink-0"
                        onClick={onScan}
                        disabled={isScanning}
                    >
                        {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

const CustomerDataSection = () => (
    <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 shadow-sm">
        <SectionHeader icon={User} title="Customer Service" color="slate" />

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <Label className="text-[10px] font-medium text-slate-500 mb-1 block">Full Name</Label>
                    <FieldWrapper name="name" component="Input" className="bg-white h-9 text-xs font-semibold" placeholder="Customer Name" />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <Label className="text-[10px] font-medium text-slate-500 mb-1 block">Internet Package</Label>
                    <FieldWrapper name="package" component="Select" items={PACKAGE_ITEMS.map(opt => ({ value: opt, label: opt }))} placeholder="Pilih Package" className="bg-white h-9 text-xs" />
                </div>
            </div>

            <div>
                <Label className="text-[10px] font-medium text-slate-500 mb-1 block">Address</Label>
                <FieldWrapper name="address" component="Textarea" className="bg-white min-h-[50px] text-xs resize-none" placeholder="Alamat" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                <div>
                    <Label className="text-[10px] font-medium text-slate-500 mb-1 block">PPPoE Username</Label>
                    <FieldWrapper name="user_pppoe" component="Input" className="bg-white font-mono text-xs h-9" placeholder="PPPoE" />
                </div>
                <div>
                    <Label className="text-[10px] font-medium text-slate-500 mb-1 block">PPPoE Password</Label>
                    <FieldWrapper name="pass_pppoe" component="Input" className="bg-white font-mono text-xs h-9" placeholder="PPPoE Pass" />
                </div>
            </div>
        </div>
    </div>
);

const BatchFormLayout = () => (
    <div className="space-y-5 px-1">
        <div>
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target OLT</Label>
            <FieldWrapper name="olt_name" component="Select" items={OLT_ITEMS.map(opt => ({ value: opt, label: opt }))} placeholder="-- Select OLT --" className="bg-white h-10 text-xs font-medium w-full" />
        </div>
        <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/60 shadow-sm mt-4">
            <SectionHeader icon={Settings} title="Global Configuration" color="amber" />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-[10px] font-medium text-amber-700/70 mb-1.5 block">Modem Model</Label>
                    <FieldWrapper name="modem_type" component="Select" items={MODEM_ITEMS.map(opt => ({ value: opt, label: opt }))} className="bg-white h-9 text-xs border-amber-200" placeholder="Select Model" />
                </div>
                <div>
                    <Label className="text-[10px] font-medium text-amber-700/70 mb-1.5 block">Internet Package</Label>
                    <FieldWrapper name="package" component="Select" items={PACKAGE_ITEMS.map(opt => ({ value: opt, label: opt }))} className="bg-white h-9 text-xs border-amber-200" placeholder="Select Package" />
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// 4. MAIN EXPORTED COMPONENT
// ==========================================

export const ConfigFormFields = (props: FormFieldProps) => {
    const { mode } = props;

    // A. Render Batch Mode
    if (mode === 'batch') {
        return <BatchFormLayout />;
    }

    // B. Render Unified Layout (Auto / Manual)
    return (
        <div className="space-y-5 px-1">

            {/* 1. Target OLT (Always First) */}
            <div>
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target OLT</Label>
                <FieldWrapper
                    name="olt_name"
                    component="Select"
                    items={OLT_ITEMS.map(opt => ({ value: opt, label: opt }))}
                    placeholder="-- Select OLT --"
                    className="bg-white h-10 text-xs font-medium w-full"
                />
            </div>

            {/* 2. Source Selection (Search Bar appears here if mode='manual') */}
            <SourceSelectionSection {...props} />

            {/* 3. The Form Body (Shared) */}
            <DeviceConfigSection {...props} />
            <CustomerDataSection />

            {/* 4. Footer Options */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
                        <Unlock className="h-4 w-4" />
                    </div>
                    <div>
                        <Label className="text-xs font-bold block">Port Security</Label>
                        <p className="text-[10px] text-slate-400 gap-90">Lock unused ethernet ports</p>
                    </div>
                </div>
                <FieldWrapper name="eth_locks" component="Checkbox" />
            </div>
        </div>
    );
};