import { ModalOverlay } from '@/components/ModalOverlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, MapPin, KeyRound, Server, Box } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export const CustomerDetailModal = ({ isOpen, onClose, customer }: any) => {
    if (!customer) return null;

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-md" // Keeps the card nice and narrow
        >
            <div className="p-0">

                {/* 1. TOP SECTION: NAME & ADDRESS */}
                <div className="px-6 pt-6 pb-4 bg-white dark:bg-zinc-950">
                    <div className="flex items-start gap-4">
                        {/* Avatar / Icon */}
                        <div className="h-14 w-14 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <User className="h-6 w-6" />
                        </div>

                        <div className="space-y-1">
                            {/* NAME */}
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                {customer.name}
                            </h3>

                            {/* ALAMAT (Address) - Right below name */}
                            <div className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span className="leading-snug">{customer.alamat || 'No address provided'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-6 space-y-6">

                    {/* 2. PPPOE SECTION (User | Pass) */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <KeyRound className="h-4 w-4 text-indigo-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">PPPoE Credentials</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* User PPPoE */}
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-slate-500 font-semibold">Username</p>
                                <div
                                    onClick={() => copyToClipboard(customer.user_pppoe, 'Username')}
                                    className="font-mono text-sm font-medium cursor-pointer hover:text-indigo-600 flex items-center gap-2 truncate"
                                >
                                    {customer.user_pppoe}
                                    <Copy className="h-3 w-3 opacity-30" />
                                </div>
                            </div>

                            {/* Pass PPPoE - Shows Divider Line */}
                            <div className="space-y-1 relative border-l border-indigo-200 dark:border-indigo-800 pl-4">
                                <p className="text-[10px] uppercase text-slate-500 font-semibold">Password</p>
                                <div
                                    onClick={() => copyToClipboard(customer.pppoe_pass, 'Password')}
                                    className="font-mono text-sm font-medium cursor-pointer hover:text-indigo-600 flex items-center gap-2"
                                >
                                    {customer.pppoe_pass || '******'}
                                    <Copy className="h-3 w-3 opacity-30" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. TECHNICAL DETAILS GRID */}
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                        {/* ONU SN */}
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Device Serial Number</p>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <code className="text-sm font-semibold">{customer.onu_sn}</code>
                                <Badge variant="outline" className="text-[10px] h-5">{customer.modem_type || 'ONT'}</Badge>
                            </div>
                        </div>

                        {/* Package */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                                <Box className="h-3 w-3" />
                                <span className="text-[10px] uppercase font-bold">Package</span>
                            </div>
                            <p className="text-sm font-medium pl-5">{customer.paket || '-'}</p>
                        </div>

                        {/* OLT Info */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                                <Server className="h-3 w-3" />
                                <span className="text-[10px] uppercase font-bold">OLT / Port</span>
                            </div>
                            <p className="text-sm font-medium pl-5">{customer.olt_name} <span className="text-slate-300">/</span> {customer.odp_port || '-'}</p>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(customer, null, 2), "Full Data")}>
                        Copy JSON
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};