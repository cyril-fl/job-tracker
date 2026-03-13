import { StatusSelect } from '@/components/status-select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import type { Application } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface ApplicationsTableProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
}

export function ApplicationsTable({
  applications,
  onEdit,
  globalFilter,
  columnFilters,
  onColumnFiltersChange,
}: ApplicationsTableProps) {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      {
        id: 'company',
        accessorFn: (row) => row.company.name,
        header: 'Entreprise',
        cell: ({ row }) => {
          const { name, website } = row.original.company;
          if (website) {
            return (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {name}
              </a>
            );
          }
          return name;
        },
      },
      {
        id: 'location',
        accessorFn: (row) => {
          const parts = [row.location?.city, row.location?.region, row.location?.country].filter(
            Boolean,
          );
          return parts.length ? parts.join(', ') : '—';
        },
        header: 'Localisation',
      },
      {
        accessorKey: 'applicationType',
        header: 'Type',
        cell: ({ row }) => {
          const labels: Record<string, string> = {
            spontaneous: 'Spontanée',
            job_posting: 'Annonce',
            recruitment: 'Recrutement',
            other: 'Autre',
          };
          return row.original.applicationType ? (labels[row.original.applicationType] ?? '—') : '—';
        },
      },
      {
        id: 'recruiter',
        accessorFn: (row) =>
          row.recruiter ? `${row.recruiter.firstName} ${row.recruiter.lastName}` : '—',
        header: 'Recruteur',
      },
      {
        accessorKey: 'rating',
        header: 'Review',
        enableGlobalFilter: false,
        filterFn: (row, _columnId, filterValue) => {
          const rating = row.getValue<number | null>('rating');
          return rating != null && rating >= filterValue;
        },
        cell: ({ row }) => {
          const rating = row.original.rating;
          if (!rating) return '—';
          return '★'.repeat(rating) + '☆'.repeat(5 - rating);
        },
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <StatusSelect
            value={row.original.status}
            onChange={(status) => updateStatusMutation.mutate({ id: row.original.id, status })}
          />
        ),
      },
      {
        accessorKey: 'appliedAt',
        header: 'Date',
        enableGlobalFilter: false,
        cell: ({ row }) =>
          row.original.appliedAt
            ? format(new Date(row.original.appliedAt), 'dd MMM yyyy', { locale: fr })
            : '—',
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, updateStatusMutation],
  );

  const table = useReactTable({
    data: applications,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
  });

  return (
    <>
      <div className="mb-3 flex justify-end text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length === applications.length
          ? `Candidatures (${applications.length})`
          : `${table.getFilteredRowModel().rows.length} / ${applications.length} résultats`}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && (
                          <ArrowUp className="h-3.5 w-3.5" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )}
                        {!header.column.getIsSorted() && (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.original.status === 'draft' ? 'opacity-50' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  {applications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">Aucune candidature pour le moment.</p>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez votre première candidature via le formulaire.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">
                        Aucun résultat ne correspond à vos filtres.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          table.resetColumnFilters();
                        }}
                      >
                        Effacer les filtres
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Lignes par page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(v === 'all' ? applications.length : Number(v))}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette candidature ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
