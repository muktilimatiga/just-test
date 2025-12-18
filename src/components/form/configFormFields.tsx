import { z } from 'zod';
import { User, DownloadCloud, Settings, Unlock, Box, Fingerprint, Scan, Router, Loader2 } from 'lucide-react';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// --- SCHEMAS ---

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

// --- CONSTANTS ---
const MODEM_ITEMS = ["ZTE", "HUAWEI", "NOKIA", "F609", "F670L"];
const PACKAGE_ITEMS = ["50Mbps", "100Mbps", "200Mbps"];

// --- INTERFACE ---
interface FormFieldProps {
    oltOptions?: string[];
    detectedOnts?: any[];
    onScan?: () => void;
    isScanning?: boolean;
}

// 1. MANUAL FORM (Rich UI)
export const ConfigFormManualFields = ({ oltOptions = [], detectedOnts = [], onScan, isScanning }: FormFieldProps) => (
    <div className="space-y-5 px-1">
        {/* NETWORK TARGET */}
        <div>
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target OLT</Label>
            <FieldWrapper
                name="olt_name"
                component="Select"
                items={oltOptions.map(opt => ({ value: opt, label: opt }))}
                placeholder="-- Select OLT --"
                className="bg-white h-10 text-xs font-medium w-full"
            />
        </div>

        {/* DEVICE CARD (Blue) */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 shadow-sm relative group">
            <div className="absolute top-0 right-0 p-2 opacity-50">
                <Router className="h-10 w-10 text-blue-200 dark:text-blue-900" />
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Fingerprint className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Device Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-[10px] font-semibold text-blue-600/80 mb-1.5 block">Modem Type</Label>
                    <FieldWrapper
                        name="modem_type"
                        component="Select"
                        items={MODEM_ITEMS.map(opt => ({ value: opt, label: opt }))}
                        placeholder="Select Type"
                        className="bg-white h-9 text-xs"
                    />
                </div>

                <div>
                    <Label className="text-[10px] font-semibold text-blue-600/80 mb-1.5 block">Serial Number</Label>
                    <div className="flex gap-2">
                        {/* THE SMART SELECT LOGIC YOU REQUESTED */}
                        <div className="flex-1">
                            {detectedOnts.length > 0 ? (
                                <FieldWrapper
                                    name="onu_sn"
                                    component="Select"
                                    items={detectedOnts.map(ont => ({ value: ont.sn, label: ont.sn }))}
                                    placeholder="Select Scanned Device"
                                    className="bg-white h-9 text-xs"
                                />
                            ) : (
                                <FieldWrapper
                                    name="onu_sn"
                                    component="Input"
                                    placeholder="e.g. ZTEG12345678"
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
                    {detectedOnts.length === 0 && !isScanning && (
                        <p className="text-[9px] text-blue-400 mt-1 pl-1 italic">* Click scan to find devices</p>
                    )}
                </div>
            </div>
        </div>

        {/* CUSTOMER CARD (Slate) */}
        <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Customer Service</h3>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <Label className="text-[10px] font-medium text-slate-500 mb-1 block">Full Name</Label>
                        <FieldWrapper name="name" component="Input" className="bg-white h-9 text-xs font-semibold" placeholder="Customer Name" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <Label className="text-[10px] font-medium text-slate-500 mb-1 block">Internet Package</Label>
                        <FieldWrapper name="package" component="Select" items={PACKAGE_ITEMS.map(opt => ({ value: opt, label: opt }))} placeholder="Select Package" className="bg-white h-9 text-xs" />
                    </div>
                </div>

                <div>
                    <Label className="text-[10px] font-medium text-slate-500 mb-1 block">Address</Label>
                    <FieldWrapper name="address" component="Textarea" className="bg-white min-h-[50px] text-xs resize-none" placeholder="Installation address..." />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-1 block">PPPoE Username</Label>
                        <FieldWrapper name="user_pppoe" component="Input" className="bg-white font-mono text-xs h-9" placeholder="user@net" />
                    </div>
                    <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-1 block">PPPoE Password</Label>
                        <FieldWrapper name="pass_pppoe" component="Input" className="bg-white font-mono text-xs h-9" placeholder="********" />
                    </div>
                </div>
            </div>
        </div>

        {/* OPTIONS */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
                    <Unlock className="h-4 w-4" />
                </div>
                <div>
                    <Label className="text-xs font-bold block">Port Security</Label>
                    <p className="text-[10px] text-slate-400">Lock unused ethernet ports</p>
                </div>
            </div>
            <FieldWrapper name="eth_locks" component="Checkbox" />
        </div>
    </div>
);

// 2. AUTO FORM
export const ConfigFormAutoFields = ({ oltOptions = [], detectedOnts = [], onScan, isScanning }: FormFieldProps) => (
    <div className="space-y-5 px-1">
        <div>
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target OLT</Label>
            <FieldWrapper name="olt_name" component="Select" items={oltOptions.map(opt => ({ value: opt, label: opt }))} placeholder="-- Select OLT --" className="bg-white h-10 text-xs font-medium w-full" />
        </div>

        <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <DownloadCloud className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Pending Registration</h3>
            </div>
            <Label className="text-[10px] font-medium text-indigo-600/70 mb-1.5 block">Select Customer Data</Label>
            <FieldWrapper name="data_psb" component="Select" items={[]} placeholder="-- Select Pending Customer --" className="bg-white h-10 text-xs" />
        </div>

        <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Fingerprint className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Assign to Device</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label className="text-[10px] font-medium text-blue-600/70 mb-1.5 block">Serial Number</Label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <FieldWrapper name="onu_sn" component="Input" placeholder="Scan SN..." className="bg-white font-mono text-xs h-9" />
                        </div>
                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shrink-0">
                            <Scan className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 3. BATCH FORM
export const ConfigBatchFields = ({ oltOptions = [] }: FormFieldProps) => (
    <div className="space-y-5 px-1">
        <div>
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target OLT</Label>
            <FieldWrapper name="olt_name" component="Select" items={oltOptions.map(opt => ({ value: opt, label: opt }))} placeholder="-- Select OLT --" className="bg-white h-10 text-xs font-medium w-full" />
        </div>
        <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/60 shadow-sm mt-4">
            <h3 className="font-bold text-amber-800 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings className="h-3 w-3" /> Global Configuration
            </h3>
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