import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Recruiter } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface RecruiterSectionProps {
  recruiters: Recruiter[];
  selectedId: number | undefined;
  onSelect: (recruiterId: number | undefined) => void;
  onCreateRecruiter: (data: {
    firstName: string;
    lastName: string;
    email?: string;
    linkedinUrl?: string;
  }) => Promise<Recruiter>;
}

export function RecruiterSection({
  recruiters,
  selectedId,
  onSelect,
  onCreateRecruiter,
}: RecruiterSectionProps) {
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const selected = recruiters.find((r) => r.id === selectedId);
  const filtered = recruiters.filter((r) =>
    `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () => {
    setCreating(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setLinkedinUrl('');
  };

  const handleCreate = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSubmitting(true);
    try {
      const created = await onCreateRecruiter({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      });
      onSelect(created.id);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création du recruteur:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Recruteur / RH </Label>

      <div className="space-y-3">
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
              {selected
                ? `${selected.firstName} ${selected.lastName}`
                : 'Sélectionner un recruteur...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Rechercher..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>Aucun recruteur trouvé.</CommandEmpty>
                  <CommandGroup>
                    {filtered.map((recruiter) => (
                      <CommandItem
                        key={recruiter.id}
                        onSelect={() => {
                          onSelect(recruiter.id);
                          setOpen(false);
                          setSearch('');
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedId === recruiter.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {recruiter.firstName} {recruiter.lastName}
                        {recruiter.email && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            {recruiter.email}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                    <CommandItem
                      onSelect={() => {
                        setCreating(true);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nouveau recruteur
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {creating && (
          <div className="space-y-2 rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Prénom *</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-1">
                <Label>Nom *</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="space-y-1">
              <Label>LinkedIn</Label>
              <Input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={!firstName.trim() || !lastName.trim() || submitting}
              >
                Créer
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
