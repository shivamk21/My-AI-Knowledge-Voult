import { api, queryString } from './apiClient';
import type { BulkLinkImportItem, BulkLinkImportResult, LinkInput, SavedLink, SearchFilters } from '../types';

export const linkService = {
  getAll: () => api<SavedLink[]>('/api/links'),
  getById: (id: string) => api<SavedLink>(`/api/links/${id}`),
  create: (input: LinkInput) => api<SavedLink>('/api/links', { method: 'POST', body: JSON.stringify(input) }),
  bulkImport: (links: BulkLinkImportItem[]) => api<BulkLinkImportResult>('/api/links/bulk-import', { method: 'POST', body: JSON.stringify({ links }) }),
  getImported: (keyword?: string) => api<SavedLink[]>(`/api/links/imported${queryString({ keyword })}`),
  update: (id: string, input: LinkInput) => api<SavedLink>(`/api/links/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) => api<void>(`/api/links/${id}`, { method: 'DELETE' }),
  search: (filters: SearchFilters) => api<SavedLink[]>(`/api/links/search${queryString(filters)}`)
};
