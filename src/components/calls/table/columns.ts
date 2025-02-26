import { createRawSnippet } from "svelte";
import type { Call } from "$/actions/calls";
import type { ColumnDef } from "@tanstack/table-core";
import { renderSnippet } from "$/components/ui/data-table";

export const columns: ColumnDef<Call>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "scheduled",
    header: "Scheduled",
    cell: ({ row }) => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const amountCellSnippet = createRawSnippet<[string]>((getScheduled) => {
        const scheduled = getScheduled();
        return {
          render: () => `${scheduled}`,
        };
      });

      return renderSnippet(
        amountCellSnippet,
        formatter.format(new Date(row.getValue("scheduled")))
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
];
