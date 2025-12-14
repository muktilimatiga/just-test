
import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, Copy, Send, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Label, Input, Textarea, Button } from '@/components/ui'
import { Separator } from '@/components/ui/separator'
import { ModalOverlay } from '@/components/ModalOverlay';
import type { Customer } from '@/types'
import { useCustomerInvoices } from '@/hooks/useApi';

interface InvoicePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Customer | null;
}

export const InvoicePaymentModal = ({ isOpen, onClose, user }: InvoicePaymentModalProps) => {
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    // Fetch real invoices
    const query = user?.user_pppoe?.toString() || user?.name || '';
    const { data: customersWithInvoices, isLoading } = useCustomerInvoices(query);

    // Determine active invoice data
    const invoiceData = React.useMemo(() => {
        if (!customersWithInvoices || customersWithInvoices.length === 0) return null;
        const customer = customersWithInvoices[0];
        const latestInvoice = customer.invoices && customer.invoices.length > 0 ? customer.invoices[0] : null;
        return {
            ...customer,
            currentInvoice: latestInvoice
        };
    }, [customersWithInvoices]);

    // Derived values
    const internetId = user?.user_pppoe || user?.id || '-';
    // Use payment_link from invoice if available, else detail_url, else fallback
    const paymentLink = invoiceData?.currentInvoice?.payment_link || invoiceData?.detail_url;

    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const deadlineDate = new Date(currentDate.setDate(currentDate.getDate() + 7)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Status Detection
    const isPaid = React.useMemo(() => {
        if (!invoiceData?.currentInvoice) return false;

        // New Backend Logic: explicit status
        if (invoiceData.currentInvoice.status) {
            return invoiceData.currentInvoice.status !== 'Unpaid';
        }

        // Old Logic: If this_month is explicitly null and no arrears, it's paid
        return invoiceData.currentInvoice.this_month === null && (invoiceData.currentInvoice.arrears_count || 0) === 0;
    }, [invoiceData]);

    const hasArrears = (invoiceData?.currentInvoice?.arrears_count || 0) > 0 || (invoiceData?.currentInvoice?.status === 'Unpaid');

    // Update amount from API if available
    useEffect(() => {
        if (isPaid) {
            setAmount('0');
        } else if (invoiceData?.currentInvoice?.this_month) {
            // Old Logic
            const cleanAmount = invoiceData.currentInvoice.this_month.replace(/[^0-9]/g, '');
            setAmount(cleanAmount);
        } else if (invoiceData?.currentInvoice?.package) {
            // New Logic: Extract from "CIGNAL 10M (Rp 111.000)"
            const match = invoiceData.currentInvoice.package.match(/Rp\s*([\d\.]+)/);
            if (match && match[1]) {
                setAmount(match[1].replace(/\./g, ''));
            } else {
                setAmount('170000'); // Fallback if parse fails
            }
        } else if (!amount && !isLoading && invoiceData) {
            setAmount('170000');
        }
    }, [invoiceData, isPaid, isLoading]);

    // Update message when dependencies change
    useEffect(() => {
        if (!user) return;

        // If API provides a ready-to-use description, use it (only if unpaid/billing)
        if (!isPaid && invoiceData?.currentInvoice?.description) {
            setMessage(invoiceData.currentInvoice.description);
            return;
        }

        const customerName = (user.name || user.alamat || 'Pelanggan').toUpperCase();
        const formattedAmount = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(amount.replace(/[^0-9]/g, '')));

        setMessage(invoiceData?.currentInvoice?.description || '');
    }, [user, amount, internetId, paymentLink, monthName, year, deadlineDate, isPaid, invoiceData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        // In a real app, toast success here
    };

    const handleSend = () => {
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    if (!user) return null;

    const address = user.alamat || "Alamat tidak tersedia";

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} hideCloseButton={true} className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {isPaid ? <CheckCircle className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {isPaid ? 'Payment Status' : 'Send Invoice'}
                    </h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Loading State or User Details */}
                {isLoading ? (
                    <div className="p-4 text-center text-slate-500">Loading invoice details...</div>
                ) : (
                    <div className="space-y-4">
                        {/* Status Banners */}
                        {isPaid && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Tagihan bulan ini sudah LUNAS.</span>
                            </div>
                        )}

                        {hasArrears && !isPaid && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">Perhatian: Ada tunggakan {invoiceData?.currentInvoice?.arrears_count} bulan.</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer Details</Label>
                            <div className="grid gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                <div>
                                    <Label className="text-xs text-slate-400">Name</Label>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name || user.alamat}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">Address</Label>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{address}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">PPPoE / ID</Label>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.user_pppoe || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Dynamic Inputs */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (WhatsApp)</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (IDR)</Label>
                            <Input
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`font-mono text-sm ${isPaid ? 'text-slate-400' : ''}`}
                                readOnly={isPaid}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Deskripsi (Generated Message)</Label>
                        <Textarea
                            id="desc"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[200px] font-mono text-sm bg-slate-50 dark:bg-black/20 leading-relaxed"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-2">
                <Button variant="outline" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                </Button>
                <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700">
                    <Send className="mr-2 h-4 w-4" /> Send WhatsApp
                </Button>
            </div>
        </ModalOverlay>
    );
};