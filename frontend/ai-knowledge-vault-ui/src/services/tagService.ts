import { api } from './apiClient';
import type { Tag } from '../types';

export const tagService = {
  getAll: () => api<Tag[]>('/api/tags'),
  create: (input: { name: string }) => api<Tag>('/api/tags', { method: 'POST', body: JSON.stringify(input) })
};
