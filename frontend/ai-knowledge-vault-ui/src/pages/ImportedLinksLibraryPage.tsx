import {
  Chip,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Delete, Search } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import LoadingState from '../components/LoadingState';
import { useSnackbar } from '../components/SnackbarContext';
import { linkService } from '../services/linkService';
import type { SavedLink } from '../types';

export default function ImportedLinksLibraryPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      load();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  async function load() {
    setLoading(true);
    try {
      setLinks(await linkService.getImported(query.trim() || undefined));
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    await linkService.delete(id);
    showSnackbar('Imported link deleted', 'success');
    load();
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
        <Typography variant="h4" fontWeight={700}>Imported Links Library</Typography>
        <Chip label={`${links.length} links`} color="primary" variant="outlined" />
      </Stack>

      <Paper sx={{ p: 2 }}>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search imported title, URL, description, source, or category"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {loading ? <LoadingState /> : (
        <TableContainer component={Paper} sx={{ maxHeight: 680 }}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '18%', fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ width: '27%', fontWeight: 700 }}>URL</TableCell>
                <TableCell sx={{ width: '31%', fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ width: '11%', fontWeight: 700 }}>Source</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ width: 56, fontWeight: 700 }}>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id} hover>
                  <TableCell sx={{ verticalAlign: 'top', py: 1, wordBreak: 'break-word' }}>
                    <Link href={link.url} target="_blank" rel="noreferrer" underline="hover" color="primary" fontWeight={600}>
                      {link.title}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                    <Link href={link.url} target="_blank" rel="noreferrer" underline="always" color="primary" sx={{ wordBreak: 'break-all' }}>
                      {link.url}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top', py: 1, color: 'text.secondary', wordBreak: 'break-word' }}>
                    {link.description}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                    <Chip size="small" label={link.sourceType || 'Imported'} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top', py: 1, wordBreak: 'break-word' }}>
                    {link.sourceCategory || 'Uncategorized'}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top', py: 0.5 }}>
                    <IconButton size="small" color="error" onClick={() => remove(link.id)} aria-label={`Delete ${link.title}`}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!links.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                      No imported links found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
