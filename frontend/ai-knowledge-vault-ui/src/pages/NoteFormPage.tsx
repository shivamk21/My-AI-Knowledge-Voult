import { Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategorySelect, TagMultiSelect } from '../components/TaxonomyFields';
import { useSnackbar } from '../components/SnackbarContext';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { noteService } from '../services/noteService';
import type { NoteInput } from '../types';

const emptyNote: NoteInput = { title: '', content: '', categoryId: undefined, tagIds: [], isImportant: false };

export default function NoteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { categories, tags } = useTaxonomy();
  const [input, setInput] = useState<NoteInput>(emptyNote);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (!id) return;
    noteService.getById(id).then((note) => setInput({
      title: note.title,
      content: note.content,
      categoryId: note.categoryId,
      tagIds: note.tags.map((tag) => tag.id),
      isImportant: note.isImportant
    })).catch((error) => showSnackbar((error as Error).message, 'error'));
  }, [id]);

  async function submit() {
    try {
      if (id) await noteService.update(id, input);
      else await noteService.create(input);
      showSnackbar(isEdit ? 'Note updated' : 'Note created', 'success');
      navigate('/notes');
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>{isEdit ? 'Edit Note' : 'Add Note'}</Typography>
        <TextField label="Title" value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} required />
        <TextField label="Content" value={input.content} onChange={(e) => setInput({ ...input, content: e.target.value })} minRows={8} multiline required />
        <CategorySelect categories={categories} value={input.categoryId} onChange={(categoryId) => setInput({ ...input, categoryId })} />
        <TagMultiSelect tags={tags} value={input.tagIds} onChange={(tagIds) => setInput({ ...input, tagIds })} />
        <FormControlLabel control={<Checkbox checked={input.isImportant} onChange={(e) => setInput({ ...input, isImportant: e.target.checked })} />} label="Important" />
        <Button onClick={submit} startIcon={<Save />} variant="contained" sx={{ alignSelf: 'flex-start' }}>Save</Button>
      </Stack>
    </Paper>
  );
}
