import { createFileRoute } from '@tanstack/react-router'
import { AutoTanStackTable } from '@/components/AutoTable'
import { useSupabaseCustomerViews } from '@/hooks/supabase/useSupbaseCustomerViews'
import { Customer } from '@/types'
import { Badge } from '@/components/ui/badge'
import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'

const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) return <Badge variant="outline" className = "text-gray-500 border-gray-200" > Checking...</Badge>;

    const styles: Record<string, string> = {
        online: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50",
        offline: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50",
        los: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50",
        dying_gasp: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/50",
        unconfigured: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
    };

    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
    const style = styles[normalizedStatus] || "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    const label = status.replace(/_/g, ' ');

    return (
        <Badge variant= "outline" className = {`capitalize font-normal border ${style}`
}>
    { label }
    </Badge>
  );
};


export function BroadbandPage() {
    const { data: customers = [], isLoading } = useSupabaseCustomerViews()

    const columnOverrides = useMemo(() => {
        const overrides: Partial<Record<keyof Customer | 'actions', ColumnDef<Customer>>> = {
            snmp_status: {
                accessorKey: 'snmp_status',
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge status={ getValue() as string
    } />,
            },
rx_power_str: {
    accessorKey: 'rx_power_str',
        header: 'Signal (dBm)',
            cell: ({ getValue }) => {
                const val = getValue() as string;
                if (!val) return '-';
                const num = parseFloat(val);
                let color = 'text-gray-700';
                if (!isNaN(num)) {
                    if (num < -27) color = 'text-red-500 font-bold';
                    else if (num < -25) color = 'text-orange-500';
                    else color = 'text-green-600';
                }
                return <span className={ color }> { val } </span>
            }
},
created_at: {
    accessorKey: 'created_at',
        header: 'Registered',
            cell: ({ getValue }) => {
                const val = getValue() as string;
                if (!val) return '-';
                const date = new Date(val);
                return date.toLocaleDateString()
            }
},
actions: {
    id: 'actions',
        header: 'Actions',
            cell: () => <div className="text-xs text-muted-foreground" > View </div>
}
        };
return overrides;
    }, []);

if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground" > Loading broadband customers...</div>
}

return (
    <div className= "p-4 space-y-4" >
    <h1 className="text-2xl font-bold tracking-tight" > Broadband Customers </h1>
        < AutoTanStackTable<Customer>
data = { customers }
columnOverrides = { columnOverrides }
pageSize = { 15}
    />
    </div>
    )
}


export const Route = createFileRoute('/broadband/')({
    component: BroadbandPage,
})
