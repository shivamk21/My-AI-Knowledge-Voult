import { api, queryString } from './apiClient';
import type { SearchFilters, SearchResult } from '../types';

export const searchService = {
  search: (filters: SearchFilters) => api<SearchResult>(`/api/search${queryString(filters)}`)
};
