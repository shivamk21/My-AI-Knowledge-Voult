import { Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Filters from '../components/Filters';
import LoadingState from '../components/LoadingState';
import { LinkCard, NoteCard } from '../components/VaultCards';
import { useSnackbar } from '../components/SnackbarContext';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { searchService } from '../services/searchService';
import type { SearchFilters, SearchResult } from '../types';

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [result, setResult] = useState<SearchResult>({ notes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const { categories, tags } = useTaxonomy();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    searchService.search(filters)
      .then(setResult)
      .catch((error) => showSnackbar((error as Error).message, 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>Search</Typography>
      <Filters filters={filters} categories={categories} tags={tags} onChange={setFilters} />
      {loading ? <LoadingState /> : (
        <Stack spacing={3}>
          <Typography variant="h6">Notes</Typography>
          <Grid container spacing={2}>
            {result.notes.map((note) => <Grid item xs={12} md={6} key={note.id}><NoteCard note={note} /></Grid>)}
          </Grid>
          <Typography variant="h6">Links</Typography>
          <Grid container spacing={2}>
            {result.links.map((link) => <Grid item xs={12} md={6} key={link.id}><LinkCard link={link} /></Grid>)}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
}
