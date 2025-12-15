import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ColumnFilter({ column }: { column: any }) {
  const meta = column.columnDef.meta;

  if (meta?.filterType !== "select") return null;

  return (
    <Select
      value={column.getFilterValue() ?? ""}
      onValueChange={(value) =>
        column.setFilterValue(value || undefined)
      }
    >
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All</SelectItem>
        {meta.filterOptions?.map((opt: string) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
