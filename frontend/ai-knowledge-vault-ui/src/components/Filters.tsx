import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import type { Category, SearchFilters, Tag } from '../types';

export default function Filters({
  filters,
  categories,
  tags,
  onChange
}: {
  filters: SearchFilters;
  categories: Category[];
  tags: Tag[];
  onChange: (filters: SearchFilters) => void;
}) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={5}>
        <TextField fullWidth label="Search" value={filters.keyword ?? ''} onChange={(e) => onChange({ ...filters, keyword: e.target.value })} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={filters.categoryId ?? ''} onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}>
            <MenuItem value="">All</MenuItem>
            {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4} md={2}>
        <FormControl fullWidth>
          <InputLabel>Tag</InputLabel>
          <Select label="Tag" value={filters.tagId ?? ''} onChange={(e) => onChange({ ...filters, tagId: e.target.value || undefined })}>
            <MenuItem value="">All</MenuItem>
            {tags.map((tag) => <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4} md={2}>
        <FormControl fullWidth>
          <InputLabel>Important</InputLabel>
          <Select
            label="Important"
            value={filters.isImportant === undefined ? '' : String(filters.isImportant)}
            onChange={(e) => onChange({ ...filters, isImportant: e.target.value === '' ? undefined : e.target.value === 'true' })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Important</MenuItem>
            <MenuItem value="false">Normal</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
