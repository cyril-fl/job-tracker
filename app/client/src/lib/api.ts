const API_URL = 'http://localhost:3001/api';

export interface Company {
  id: number;
  name: string;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  city: string | null;
  region: string | null;
  country: string | null;
}

export interface Application {
  id: number;
  companyId: number;
  addressId: number | null;
  url: string | null;
  appliedAt: string;
  status: 'pending' | 'in_progress' | 'rejected' | 'accepted';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  company: Company;
  address: Address | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getCompanies: () => request<Company[]>('/companies'),
  createCompany: (data: { name: string; website?: string }) =>
    request<Company>('/companies', { method: 'POST', body: JSON.stringify(data) }),

  getApplications: () => request<Application[]>('/applications'),
  createApplication: (data: {
    companyId: number;
    url?: string;
    appliedAt?: string;
    notes?: string;
    address?: { city?: string; region?: string; country?: string };
  }) => request<Application>('/applications', { method: 'POST', body: JSON.stringify(data) }),

  updateApplication: (
    id: number,
    data: {
      companyId?: number;
      url?: string;
      appliedAt?: string;
      status?: string;
      notes?: string;
      address?: { city?: string; region?: string; country?: string };
    },
  ) =>
    request<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteApplication: (id: number) => request<void>(`/applications/${id}`, { method: 'DELETE' }),
};
