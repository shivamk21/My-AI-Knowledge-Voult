import { api, queryString } from './apiClient';
import type { LinkInput, SavedLink, SearchFilters } from '../types';

export const linkService = {
  getAll: () => api<SavedLink[]>('/api/links'),
  getById: (id: string) => api<SavedLink>(`/api/links/${id}`),
  create: (input: LinkInput) => api<SavedLink>('/api/links', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: LinkInput) => api<SavedLink>(`/api/links/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) => api<void>(`/api/links/${id}`, { method: 'DELETE' }),
  search: (filters: SearchFilters) => api<SavedLink[]>(`/api/links/search${queryString(filters)}`)
};
