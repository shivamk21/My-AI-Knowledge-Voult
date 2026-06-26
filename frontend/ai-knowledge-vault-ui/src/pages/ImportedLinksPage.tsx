import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
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
import { DeleteSweep, FileUpload, Save, Search } from '@mui/icons-material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSnackbar } from '../components/SnackbarContext';
import { linkService } from '../services/linkService';
import { isSupportedImportFile, parseImportedLinks } from '../utils/bookmarkImport';
import type { ImportedLink, SavedLink } from '../types';

type DuplicateReason = 'existing' | 'file';

export default function ImportedLinksPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [links, setLinks] = useState<ImportedLink[]>([]);
  const [existingLinks, setExistingLinks] = useState<SavedLink[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    loadExistingLinks();
  }, []);

  async function loadExistingLinks() {
    setLoadingExisting(true);
    try {
      setExistingLinks(await linkService.getAll());
    } catch (loadError) {
      showSnackbar(`Could not load saved links for duplicate checks: ${(loadError as Error).message}`, 'warning');
    } finally {
      setLoadingExisting(false);
    }
  }

  const duplicateReasons = useMemo(() => {
    const reasons = new Map<string, Set<DuplicateReason>>();
    const existingUrls = new Set(existingLinks.map((link) => canonicalUrl(link.url)));
    const fileCounts = new Map<string, number>();

    links.forEach((link) => {
      const key = canonicalUrl(link.url);
      fileCounts.set(key, (fileCounts.get(key) ?? 0) + 1);
    });

    links.forEach((link) => {
      const key = canonicalUrl(link.url);
      const linkReasons = new Set<DuplicateReason>();

      if (existingUrls.has(key)) {
        linkReasons.add('existing');
      }

      if ((fileCounts.get(key) ?? 0) > 1) {
        linkReasons.add('file');
      }

      if (linkReasons.size) {
        reasons.set(link.id, linkReasons);
      }
    });

    return reasons;
  }, [existingLinks, links]);

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return links;
    }

    return links.filter((link) =>
      [link.title, link.url, link.description, link.category ?? '', link.sourceType]
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [links, query]);

  const selectableLinks = useMemo(
    () => links.filter((link) => !savedIds.has(link.id)),
    [links, savedIds]
  );
  const filteredSelectableLinks = useMemo(
    () => filteredLinks.filter((link) => !savedIds.has(link.id)),
    [filteredLinks, savedIds]
  );
  const selectedLinks = useMemo(
    () => links.filter((link) => selectedIds.has(link.id) && !savedIds.has(link.id)),
    [links, savedIds, selectedIds]
  );
  const allFilteredSelected = filteredSelectableLinks.length > 0 && filteredSelectableLinks.every((link) => selectedIds.has(link.id));
  const someFilteredSelected = filteredSelectableLinks.some((link) => selectedIds.has(link.id)) && !allFilteredSelected;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setLinks([]);
    setSelectedIds(new Set());
    setSavedIds(new Set());
    setFailedIds(new Set());
    setFileName(file.name);

    if (!isSupportedImportFile(file)) {
      setError('Unsupported file type. Please upload a .html, .htm, or .txt file.');
      return;
    }

    try {
      const parsedLinks = parseImportedLinks(file.name, await file.text());

      if (!parsedLinks.length) {
        setError('No valid URLs were found in this file.');
        return;
      }

      setLinks(parsedLinks);
      setSelectedIds(new Set(parsedLinks.map((link) => link.id)));
    } catch (parseError) {
      setError((parseError as Error).message || 'Unable to read this file. Please try another export.');
    }
  }

  function clearImport() {
    setLinks([]);
    setFileName('');
    setQuery('');
    setError('');
    setSelectedIds(new Set());
    setSavedIds(new Set());
    setFailedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleFilteredSelected() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredSelectableLinks.forEach((link) => next.delete(link.id));
      } else {
        filteredSelectableLinks.forEach((link) => next.add(link.id));
      }
      return next;
    });
  }

  function discardSelected() {
    setLinks((current) => current.filter((link) => !selectedIds.has(link.id)));
    setSelectedIds(new Set());
    setSavedIds(new Set());
    setFailedIds(new Set());
  }

  function deselectDuplicates() {
    setSelectedIds((current) => {
      const next = new Set(current);
      duplicateReasons.forEach((_reasons, id) => next.delete(id));
      return next;
    });
  }

  async function saveSelected() {
    if (!selectedLinks.length) {
      showSnackbar('Select at least one imported link to save.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const result = await linkService.bulkImport(selectedLinks.map((link) => ({
        url: truncate(link.url, 1000),
        title: truncate(link.title, 200),
        description: truncate(link.description, 2000),
        sourceType: link.sourceType,
        sourceCategory: link.category || null,
        allowDuplicate: duplicateReasons.has(link.id)
      })));
      const createdUrls = new Set(result.createdLinks.map((link) => canonicalUrl(link.url)));
      const issueUrls = new Set(result.issues.map((issue) => canonicalUrl(issue.url)));
      const nextSavedIds = new Set(savedIds);
      const nextFailedIds = new Set<string>();

      selectedLinks.forEach((link) => {
        const key = canonicalUrl(link.url);
        if (createdUrls.has(key)) {
          nextSavedIds.add(link.id);
        } else if (issueUrls.has(key)) {
          nextFailedIds.add(link.id);
        }
      });

      setSavedIds(nextSavedIds);
      setFailedIds(nextFailedIds);
      setSelectedIds((current) => {
        const next = new Set(current);
        nextSavedIds.forEach((id) => next.delete(id));
        return next;
      });
      await loadExistingLinks();
      showSnackbar(`${result.createdCount} saved, ${result.duplicateCount} duplicate skipped, ${result.failedCount} failed.`, result.failedCount ? 'warning' : 'success');
    } catch (saveError) {
      showSnackbar((saveError as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Imported Links</Typography>
          <Typography color="text.secondary">Upload bookmark exports or text files and review extracted URLs.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<FileUpload />} variant="contained" onClick={() => inputRef.current?.click()}>
            Upload File
          </Button>
          {(links.length > 0 || fileName || error) && <Button variant="outlined" onClick={clearImport}>Clear</Button>}
        </Stack>
        <input ref={inputRef} type="file" accept=".html,.htm,.txt,text/html,text/plain" hidden onChange={handleFileChange} />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, URL, description, or category"
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
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap flexShrink={0}>
            <Chip label={`${filteredLinks.length} shown`} color="primary" variant="outlined" />
            {links.length > 0 && <Chip label={`${links.length} imported`} />}
            {selectedLinks.length > 0 && <Chip label={`${selectedLinks.length} selected`} color="secondary" variant="outlined" />}
            {loadingExisting && <Chip label="Checking duplicates" />}
          </Stack>
        </Stack>
        {fileName && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Source file: {fileName}
          </Typography>
        )}
      </Paper>

      {links.length > 0 && (
        <Paper sx={{ p: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1}>
            <Typography color="text.secondary">
              Duplicate rows are flagged. Keep them selected to save anyway, or uncheck/discard them.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Save />} variant="contained" disabled={!selectedLinks.length || saving} onClick={saveSelected}>
                {saving ? 'Saving...' : 'Save Selected'}
              </Button>
              <Button variant="outlined" disabled={!duplicateReasons.size || saving} onClick={deselectDuplicates}>
                Deselect Duplicates
              </Button>
              <Button startIcon={<DeleteSweep />} variant="outlined" disabled={!selectedIds.size || saving} onClick={discardSelected}>
                Discard Selected
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: 640 }}>
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 48 }}>
                <Checkbox
                  size="small"
                  checked={allFilteredSelected}
                  indeterminate={someFilteredSelected}
                  disabled={!filteredSelectableLinks.length || saving}
                  onChange={toggleFilteredSelected}
                />
              </TableCell>
              <TableCell sx={{ width: '17%', fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ width: '24%', fontWeight: 700 }}>URL</TableCell>
              <TableCell sx={{ width: '27%', fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ width: '10%', fontWeight: 700 }}>Source</TableCell>
              <TableCell sx={{ width: '11%', fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ width: '11%', fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLinks.map((link) => (
              <TableRow
                key={link.id}
                hover
                sx={duplicateReasons.has(link.id) ? { bgcolor: 'rgba(242, 204, 96, 0.08)' } : undefined}
              >
                <TableCell padding="checkbox" sx={{ verticalAlign: 'top' }}>
                  <Checkbox
                    size="small"
                    checked={selectedIds.has(link.id)}
                    disabled={savedIds.has(link.id) || saving}
                    onChange={() => toggleSelected(link.id)}
                  />
                </TableCell>
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
                  <Chip size="small" label={link.sourceType} color="primary" variant="outlined" />
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', py: 1, wordBreak: 'break-word' }}>
                  {link.category || 'Uncategorized'}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {savedIds.has(link.id) && <Chip size="small" label="Saved" color="success" />}
                    {failedIds.has(link.id) && <Chip size="small" label="Failed" color="error" />}
                    {duplicateReasons.get(link.id)?.has('existing') && <Chip size="small" label="Duplicate saved" color="warning" variant="outlined" />}
                    {duplicateReasons.get(link.id)?.has('file') && <Chip size="small" label="Duplicate file" color="warning" variant="outlined" />}
                    {!savedIds.has(link.id) && !failedIds.has(link.id) && !duplicateReasons.has(link.id) && <Chip size="small" label="New" />}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!filteredLinks.length && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    {links.length ? 'No imported links match your search.' : 'Upload a supported file to display imported links.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function canonicalUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.href.replace(/\/$/, '');
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, '');
  }
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
