import { Button, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import { useSnackbar } from '../components/SnackbarContext';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';

export default function TaxonomyPage() {
  const { categories, tags, reload } = useTaxonomy();
  const { showSnackbar } = useSnackbar();
  const [categoryName, setCategoryName] = useState('');
  const [colorCode, setColorCode] = useState('#58a6ff');
  const [tagName, setTagName] = useState('');

  async function addCategory() {
    try {
      await categoryService.create({ name: categoryName, colorCode });
      setCategoryName('');
      await reload();
      showSnackbar('Category created', 'success');
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    }
  }

  async function addTag() {
    try {
      await tagService.create({ name: tagName });
      setTagName('');
      await reload();
      showSnackbar('Tag created', 'success');
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>Categories & Tags</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Categories</Typography>
              <TextField label="Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
              <TextField label="Color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} />
              <Button startIcon={<Add />} variant="contained" onClick={addCategory}>Create Category</Button>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {categories.map((category) => <Chip key={category.id} label={category.name} sx={{ borderColor: category.colorCode ?? undefined }} variant="outlined" />)}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Tags</Typography>
              <TextField label="Name" value={tagName} onChange={(e) => setTagName(e.target.value)} />
              <Button startIcon={<Add />} variant="contained" onClick={addTag}>Create Tag</Button>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {tags.map((tag) => <Chip key={tag.id} label={tag.name} />)}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
