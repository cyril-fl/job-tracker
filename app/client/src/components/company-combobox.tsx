import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Company } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface CompanyComboboxProps {
  companies: Company[];
  value: number | undefined;
  onChange: (companyId: number) => void;
  onCreateCompany: (name: string) => Promise<Company>;
}

export function CompanyCombobox({
  companies,
  value,
  onChange,
  onCreateCompany,
}: CompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = companies.find((c) => c.id === value);
  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = companies.some((c) => c.name.toLowerCase() === search.toLowerCase());

  return (
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
                <CommandItem
                  key={company.id}
                  onSelect={() => {
                    onChange(company.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === company.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {company.name}
                </CommandItem>
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
  );
}
