import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export function ColumnFilter({ column }: { column: any }) {
  const meta = column.columnDef.meta;

  if (meta?.filterType !== "select") return null;

  const value = column.getFilterValue() ?? "__all__";

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === "__all__") {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(v);
        }
      }}
    >
      <SelectTrigger
        className="
    h-6 w-10
    p-0
    gap-1
    flex items-center justify-center
    rounded-md
    hover:bg-muted
    focus:ring-1 focus:ring-ring
    data-[state=open]:bg-muted
  "
        aria-label="Filter by status"
      >
        <SelectValue className="hidden" />

        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </SelectTrigger>



      <SelectContent>

        {meta.filterOptions?.map((opt: string) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

