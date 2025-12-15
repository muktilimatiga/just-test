import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnFiltersState,
  type ColumnDef,
  type SortingState,
  type ColumnMeta,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button'; // Assuming you have shadcn/ui
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { ColumnFilter } from './ColumnFilter';

type FlterType = "text" | "select" | "date";

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    filterType?: FlterType;
    filterOptions?: string[];
  }
}

interface AutoTanStackTableProps<T> {
  data: T[];
  pageSize?: number;
  columnOverrides?: Partial<Record<keyof T | 'actions', ColumnDef<T>>>; 
}

export function AutoTanStackTable<T extends object>({ 
  data, 
  pageSize = 10, 
  columnOverrides = {} 
}: AutoTanStackTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 1. Get all keys from the first row
    const keys = Object.keys(data[0]);

    // 2. Generate Auto Columns
    const generatedColumns: ColumnDef<T>[] = keys.map((key) => {
  if (columnOverrides[key as keyof T]) {
    return columnOverrides[key as keyof T]!;
  }

  const sampleValue = (data[0] as any)[key];

  return {
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    enableColumnFilter: true,
    filterFn: "includesString",
    meta: detectFilterMeta(sampleValue),
    cell: ({ getValue }) => {
      const val = getValue();
      if (
        typeof val === "string" &&
        !isNaN(Date.parse(val)) &&
        val.length > 10
      ) {
        return new Date(val).toLocaleDateString();
      }
      return String(val ?? "");
    },
  };
});


    // 3. Check for special "actions" override that isn't in the data keys
    if (columnOverrides['actions']) {
      generatedColumns.push(columnOverrides['actions'] as any);
    }

    return generatedColumns;
  }, [data, columnOverrides]);

    function detectFilterMeta(value: unknown): ColumnMeta<any, any> {
      if (typeof value === "string") {
        if (!isNaN(Date.parse(value))) {
          return { filterType: "date" };
        }
        return { filterType: "text" };
      }
      return {};
    }


  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } }
  });

  if (!data.length) return <div className="p-8 text-center text-muted-foreground">No records found.</div>;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="max-w-sm px-3 py-2 border rounded-md text-sm w-64 bg-background"
        />
        <div className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} Records
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
<table className="w-full text-sm text-left">
  <thead className="bg-muted/50">
    {/* Header row */}
    {table.getHeaderGroups().map(headerGroup => (
      <tr key={headerGroup.id} className="border-b">
        {headerGroup.headers.map(header => (
          <th key={header.id} className="px-4 py-2 text-muted-foreground">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={header.column.getToggleSortingHandler()}
            >
              {flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
              {header.column.getCanSort() && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </div>
          </th>
        ))}
      </tr>
    ))}

    {/* Filter row */}
    <tr className="border-b bg-muted/30">
      {table.getHeaderGroups()[0].headers.map(header => (
        <th key={header.id} className="px-4 py-2">
          {header.column.getCanFilter() ? (
            <ColumnFilter column={header.column} />
          ) : null}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {table.getRowModel().rows.map(row => (
      <tr
        key={row.id}
        className="border-b transition-colors hover:bg-muted/50"
      >
        {row.getVisibleCells().map(cell => (
          <td key={cell.id} className="p-4 align-middle">
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>

      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}