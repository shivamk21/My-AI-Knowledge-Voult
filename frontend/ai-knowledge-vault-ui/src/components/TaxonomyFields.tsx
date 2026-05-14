import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import type { Category, Tag } from '../types';

export function CategorySelect({ categories, value, onChange }: { categories: Category[]; value?: string | null; onChange: (value?: string) => void }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Category</InputLabel>
      <Select label="Category" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <MenuItem value="">None</MenuItem>
        {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

export function TagMultiSelect({ tags, value, onChange }: { tags: Tag[]; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Tags</InputLabel>
      <Select
        multiple
        label="Tags"
        value={value}
        renderValue={(selected) => tags.filter((tag) => selected.includes(tag.id)).map((tag) => tag.name).join(', ')}
        onChange={(e) => onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
      >
        {tags.map((tag) => (
          <MenuItem key={tag.id} value={tag.id}>
            <Checkbox checked={value.includes(tag.id)} />
            <ListItemText primary={tag.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
