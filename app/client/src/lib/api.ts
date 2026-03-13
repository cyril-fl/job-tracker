const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Company {
  id: number;
  name: string;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  city: string | null;
  region: string | null;
  country: string | null;
}

export interface Recruiter {
  id: number;
  companyId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  linkedinUrl: string | null;
  createdAt: string;
}

export type ApplicationType = 'spontaneous' | 'job_posting' | 'recruitment' | 'other';

export interface Application {
  id: number;
  companyId: number;
  locationId: number | null;
  recruiterId: number | null;
  applicationType: ApplicationType | null;
  jobPostingUrl: string | null;
  appliedAt: string | null;
  status: 'draft' | 'pending' | 'in_progress' | 'rejected' | 'accepted';
  notes: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  company: Company;
  location: Location | null;
  recruiter: Recruiter | null;
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
  // Companies
  getCompanies: () => request<Company[]>('/companies'),
  createCompany: (data: { name: string; website?: string }) =>
    request<Company>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  updateCompany: (id: number, data: { name?: string; website?: string }) =>
    request<Company>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Locations
  getCountries: () => request<string[]>('/locations/countries'),
  getRegions: (country: string) =>
    request<string[]>(`/locations/regions?country=${encodeURIComponent(country)}`),
  getCities: (country: string, region?: string) => {
    let url = `/locations/cities?country=${encodeURIComponent(country)}`;
    if (region) url += `&region=${encodeURIComponent(region)}`;
    return request<string[]>(url);
  },

  // Recruiters
  getRecruiters: (companyId: number) => request<Recruiter[]>(`/recruiters?companyId=${companyId}`),
  createRecruiter: (data: {
    companyId: number;
    firstName: string;
    lastName: string;
    email?: string;
    linkedinUrl?: string;
  }) => request<Recruiter>('/recruiters', { method: 'POST', body: JSON.stringify(data) }),

  // Applications
  getApplications: () => request<Application[]>('/applications'),
  createApplication: (data: {
    companyId: number;
    applicationType?: ApplicationType;
    jobPostingUrl?: string;
    recruiterId?: number;
    appliedAt?: string;
    status?: string;
    notes?: string;
    rating?: number;
    address?: { city?: string; region?: string; country?: string };
  }) => request<Application>('/applications', { method: 'POST', body: JSON.stringify(data) }),

  updateApplication: (
    id: number,
    data: {
      companyId?: number;
      applicationType?: ApplicationType;
      jobPostingUrl?: string;
      recruiterId?: number;
      appliedAt?: string;
      status?: string;
      notes?: string;
      rating?: number;
      address?: { city?: string; region?: string; country?: string };
    },
  ) =>
    request<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteApplication: (id: number) => request<void>(`/applications/${id}`, { method: 'DELETE' }),
};
