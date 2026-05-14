import { Button, Grid, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Filters from '../components/Filters';
import LoadingState from '../components/LoadingState';
import { LinkCard } from '../components/VaultCards';
import { useSnackbar } from '../components/SnackbarContext';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { linkService } from '../services/linkService';
import type { SavedLink, SearchFilters } from '../types';

export default function LinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [loading, setLoading] = useState(true);
  const { categories, tags } = useTaxonomy();
  const { showSnackbar } = useSnackbar();

  async function load() {
    setLoading(true);
    try {
      setLinks(Object.keys(filters).length ? await linkService.search(filters) : await linkService.getAll());
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  async function remove(id: string) {
    await linkService.delete(id);
    showSnackbar('Link deleted', 'success');
    load();
  }

  async function toggle(link: SavedLink) {
    await linkService.update(link.id, { url: link.url, title: link.title, description: link.description, categoryId: link.categoryId, tagIds: link.tags.map((t) => t.id), isImportant: !link.isImportant });
    load();
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700}>Saved Links</Typography>
        <Button component={RouterLink} to="/links/new" startIcon={<Add />} variant="contained">Add Link</Button>
      </Stack>
      <Filters filters={filters} categories={categories} tags={tags} onChange={setFilters} />
      {loading ? <LoadingState /> : (
        <Grid container spacing={2}>
          {links.map((link) => <Grid item xs={12} md={6} key={link.id}><LinkCard link={link} onDelete={() => remove(link.id)} onToggleImportant={() => toggle(link)} /></Grid>)}
        </Grid>
      )}
    </Stack>
  );
}
