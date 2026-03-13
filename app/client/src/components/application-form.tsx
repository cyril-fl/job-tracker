import { CompanyCombobox } from '@/components/company-combobox';
import { LocationPicker } from '@/components/location-picker';
import { RecruiterSection } from '@/components/recruiter-section';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import type { Application, ApplicationType } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { useRef } from 'react';

const applicationTypeLabels: Record<ApplicationType, string> = {
  spontaneous: 'Candidature spontanée',
  job_posting: 'Annonce',
  recruitment: 'Recrutement',
  other: 'Autre',
};

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

interface ApplicationFormProps {
  editing: Application | null;
  onDone: () => void;
}

export function ApplicationForm({ editing, onDone }: ApplicationFormProps) {
  const queryClient = useQueryClient();
  const submitAsDraftRef = useRef(false);
  const isEditingDraft = editing?.status === 'draft';
  const isEditingNonDraft = editing !== null && !isEditingDraft;

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: api.getCompanies,
  });

  const createMutation = useMutation({
    mutationFn: api.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onDone();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof api.updateApplication>[1] }) =>
      api.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onDone();
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: api.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const createRecruiterMutation = useMutation({
    mutationFn: api.createRecruiter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters'] });
    },
  });

  const form = useForm({
    defaultValues: {
      companyId: editing?.companyId ?? (undefined as number | undefined),
      website: editing?.company?.website ?? '',
      applicationType: (editing?.applicationType ?? '') as ApplicationType | '',
      jobPostingUrl: editing?.jobPostingUrl ?? '',
      appliedAt: editing?.appliedAt ? new Date(editing.appliedAt) : (null as Date | null),
      country: editing?.location?.country ?? '',
      region: editing?.location?.region ?? '',
      city: editing?.location?.city ?? '',
      recruiterId: editing?.recruiterId ?? (undefined as number | undefined),
      notes: editing?.notes ?? '',
      rating: editing?.rating ?? 0,
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

      // Update company website if changed
      if (value.companyId && value.website) {
        const company = companies.find((c) => c.id === value.companyId);
        if (company && company.website !== value.website) {
          await api.updateCompany(value.companyId, { website: value.website });
        }
      }

      const isDraft = submitAsDraftRef.current;

      const payload = {
        companyId: value.companyId!,
        applicationType: value.applicationType || undefined,
        jobPostingUrl: value.jobPostingUrl || undefined,
        recruiterId: value.recruiterId,
        appliedAt: isDraft
          ? value.appliedAt?.toISOString()
          : (value.appliedAt ?? new Date()).toISOString(),
        status: isDraft ? ('draft' as const) : ('pending' as const),
        notes: value.notes || undefined,
        rating: value.rating || undefined,
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

  const companyId = useStore(form.store, (s) => s.values.companyId);
  const applicationType = useStore(form.store, (s) => s.values.applicationType);
  const country = useStore(form.store, (s) => s.values.country);
  const region = useStore(form.store, (s) => s.values.region);
  const city = useStore(form.store, (s) => s.values.city);

  const { data: countries = [] } = useQuery({
    queryKey: ['locations', 'countries'],
    queryFn: api.getCountries,
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['locations', 'regions', country],
    queryFn: () => api.getRegions(country),
    enabled: !!country,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['locations', 'cities', country, region],
    queryFn: () => api.getCities(country, region || undefined),
    enabled: !!country,
  });

  const { data: recruiters = [] } = useQuery({
    queryKey: ['recruiters', companyId],
    queryFn: () => api.getRecruiters(companyId!),
    enabled: !!companyId,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{editing ? 'Modifier la candidature' : 'Nouvelle candidature'}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            form.reset();
            onDone();
          }}
          aria-label="Réinitialiser le formulaire"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="space-y-6"
        >
          {/* Section 1: Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informations générales
            </h3>

            <form.Field
              name="companyId"
              validators={{
                onSubmit: ({ value }) => (!value ? 'Sélectionnez une entreprise' : undefined),
                onChange: ({ value }) => (!value ? 'Sélectionnez une entreprise' : undefined),
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Entreprise *</Label>
                  <CompanyCombobox
                    companies={companies}
                    value={field.state.value}
                    onChange={(id) => {
                      field.handleChange(id);
                      // Pre-fill website from company
                      const company = companies.find((c) => c.id === id);
                      if (company?.website) {
                        form.setFieldValue('website', company.website);
                      }
                    }}
                    onCreateCompany={async (name) => {
                      const company = await createCompanyMutation.mutateAsync({
                        name,
                      });
                      return company;
                    }}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="website"
              validators={{
                onChange: ({ value }) => (value && !isValidUrl(value) ? 'URL invalide' : undefined),
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Site web</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.some(Boolean)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="applicationType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Type de candidature</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as ApplicationType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un type...">
                        {field.state.value
                          ? applicationTypeLabels[field.state.value as ApplicationType]
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(applicationTypeLabels) as [ApplicationType, string][]).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {applicationType === 'job_posting' && (
              <form.Field
                name="jobPostingUrl"
                validators={{
                  onChange: ({ value }) =>
                    value && !isValidUrl(value) ? 'URL invalide' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label>Lien de l'annonce</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={field.state.meta.errors.some(Boolean)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
            )}

            {companyId && (
              <form.Field name="recruiterId">
                {(field) => (
                  <RecruiterSection
                    recruiters={recruiters}
                    selectedId={field.state.value}
                    onSelect={(id) => field.handleChange(id)}
                    onCreateRecruiter={async (data) => {
                      const created = await createRecruiterMutation.mutateAsync({
                        companyId,
                        ...data,
                      });
                      return created;
                    }}
                  />
                )}
              </form.Field>
            )}
          </div>

          <form.Field name="appliedAt">
            {(field) => (
              <div className="space-y-2">
                <Label>Date de candidature</Label>
                <div>
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
                        selected={field.state.value ?? undefined}
                        onSelect={(date) => date && field.handleChange(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </form.Field>

          {/* Section 2: Localisation */}
          <div className="space-y-2">
            <Label>Localisation</Label>
            <LocationPicker
              country={country}
              region={region}
              city={city}
              onCountryChange={(v) => {
                form.setFieldValue('country', v);
                if (!v) {
                  form.setFieldValue('region', '');
                  form.setFieldValue('city', '');
                }
              }}
              onRegionChange={(v) => {
                form.setFieldValue('region', v);
                if (!v) {
                  form.setFieldValue('city', '');
                }
              }}
              onCityChange={(v) => form.setFieldValue('city', v)}
              countries={countries}
              regions={regions}
              cities={cities}
            />
          </div>

          {/* Section 4: Notes & Évaluation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Notes & Évaluation
            </h3>

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

            <form.Field name="rating">
              {(field) => (
                <div className="space-y-2">
                  <Label>Review</Label>
                  <StarRating value={field.state.value} onChange={field.handleChange} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex gap-2">
            {isEditingNonDraft ? (
              <>
                <Button
                  type="button"
                  disabled={isPending}
                  className="flex-1"
                  onClick={() => {
                    submitAsDraftRef.current = false;
                    form.handleSubmit();
                  }}
                >
                  {isPending ? 'Envoi...' : 'Modifier'}
                </Button>
                <Button type="button" variant="outline" onClick={onDone}>
                  Annuler
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    submitAsDraftRef.current = true;
                    form.handleSubmit();
                  }}
                >
                  {isPending && submitAsDraftRef.current ? 'Envoi...' : 'Enregistrer brouillon'}
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  className="flex-1"
                  onClick={() => {
                    submitAsDraftRef.current = false;
                    form.handleSubmit();
                  }}
                >
                  {isPending && !submitAsDraftRef.current
                    ? 'Envoi...'
                    : editing
                      ? 'Candidater'
                      : 'Ajouter'}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={onDone}>
                    Annuler
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
