import { api, queryString } from './apiClient';
import type { Note, NoteInput, SearchFilters } from '../types';

export const noteService = {
  getAll: () => api<Note[]>('/api/notes'),
  getById: (id: string) => api<Note>(`/api/notes/${id}`),
  create: (input: NoteInput) => api<Note>('/api/notes', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: NoteInput) => api<Note>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) => api<void>(`/api/notes/${id}`, { method: 'DELETE' }),
  search: (filters: SearchFilters) => api<Note[]>(`/api/notes/search${queryString(filters)}`)
};
