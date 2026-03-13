import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Company } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface CompanyComboboxProps {
  companies: Company[];
  value: number | undefined;
  onChange: (companyId: number | undefined) => void;
  onCreateCompany: (name: string) => Promise<Company>;
  onUpdateCompany: (id: number, name: string) => Promise<void>;
  onDeleteCompany: (id: number) => Promise<void>;
}

export function CompanyCombobox({
  companies,
  value,
  onChange,
  onCreateCompany,
  onUpdateCompany,
  onDeleteCompany,
}: CompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const selected = companies.find((c) => c.id === value);
  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = companies.some((c) => c.name.toLowerCase() === search.toLowerCase());

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            />
          }
        >
          {selected?.name ?? 'Sélectionner une entreprise...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Rechercher..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>Aucune entreprise trouvée.</CommandEmpty>
              <CommandGroup>
                {filtered.map((company) => (
                  <ContextMenu key={company.id}>
                    <ContextMenuTrigger>
                      <CommandItem
                        onSelect={() => {
                          if (editingId === company.id) return;
                          onChange(company.id);
                          setOpen(false);
                          setSearch('');
                        }}
                      >
                        {editingId === company.id ? (
                          <form
                            className="flex items-center gap-1 flex-1"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editName.trim()) {
                                await onUpdateCompany(company.id, editName.trim());
                                setEditingId(null);
                              }
                            }}
                          >
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-6 text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }
                              }}
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </form>
                        ) : (
                          <>
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                value === company.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {company.name}
                          </>
                        )}
                      </CommandItem>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => {
                          setEditingId(company.id);
                          setEditName(company.name);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Renommer
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={async () => {
                          await onDeleteCompany(company.id);
                          if (value === company.id) {
                            onChange(undefined);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                {search.trim() && !exactMatch && (
                  <CommandItem
                    onSelect={async () => {
                      const created = await onCreateCompany(search.trim());
                      onChange(created.id);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    Créer &quot;{search.trim()}&quot;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
