import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { Check, MapPin, Plus, X } from 'lucide-react';
import { useState } from 'react';

type Step = 'country' | 'region' | 'city';

const stepLabels: Record<Step, string> = {
  country: 'Pays',
  region: 'Région',
  city: 'Ville',
};

interface LocationPickerProps {
  country: string;
  region: string;
  city: string;
  onCountryChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onCityChange: (v: string) => void;
  countries: string[];
  regions: string[];
  cities: string[];
}

export function LocationPicker({
  country,
  region,
  city,
  onCountryChange,
  onRegionChange,
  onCityChange,
  countries,
  regions,
  cities,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('country');
  const [search, setSearch] = useState('');

  const hasAny = !!(country || region || city);

  function getNextMissingStep(): Step | null {
    if (!country) return 'country';
    if (!region) return 'region';
    if (!city) return 'city';
    return null;
  }

  function openAtStep(s: Step) {
    setStep(s);
    setSearch('');
    setOpen(true);
  }

  function handleOpen() {
    const next = getNextMissingStep();
    openAtStep(next ?? 'country');
  }

  function handleRemoveCountry() {
    onCountryChange('');
    onRegionChange('');
    onCityChange('');
  }

  function handleRemoveRegion() {
    onRegionChange('');
    onCityChange('');
  }

  function handleRemoveCity() {
    onCityChange('');
  }

  // Current step data
  const items = step === 'country' ? countries : step === 'region' ? regions : cities;
  const currentValue = step === 'country' ? country : step === 'region' ? region : city;
  const filtered = items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = items.some((item) => item.toLowerCase() === search.toLowerCase());

  function handleSelect(value: string) {
    if (step === 'country') {
      onCountryChange(value);
      setSearch('');
      setStep('region');
    } else if (step === 'region') {
      onRegionChange(value);
      setSearch('');
      setStep('city');
    } else {
      onCityChange(value);
      setSearch('');
      setOpen(false);
    }
  }

  function handleSkip() {
    if (step === 'region') {
      setSearch('');
      setStep('city');
    } else if (step === 'city') {
      setSearch('');
      setOpen(false);
    }
  }

  const steps: Step[] = ['country', 'region', 'city'];

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<div className="flex flex-wrap items-center gap-1.5" />}
          onClick={() => {
            if (!hasAny) handleOpen();
          }}
        >
          {hasAny ? (
            <>
              {country && (
                <Badge variant="outline" className="gap-1 pr-1">
                  {country}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCountry();
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {region && (
                <Badge variant="outline" className="gap-1 pr-1">
                  {region}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRegion();
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {city && (
                <Badge variant="outline" className="gap-1 pr-1">
                  {city}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCity();
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {getNextMissingStep() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen();
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex w-full items-center rounded-md border border-input px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent">
              <MapPin className="mr-2 h-4 w-4" />
              Ajouter une localisation...
            </div>
          )}
        </PopoverTrigger>

        <PopoverContent className="w-64 p-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 border-b px-3 py-2 text-xs text-muted-foreground">
            {steps.map((s, i) => (
              <span key={s} className="flex items-center gap-1">
                {i > 0 && <span>›</span>}
                <span className={cn(s === step && 'font-semibold text-foreground')}>
                  {stepLabels[s]}
                </span>
              </span>
            ))}
          </div>

          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Rechercher un ${stepLabels[step].toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              <CommandGroup>
                {filtered.map((item) => (
                  <CommandItem key={item} onSelect={() => handleSelect(item)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentValue === item ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {item}
                  </CommandItem>
                ))}
                {search.trim() && !exactMatch && (
                  <CommandItem onSelect={() => handleSelect(search.trim())}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter &quot;{search.trim()}&quot;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>

          {/* Skip button for region and city */}
          {step !== 'country' && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={handleSkip}
              >
                Passer
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
