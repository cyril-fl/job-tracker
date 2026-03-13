import { ApplicationForm } from '@/components/application-form';
import { ApplicationsTable } from '@/components/applications-table';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api';
import type { Application } from '@/lib/api';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const queryClient = new QueryClient();

function Dashboard() {
  const [editing, setEditing] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: api.getApplications,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Tracker</h1>
        <ThemeToggle />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="shrink-0 min-w-75 w-full lg:w-100">
          <ApplicationForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        </div>
        <div className="flex-1 min-w-0 grow">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <ApplicationsTable applications={applications} onEdit={setEditing} />
          )}
        </div>
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
