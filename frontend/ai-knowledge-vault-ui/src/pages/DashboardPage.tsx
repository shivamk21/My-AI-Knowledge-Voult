import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { AddLink, NoteAdd, Search } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
      <Grid container spacing={2}>
        {[
          { title: 'Capture a note', action: 'Add note', to: '/notes/new', icon: <NoteAdd /> },
          { title: 'Save a link', action: 'Add link', to: '/links/new', icon: <AddLink /> },
          { title: 'Find knowledge', action: 'Search vault', to: '/search', icon: <Search /> }
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.to}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2}>
                {item.icon}
                <Typography variant="h6">{item.title}</Typography>
                <Button component={RouterLink} to={item.to} variant="contained">{item.action}</Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
