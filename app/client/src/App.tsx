import { ApplicationForm } from '@/components/application-form';
import { ApplicationsTable } from '@/components/applications-table';
import { SearchFilters } from '@/components/search-filters';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import type { Application } from '@/lib/api';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { ClipboardList, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const queryClient = new QueryClient();

function Dashboard() {
  const [editing, setEditing] = useState<Application | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState<string | null>('list');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: api.getApplications,
  });

  const handleEdit = useCallback((app: Application) => {
    setEditing(app);
    setActiveTab('form');
  }, []);

  const handleDone = useCallback(() => {
    setEditing(null);
    setActiveTab('list');
  }, []);

  // Auto-switch to form tab when editing is set externally
  useEffect(() => {
    if (editing) setActiveTab('form');
  }, [editing]);

  const formElement = (
    <ApplicationForm key={editing?.id ?? 'new'} editing={editing} onDone={handleDone} />
  );

  const tableElement = isLoading ? (
    <p className="text-muted-foreground">Chargement...</p>
  ) : (
    <ApplicationsTable
      applications={applications}
      onEdit={handleEdit}
      globalFilter={globalFilter}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="z-10 shrink-0 border-b bg-background px-6 py-3">
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-bold">Job Tracker</h1>
          <div className="md:order-last">
            <ThemeToggle />
          </div>
          <div className="col-span-full md:col-span-1 md:justify-self-end">
            <SearchFilters
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Tabs layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col md:hidden"
      >
        <TabsList className="mx-4 mt-3 h-10 w-[calc(100%-2rem)] p-1">
          <TabsTrigger value="list" className="h-full text-sm">
            <ClipboardList className="h-4 w-4" />
            Candidatures
          </TabsTrigger>
          <TabsTrigger value="form" className="h-full text-sm">
            <Plus className="h-4 w-4" />
            {editing ? 'Modifier' : 'Ajouter'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="min-h-0 flex-1 overflow-y-auto p-4">
          {tableElement}
        </TabsContent>
        <TabsContent value="form" className="min-h-0 flex-1 overflow-y-auto p-4">
          {formElement}
        </TabsContent>
      </Tabs>

      {/* Desktop: Side-by-side layout */}
      <div className="hidden md:flex min-h-0 flex-1 flex-row gap-6 p-6">
        <div className="shrink-0 min-w-75 lg:w-100 overflow-y-auto">{formElement}</div>
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">{tableElement}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
