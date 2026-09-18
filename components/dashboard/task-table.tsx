'use client'

import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, legacyCreateColumnHelper, useLegacyTable, type LegacyFeatures } from '@tanstack/react-table/legacy';
import { flexRender, type SortingState } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { useState } from 'react';

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  dueDate: Date | null;
  project: { name: string };
  assignee: { name: string } | null;
}

const STATUS_LABEL: Record<Status, string> = {TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done"};
const PRIORITY_VARIANT = { LOW: "secondary", MEDIUM: "default", HIGH: "destructive"} as const;
const columnHelper = legacyCreateColumnHelper<Task>();

const columns: ColumnDef<LegacyFeatures, Task, any>[] = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => (
      <Link href={`/tasks/${info.row.original.id}`} className='font-medium hover:underline'>
        {info.getValue()}
      </Link>
    )
  }),
  columnHelper.accessor((row) => row.project.name, {
    id: "project",
    header: "Project"
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <button className='flex items-center gap-1 text-xs font-medium' onClick={column.getToggleSortingHandler()}>
        Status <ArrowUpDown className='h-3 w-3' />
      </button>
    ),
    cell: (info) => STATUS_LABEL[info.getValue() as Status],
  }),
  columnHelper.accessor("priority", {
    header: ({ column }) => (
      <button className='flex items-center gap-1 text-xs font-medium' onClick={column.getToggleSortingHandler()}>
        Priority <ArrowUpDown className='h-3 w-3' />
      </button>
    ),
    cell: (info) => {
      const priority = info.getValue() as Priority;
      return <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>
    },
  }),
  columnHelper.accessor("dueDate", {
    header: ({ column }) => (
      <button className='flex items-center gap-1 text-xs font-medium' onClick={column.getToggleSortingHandler()}>
        Due <ArrowUpDown className='h-3 w-3' />
      </button>
    ),
    cell: (info) => {
      const d = info.getValue();
      return d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric"}) : "-";
    }
  })
]

export function DashboardTaskTable({ tasks }: { tasks: Task[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const table = useLegacyTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter }
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input 
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder='Search tasks ...'
          className='h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm 
                    placeholder:text-muted-foreground focus:ouline-none focus:ring-1 focus:ring-ring
                    sm:flex-none sm:w-56'/>
        
        <select 
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            table.getColumn("status")?.setFilterValue(e.target.value || undefined);
          }}
          className='h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring'>
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className='w-full min-w-160 text-sm'>
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='px-4 py-8 text-center tex-sm text-muted-foreground'>
                  No tasks found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className='border-t hover:bg-muted/30 transition-colors'>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className='px-4 py-2.5'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}