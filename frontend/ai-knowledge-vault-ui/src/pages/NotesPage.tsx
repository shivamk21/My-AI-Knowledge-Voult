import { Button, Grid, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Filters from '../components/Filters';
import LoadingState from '../components/LoadingState';
import { NoteCard } from '../components/VaultCards';
import { useSnackbar } from '../components/SnackbarContext';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { noteService } from '../services/noteService';
import type { Note, SearchFilters } from '../types';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [loading, setLoading] = useState(true);
  const { categories, tags } = useTaxonomy();
  const { showSnackbar } = useSnackbar();

  async function load() {
    setLoading(true);
    try {
      setNotes(Object.keys(filters).length ? await noteService.search(filters) : await noteService.getAll());
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  async function remove(id: string) {
    await noteService.delete(id);
    showSnackbar('Note deleted', 'success');
    load();
  }

  async function toggle(note: Note) {
    await noteService.update(note.id, { title: note.title, content: note.content, categoryId: note.categoryId, tagIds: note.tags.map((t) => t.id), isImportant: !note.isImportant });
    load();
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700}>Notes</Typography>
        <Button component={RouterLink} to="/notes/new" startIcon={<Add />} variant="contained">Add Note</Button>
      </Stack>
      <Filters filters={filters} categories={categories} tags={tags} onChange={setFilters} />
      {loading ? <LoadingState /> : (
        <Grid container spacing={2}>
          {notes.map((note) => <Grid item xs={12} md={6} key={note.id}><NoteCard note={note} onDelete={() => remove(note.id)} onToggleImportant={() => toggle(note)} /></Grid>)}
        </Grid>
      )}
    </Stack>
  );
}
