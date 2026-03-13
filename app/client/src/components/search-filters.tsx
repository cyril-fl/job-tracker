import { statusConfig } from '@/components/status-select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { Filter, Search, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

const typeLabels: Record<string, string> = {
  spontaneous: 'Spontanée',
  job_posting: 'Annonce',
  recruitment: 'Recrutement',
  other: 'Autre',
};

interface SearchFiltersProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

export function SearchFilters({
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
}: SearchFiltersProps) {
  const getFilterValue = useCallback(
    (id: string) => columnFilters.find((f) => f.id === id)?.value,
    [columnFilters],
  );

  const setFilterValue = useCallback(
    (id: string, value: unknown) => {
      const next = columnFilters.filter((f) => f.id !== id);
      if (value !== undefined) next.push({ id, value });
      onColumnFiltersChange(next);
    },
    [columnFilters, onColumnFiltersChange],
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 md:flex-none">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="pl-8 w-full md:w-50 lg:w-75"
        />
      </div>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant={columnFilters.length > 0 ? 'default' : 'outline'} size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filtres</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Statut</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={(getFilterValue('status') as string) ?? 'all'}
                onValueChange={(v) => setFilterValue('status', v === 'all' ? undefined : v)}
              >
                <DropdownMenuRadioItem value="all">Tous les statuts</DropdownMenuRadioItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {config.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Type</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={(getFilterValue('applicationType') as string) ?? 'all'}
                onValueChange={(v) =>
                  setFilterValue('applicationType', v === 'all' ? undefined : v)
                }
              >
                <DropdownMenuRadioItem value="all">Tous les types</DropdownMenuRadioItem>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Note</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={(getFilterValue('rating') as number | undefined)?.toString() ?? 'all'}
                onValueChange={(v) => setFilterValue('rating', v === 'all' ? undefined : Number(v))}
              >
                <DropdownMenuRadioItem value="all">Toutes les notes</DropdownMenuRadioItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <DropdownMenuRadioItem key={n} value={String(n)}>
                    {`≥ ${'★'.repeat(n)}`}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={columnFilters.length === 0}
            onClick={() => {
              onGlobalFilterChange('');
              onColumnFiltersChange([]);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Effacer les filtres
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
