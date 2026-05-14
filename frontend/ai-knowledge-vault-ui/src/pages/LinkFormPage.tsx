import { Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategorySelect, TagMultiSelect } from '../components/TaxonomyFields';
import { useSnackbar } from '../components/SnackbarContext';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { linkService } from '../services/linkService';
import type { LinkInput } from '../types';

const emptyLink: LinkInput = { url: '', title: '', description: '', categoryId: undefined, tagIds: [], isImportant: false };

export default function LinkFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { categories, tags } = useTaxonomy();
  const [input, setInput] = useState<LinkInput>(emptyLink);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (!id) return;
    linkService.getById(id).then((link) => setInput({
      url: link.url,
      title: link.title,
      description: link.description ?? '',
      categoryId: link.categoryId,
      tagIds: link.tags.map((tag) => tag.id),
      isImportant: link.isImportant
    })).catch((error) => showSnackbar((error as Error).message, 'error'));
  }, [id]);

  async function submit() {
    try {
      if (id) await linkService.update(id, input);
      else await linkService.create(input);
      showSnackbar(isEdit ? 'Link updated' : 'Link created', 'success');
      navigate('/links');
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>{isEdit ? 'Edit Link' : 'Add Link'}</Typography>
        <TextField label="URL" value={input.url} onChange={(e) => setInput({ ...input, url: e.target.value })} required />
        <TextField label="Title" value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} required />
        <TextField label="Description" value={input.description ?? ''} onChange={(e) => setInput({ ...input, description: e.target.value })} minRows={4} multiline />
        <CategorySelect categories={categories} value={input.categoryId} onChange={(categoryId) => setInput({ ...input, categoryId })} />
        <TagMultiSelect tags={tags} value={input.tagIds} onChange={(tagIds) => setInput({ ...input, tagIds })} />
        <FormControlLabel control={<Checkbox checked={input.isImportant} onChange={(e) => setInput({ ...input, isImportant: e.target.checked })} />} label="Important" />
        <Button onClick={submit} startIcon={<Save />} variant="contained" sx={{ alignSelf: 'flex-start' }}>Save</Button>
      </Stack>
    </Paper>
  );
}
