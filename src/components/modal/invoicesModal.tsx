import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Copy,
  Send,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Label, Input, Textarea, Button } from '@/components/ui'
import { ModalOverlay } from '@/components/ModalOverlay'
import type { Customer } from '@/types'
import type { InvoiceItem } from '@/services/generated/model'
import { useCustomerInvoices } from '@/hooks/useApi'

// Helper: Extract numbers for the "Amount" input field only (visual aid)
const parseAmount = (pkgString: string | undefined): string => {
  if (!pkgString) return '0'
  const match = pkgString.match(/Rp\.?\s*([\d.]+)/i)
  return match && match[1] ? match[1].replace(/\./g, '') : '0'
}

interface InvoicePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  user: Customer | null
}


export const InvoicePaymentModal = ({
  isOpen,
  onClose,
  user,
}: InvoicePaymentModalProps) => {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  // 1. Fetch Invoices
  const query = user?.user_pppoe?.toString() || ''
  const { data: customersWithInvoices, isLoading } = useCustomerInvoices(query)

  // 2. Logic: Get the absolute latest invoice data from API
  const invoiceData = useMemo(() => {
    if (!customersWithInvoices || customersWithInvoices.length === 0)
      return null
    const customer = customersWithInvoices[0]

    // Sort descending by date to ensure we get the latest generated invoice
    const invoices = (customer.invoices as unknown as InvoiceItem[]) || []
    const sortedInvoices = invoices
      ? [...invoices].sort((a, b) => {
        if ((b.year ?? 0) !== (a.year ?? 0))
          return (b.year ?? 0) - (a.year ?? 0)
        return (b.month ?? 0) - (a.month ?? 0)
      })
      : []

    return {
      ...customer,
      currentInvoice: sortedInvoices[0],
    }
  }, [customersWithInvoices])

  const status = invoiceData?.currentInvoice?.status || 'Unknown'
  const isPaid = status.toLowerCase() === 'paid'

  // 3. Effect: Sync Amount (Visual only)
  useEffect(() => {
    if (isPaid) {
      setAmount('0')
    } else if (invoiceData?.currentInvoice) {
      // Try to parse from package, e.g. "CIGNAL 10M (Rp 111.000)"
      const parsed = parseAmount(
        invoiceData.currentInvoice.package ?? undefined,
      )
      setAmount(parsed !== '0' ? parsed : '')
    }
  }, [invoiceData, isPaid])

  // 4. Effect: Sync Message STRICTLY from API
  // WE DO NOT GENERATE TEXT HERE. WE ONLY READ.
  useEffect(() => {
    if (invoiceData?.currentInvoice?.description) {
      // DIRECT MAPPING: "What the backend says, goes."
      setMessage(invoiceData.currentInvoice.description ?? '')
    } else {
      // If API has no description, leave empty. Do not guess.
      setMessage('')
    }
  }, [invoiceData])

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
  }

  if (!user) return null

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={true}
      className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}
          >
            {isPaid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isPaid ? 'Status: Lunas' : 'Kirim Tagihan'}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {isLoading ? (
          <div className="p-4 text-center text-slate-500">
            Loading invoice data...
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Read-Only Info Block */}
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Customer Name</span>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">ID / PPPoE</span>
                  <span className="text-sm font-mono">{user.user_pppoe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">
                    Periode Tagihan
                  </span>
                  <span className="text-sm font-medium">
                    {invoiceData?.currentInvoice?.period || '-'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status Tagihan Bulan Ini</Label>
                  <Input
                    value={invoiceData?.currentInvoice?.status || ''}
                    readOnly
                    className="bg-slate-50 text-slate-500 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nominal (System)</Label>
                  <Input
                    value={amount}
                    readOnly
                    className="bg-slate-50 text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 ">
                <div className="flex justify-between items-center mb-2">
                  <Label>Pesan (Dari System)</Label>
                  {!message && !isLoading && (
                    <span className="space-y-2 text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Description missing
                      from API
                    </span>
                  )}
                </div>

                {/* The Critical Part: This displays exactly what the API sent */}
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)} // User can tweak if absolutely needed
                  className="min-h-[220px] font-mono text-xs leading-relaxed bg-white dark:bg-black/20"
                  placeholder={
                    isLoading
                      ? 'Loading...'
                      : 'No description available from server.'
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-white/10 flex justify-end gap-2 bg-slate-50/50 dark:bg-white/5">
        <Button variant="outline" onClick={handleCopy} disabled={!message}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
        <Button
          onClick={onClose}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Send className="mr-2 h-4 w-4" /> {isPaid ? 'Tutup' : 'Kirim'}
        </Button>
      </div>
    </ModalOverlay>
  )
}
