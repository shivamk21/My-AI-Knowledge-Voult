import { api } from './apiClient';
import type { Category } from '../types';

export const categoryService = {
  getAll: () => api<Category[]>('/api/categories'),
  create: (input: { name: string; colorCode?: string }) =>
    api<Category>('/api/categories', { method: 'POST', body: JSON.stringify(input) })
};
