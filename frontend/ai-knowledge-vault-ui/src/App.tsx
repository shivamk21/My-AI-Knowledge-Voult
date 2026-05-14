import { Alert, AppBar, Box, Button, Container, Snackbar, Toolbar, Typography } from '@mui/material';
import { AddLink, Category, Dashboard, NoteAdd, Search, StickyNote2 } from '@mui/icons-material';
import { Link as RouterLink, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import NoteFormPage from './pages/NoteFormPage';
import LinksPage from './pages/LinksPage';
import LinkFormPage from './pages/LinkFormPage';
import TaxonomyPage from './pages/TaxonomyPage';
import SearchPage from './pages/SearchPage';
import { SnackbarProvider, useSnackbar } from './components/SnackbarContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <Dashboard fontSize="small" /> },
  { to: '/notes', label: 'Notes', icon: <StickyNote2 fontSize="small" /> },
  { to: '/notes/new', label: 'Add Note', icon: <NoteAdd fontSize="small" /> },
  { to: '/links', label: 'Links', icon: <AddLink fontSize="small" /> },
  { to: '/taxonomy', label: 'Categories & Tags', icon: <Category fontSize="small" /> },
  { to: '/search', label: 'Search', icon: <Search fontSize="small" /> }
];

function Shell() {
  const location = useLocation();
  const { snackbar, closeSnackbar } = useSnackbar();

  return (
    <Box>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mr: 2, fontWeight: 700 }}>
            AI Knowledge Vault
          </Typography>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              startIcon={item.icon}
              color={location.pathname === item.to ? 'primary' : 'inherit'}
              size="small"
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/new" element={<NoteFormPage />} />
          <Route path="/notes/:id/edit" element={<NoteFormPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/links/new" element={<LinkFormPage />} />
          <Route path="/links/:id/edit" element={<LinkFormPage />} />
          <Route path="/taxonomy" element={<TaxonomyPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function App() {
  return (
    <SnackbarProvider>
      <Shell />
    </SnackbarProvider>
  );
}
