import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AutoTanStackTable } from '@/components/AutoTable'
import { useSupabaseCustomerViews } from '@/hooks/supabase/useSupbaseCustomerViews'
import type { Customer } from '@/types'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Input, Button } from '@/components/ui'
import { useDebounce } from 'use-debounce'
import { Copy, MapPin, KeyRound } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { InvoicePaymentModal } from '@/components/modal/invoicesModal'
import { CustomerDetailModal } from '@/components/modal/custonerCardModal'



const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) {
    return (
      <Badge variant="outline" className="text-gray-500 border-gray-200">
        Checking...
      </Badge>
    )
  }

  const styles: Record<string, string> = {
    online:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50',
    offline:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50',
    los: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50',
    dyinggasp:
      'text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/50',
  }

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
  const style =
    styles[normalizedStatus] ||
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
  const label = status.replace(/_/g, ' ')

  return (
    <Badge
      variant="outline"
      className={`capitalize font-normal border ${style}`}
    >
      {label}
    </Badge>
  )
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.success('Copied!')
}

export function BroadbandPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )

  const { data: customers = [], isLoading } =
    useSupabaseCustomerViews(debouncedSearch)
  const columnOverrides = useMemo(() => {
    const overrides: Partial<Record<keyof Customer | 'actions', ColumnDef<Customer>>> = {

      // 1. CUSTOM NAME COLUMN (Name + Alamat)
      name: {
        header: 'Name',
        // 'row.original' gives you access to HIDDEN fields like 'alamat'
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[200px]">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {row.original.name}
            </span>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground truncate">
              <MapPin className="h-3 w-3 shrink-0 opacity-50" />
              <span className="truncate" title={row.original.alamat}>
                {row.original.alamat || 'No Address'}
              </span>
            </div>
          </div>
        ),
      },

      // 2. CUSTOM PPPOE COLUMN (User | Pass)
      user_pppoe: {
        header: 'PPPoE Credentials',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            {/* Username */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => copyText(row.original.user_pppoe as string)}
            >
              <span className="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                {row.original.user_pppoe}
              </span>
              <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Password (Optional: only show if you really want it exposed on the table) */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
              <KeyRound className="h-3 w-3 opacity-50" />
              {/* Check if pppoe_pass exists in your type/data */}
              <span className="font-mono">
                {/* @ts-ignore: Assuming pppoe_pass exists in your data even if not in type */}
                {row.original.pppoe_password}
              </span>
            </div>
          </div>
        ),
      },
      actions: {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="default"
            size="sm"
            onClick={() => setSelectedCustomer(row.original)}
          >
            Tagihan
          </Button>
        ),
      },
    }
    return overrides
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading broadband customers...
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Broadband Customers
        </h1>
        {/* 4. Add a Search Input */}
        <div className="w-64">
          <Input
            placeholder="Search database..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <AutoTanStackTable<Customer>
        data={customers}
        columnOverrides={columnOverrides}
        pageSize={20}
        enableSearch={false}
        visibleColumns={['name', 'user_pppoe', 'snmp_status']}
      />

      {selectedCustomer && (
        <InvoicePaymentModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          user={selectedCustomer}
        />
      )}
    </div>
  )
}

export const Route = createFileRoute('/broadband/')({
  component: BroadbandPage,
})
