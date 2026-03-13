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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
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
  onRenameItem?: (step: Step, oldValue: string, newValue: string) => Promise<void>;
  onDeleteItem?: (step: Step, value: string) => Promise<void>;
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
  onRenameItem,
  onDeleteItem,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('country');
  const [search, setSearch] = useState('');
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

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
                  <ContextMenu key={item}>
                    <ContextMenuTrigger>
                      <CommandItem
                        onSelect={() => {
                          if (editingValue === item) return;
                          handleSelect(item);
                        }}
                      >
                        {editingValue === item ? (
                          <form
                            className="flex items-center gap-1 flex-1"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editName.trim() && onRenameItem) {
                                await onRenameItem(step, item, editName.trim());
                                if (currentValue === item) {
                                  const setter =
                                    step === 'country'
                                      ? onCountryChange
                                      : step === 'region'
                                        ? onRegionChange
                                        : onCityChange;
                                  setter(editName.trim());
                                }
                                setEditingValue(null);
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
                                  setEditingValue(null);
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
                                setEditingValue(null);
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
                                currentValue === item ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {item}
                          </>
                        )}
                      </CommandItem>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => {
                          setEditingValue(item);
                          setEditName(item);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Renommer
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={async () => {
                          if (onDeleteItem) {
                            await onDeleteItem(step, item);
                            if (currentValue === item) {
                              const setter =
                                step === 'country'
                                  ? onCountryChange
                                  : step === 'region'
                                    ? onRegionChange
                                    : onCityChange;
                              setter('');
                            }
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
