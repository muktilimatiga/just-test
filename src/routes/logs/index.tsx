import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AutoTanStackTable } from '@/components/AutoTable';
import { useActivityLog } from '@/hooks/supabase/useActivityLogger';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { LogRecord } from '@/hooks/supabase/useActivityLogger';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/logs/')({
    component: LogsPage,
});

function LogsPage() {
    const { data: logs = [], isLoading, refetch, isFetching } = useActivityLog();

    const columnOverrides = useMemo<Partial<Record<keyof LogRecord, ColumnDef<LogRecord>>>>(
        () => ({
            timestamp: {
                header: 'Time',
                cell: ({ getValue }) => {
                    const date = new Date(getValue() as string);
                    return (
                        <div className="flex flex-col" >
                            <span className="font-bold text-xs" > {date.toLocaleDateString()} </span>
                            < span className="text-[10px] text-muted-foreground" >
                                {date.toLocaleTimeString()}
                            </span>
                        </div>
                    );
                },
            },
            status: {
                header: 'Status',
                cell: ({ getValue }) => {
                    const status = getValue() as string;
                    const colors: Record<string, string> = {
                        SUCCESS: 'bg-green-100 text-green-700 border-green-200',
                        ERROR: 'bg-red-100 text-red-700 border-red-200',
                        INFO: 'bg-blue-100 text-blue-700 border-blue-200',
                    };
                    return (
                        <Badge variant="outline" className={colors[status] || ''} >
                            {status}
                        </Badge>
                    );
                },
            },
            details: {
                header: 'Details',
                cell: ({ getValue }) => {
                    const val = getValue() as string;
                    // Truncate long details
                    return (
                        <div
                            className="max-w-[300px] truncate text-xs text-muted-foreground"
                            title={val}
                        >
                            {val}
                        </div>
                    );
                },
            },
        }),
        []
    );

    return (
        <div className="p-8 space-y-6" >
            <div className="flex justify-between items-center" >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" > System Activity Logs </h1>
                    < p className="text-sm text-muted-foreground" >
                        Audit trail of system actions, configurations, and errors.
                    </p>
                </div>
                < Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                    />
                    Refresh
                </Button>
            </div>

            {
                isLoading ? (
                    <div className="p-10 text-center text-muted-foreground" > Loading logs...</div>
                ) : (
                    <AutoTanStackTable<LogRecord>
                        data={logs}
                        columnOverrides={columnOverrides}
                        pageSize={15}
                    />
                )
            }
        </div>
    );
}