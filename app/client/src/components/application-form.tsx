import { CompanyCombobox } from '@/components/company-combobox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import type { Application } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface ApplicationFormProps {
  editing: Application | null;
  onDone: () => void;
}

export function ApplicationForm({ editing, onDone }: ApplicationFormProps) {
  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: api.getCompanies,
  });

  const createMutation = useMutation({
    mutationFn: api.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onDone();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof api.updateApplication>[1] }) =>
      api.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onDone();
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: api.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const form = useForm({
    defaultValues: {
      companyId: editing?.companyId ?? (undefined as number | undefined),
      url: editing?.url ?? '',
      appliedAt: editing?.appliedAt ? new Date(editing.appliedAt) : new Date(),
      notes: editing?.notes ?? '',
      city: editing?.address?.city ?? '',
      region: editing?.address?.region ?? '',
      country: editing?.address?.country ?? '',
    },
    onSubmit: async ({ value }) => {
      const address =
        value.city || value.region || value.country
          ? {
              city: value.city || undefined,
              region: value.region || undefined,
              country: value.country || undefined,
            }
          : undefined;

      const payload = {
        companyId: value.companyId!,
        url: value.url || undefined,
        appliedAt: value.appliedAt.toISOString(),
        notes: value.notes || undefined,
        address,
      };

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editing ? 'Modifier la candidature' : 'Nouvelle candidature'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="companyId">
            {(field) => (
              <div className="space-y-2">
                <Label>Entreprise *</Label>
                <CompanyCombobox
                  companies={companies}
                  value={field.state.value}
                  onChange={(id) => field.handleChange(id)}
                  onCreateCompany={async (name) => {
                    const company = await createCompanyMutation.mutateAsync({ name });
                    return company;
                  }}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="url">
            {(field) => (
              <div className="space-y-2">
                <Label>URL de l'annonce</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="appliedAt">
            {(field) => (
              <div className="space-y-2">
                <Label>Date de candidature *</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.state.value && 'text-muted-foreground',
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.state.value
                      ? format(field.state.value, 'PPP', { locale: fr })
                      : 'Choisir une date'}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.state.value}
                      onSelect={(date) => date && field.handleChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </form.Field>

          <div className="space-y-2">
            <Label>Adresse (optionnel)</Label>
            <div className="grid grid-cols-3 gap-2">
              <form.Field name="city">
                {(field) => (
                  <Input
                    placeholder="Ville"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
              <form.Field name="region">
                {(field) => (
                  <Input
                    placeholder="Région"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
              <form.Field name="country">
                {(field) => (
                  <Input
                    placeholder="Pays"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
          </div>

          <form.Field name="notes">
            {(field) => (
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Notes..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Envoi...' : editing ? 'Modifier' : 'Ajouter'}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={onDone}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
