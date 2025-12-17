import { z } from 'zod';
import { User, DownloadCloud, Settings, Unlock, Box, Fingerprint } from 'lucide-react';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { Label } from '@/components/ui/label';

// --- SCHEMAS (Logic) ---

export const BaseConfigSchema = z.object({
    olt_name: z.string().min(1, "OLT is required"),
    modem_type: z.string().min(1, "Modem Type is required"),
    onu_sn: z.string().min(1, "Serial Number is required"),
    eth_locks: z.array(z.boolean()).default([false, false, false, false]),
});

export const ConfigManualSchema = BaseConfigSchema.extend({
    package: z.string().min(1, "Package is required"),
    name: z.string().min(1, "Customer Name is required"),
    address: z.string().optional(),
    user_pppoe: z.string().min(1, "PPPoE User is required"),
    pass_pppoe: z.string().min(1, "PPPoE Password is required"),
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

// --- HELPER ITEMS ---
const MODEM_ITEMS = [
    { value: "ZTE", label: "ZTE" },
    { value: "HUAWEI", label: "HUAWEI" },
    { value: "NOKIA", label: "NOKIA" }
];

const PACKAGE_ITEMS = [
    { value: "50Mbps", label: "50Mbps" },
    { value: "100Mbps", label: "100Mbps" },
    { value: "200Mbps", label: "200Mbps" }
];

// --- UI COMPONENTS (The Style) ---

// 1. Manual Config Form
export const ConfigFormManualFields = ({ oltOptions = [] }: { oltOptions?: any[] }) => (
    <div className="space-y-4 p-5">
        {/* DEVICE SELECTION ROW (Restored to Body) */}
        <div className="grid grid-cols-2 gap-4">
            <FieldWrapper
                name="olt_name"
                component="Select"
                items={oltOptions.map(opt => ({ value: opt, label: opt }))}
                placeholder="-- Select OLT --"
                className="bg-white h-10 text-xs font-medium"
            />
            <FieldWrapper
                name="modem_type"
                component="Select"
                items={MODEM_ITEMS}
                placeholder="-- Modem Type --"
                className="bg-white h-10 text-xs font-medium"
            />
        </div>

        {/* Header Section */}
        <div className="flex items-center gap-3 mt-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                <User className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-bold">Manual Registration</h3>
                <p className="text-[10px] text-slate-500">Enter customer details manually</p>
            </div>
        </div>

        {/* Device Section (Blue Card) */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-100 relative">
            <Label className="text-[10px] font-bold text-slate-600 mb-2 block uppercase flex items-center gap-2">
                <Fingerprint className="h-3 w-3" /> Device Serial Number
            </Label>
            <FieldWrapper
                name="onu_sn"
                component="Input"
                placeholder="e.g. ZTEG12345678"
                className="bg-white font-mono text-xs h-10 border-blue-200 w-full"
            />
        </div>

        {/* Customer Details Card (Slate Card) */}
        <div className="space-y-4 p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200">
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                <span className="bg-slate-50 px-3 flex items-center gap-1.5"><Settings className="h-3 w-3" /> Customer Info</span>
            </div>

            <FieldWrapper name="name" label="Customer Name" component="Input" className="bg-white h-10 text-sm font-semibold" />
            <FieldWrapper name="address" label="Address" component="Textarea" className="bg-white min-h-[60px] text-xs" />

            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper name="user_pppoe" label="PPPoE User" component="Input" className="bg-white font-mono text-xs" />
                <FieldWrapper name="pass_pppoe" label="PPPoE Password" component="Input" className="bg-white font-mono text-xs" />
            </div>

            <FieldWrapper
                name="package"
                label="Internet Package"
                component="Select"
                items={PACKAGE_ITEMS}
                className="bg-white"
            />
        </div>

        {/* Port Lock Section */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-400">
                    <Unlock className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                    <Label className="text-sm font-bold block">Ethernet Port Lock</Label>
                    <p className="text-[10px] text-slate-500">Secure unused ports on the ONU</p>
                </div>
            </div>
            <FieldWrapper name="eth_locks" component="Checkbox" />
        </div>
    </div>
);

// 2. Auto Config Form
export const ConfigFormAutoFields = ({ oltOptions = [] }: { oltOptions?: any[] }) => (
    <div className="space-y-4">
        {/* DEVICE SELECTION ROW */}
        <div className="grid grid-cols-2 gap-4">
            <FieldWrapper
                name="olt_name"
                component="Select"
                items={oltOptions.map(opt => ({ value: opt, label: opt }))}
                placeholder="-- Select OLT --"
                className="bg-white h-10 text-xs font-medium"
            />
            {/* In Auto Mode, Modem Type is below */}
            <div className="h-10"></div>
        </div>

        <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                <DownloadCloud className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-bold">Auto Registration</h3>
                <p className="text-[10px] text-slate-500">Select from pending registrations (API)</p>
            </div>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <FieldWrapper
                name="data_psb"
                label="Select Pending Customer"
                component="Select"
                items={[]} // Parent will inject via context if needed, or leave empty for now
                placeholder="-- Select Pending Customer --"
                className="bg-white"
            />
        </div>

        <div className="p-4 bg-blue-50/50 rounded-xl border-2 border-blue-100">
            <Label className="text-[10px] font-bold text-slate-600 mb-2 block uppercase">Assign to Device (SN)</Label>
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                    <FieldWrapper name="onu_sn" component="Input" placeholder="Scan SN..." className="bg-white font-mono text-xs h-10" />
                </div>
                <FieldWrapper name="modem_type" component="Select" items={MODEM_ITEMS} placeholder="Type" className="bg-white text-xs h-10" />
            </div>
        </div>
    </div>
);

// 3. Batch Config Form
export const ConfigBatchFields = ({ oltOptions = [] }: { oltOptions?: any[] }) => (
    <div className="space-y-4">
        {/* DEVICE SELECTION ROW */}
        <div className="mb-4">
            <FieldWrapper
                name="olt_name"
                component="Select"
                items={oltOptions.map(opt => ({ value: opt, label: opt }))}
                placeholder="-- Select OLT --"
                className="bg-white h-10 text-xs font-medium"
            />
        </div>

        <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-amber-600 border border-slate-200">
                <Box className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-bold">Batch Provisioning</h3>
                <p className="text-[10px] text-slate-500">Configure multiple devices at once</p>
            </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-4">
            <h3 className="font-bold text-amber-800 text-xs uppercase tracking-wider">Global Batch Settings</h3>
            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper name="modem_type" label="Modem Type" component="Select" items={MODEM_ITEMS} className="bg-white" />
                <FieldWrapper name="package" label="Package (All)" component="Select" items={PACKAGE_ITEMS} className="bg-white" />
            </div>
        </div>
    </div>
);