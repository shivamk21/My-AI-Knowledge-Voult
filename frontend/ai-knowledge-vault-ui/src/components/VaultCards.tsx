import { Box, Card, CardActions, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Delete, Edit, OpenInNew, Star, StarBorder } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { Note, SavedLink } from '../types';

export function NoteCard({ note, onDelete, onToggleImportant }: { note: Note; onDelete?: () => void; onToggleImportant?: () => void }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1}>
          <Typography variant="h6">{note.title}</Typography>
          <Tooltip title="Toggle important">
            <IconButton size="small" onClick={onToggleImportant}>{note.isImportant ? <Star color="secondary" /> : <StarBorder />}</IconButton>
          </Tooltip>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{note.content}</Typography>
        <MetaChips categoryName={note.categoryName} tags={note.tags.map((t) => t.name)} />
      </CardContent>
      <CardActions>
        <Tooltip title="Edit note"><IconButton component={RouterLink} to={`/notes/${note.id}/edit`}><Edit /></IconButton></Tooltip>
        {onDelete && <Tooltip title="Delete note"><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>}
      </CardActions>
    </Card>
  );
}

export function LinkCard({ link, onDelete, onToggleImportant }: { link: SavedLink; onDelete?: () => void; onToggleImportant?: () => void }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1}>
          <Typography variant="h6">{link.title}</Typography>
          <Tooltip title="Toggle important">
            <IconButton size="small" onClick={onToggleImportant}>{link.isImportant ? <Star color="secondary" /> : <StarBorder />}</IconButton>
          </Tooltip>
        </Stack>
        <Typography color="primary" sx={{ wordBreak: 'break-word' }}>{link.url}</Typography>
        {link.description && <Typography color="text.secondary" sx={{ mt: 1 }}>{link.description}</Typography>}
        <MetaChips categoryName={link.categoryName} tags={link.tags.map((t) => t.name)} />
      </CardContent>
      <CardActions>
        <Tooltip title="Open link"><IconButton component="a" href={link.url} target="_blank" rel="noreferrer"><OpenInNew /></IconButton></Tooltip>
        <Tooltip title="Edit link"><IconButton component={RouterLink} to={`/links/${link.id}/edit`}><Edit /></IconButton></Tooltip>
        {onDelete && <Tooltip title="Delete link"><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>}
      </CardActions>
    </Card>
  );
}

function MetaChips({ categoryName, tags }: { categoryName?: string | null; tags: string[] }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2 }}>
      {categoryName && <Chip size="small" label={categoryName} color="primary" variant="outlined" />}
      {tags.map((tag) => <Chip key={tag} size="small" label={tag} />)}
    </Box>
  );
}
