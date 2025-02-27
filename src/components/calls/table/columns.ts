import type { Call } from "$/actions/calls";
import type { ColumnDef } from "@tanstack/table-core";
import { renderSnippet } from "$/components/ui/data-table";
import {
  badgeCell,
  dateCell,
  multipleAvatars,
  singleAvatarCell,
} from "./cells.svelte";

export const columns: ColumnDef<Call>[] = [
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   cell: ({ row }) => {
  //     return renderSnippet(badgeCell, row.getValue("id"));
  //   },
  // },
  {
    accessorKey: "scheduled",
    header: "Scheduled",
    cell: ({ row }) => {
      return renderSnippet(dateCell, row.getValue("scheduled"));
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "host",
    header: "Host",
    cell: ({ row }) => {
      const fullHost = row.original.expand?.host;
      if (!fullHost) return renderSnippet(badgeCell, row.getValue("host"));
      return renderSnippet(singleAvatarCell, fullHost);
    },
  },
  {
    accessorKey: "guests",
    header: "Guests",
    cell: ({ row }) => {
      const fullGuests = row.original.expand?.guests;

      if (!fullGuests) return row.original.guests.length;

      return renderSnippet(multipleAvatars, fullGuests);
    },
  },
];
