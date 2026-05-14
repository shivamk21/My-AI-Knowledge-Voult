import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#58a6ff' },
    secondary: { main: '#f2cc60' },
    background: { default: '#0d1117', paper: '#161b22' }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiCard: { styleOverrides: { root: { border: '1px solid #30363d' } } },
    MuiButtonBase: { defaultProps: { disableRipple: true } }
  }
});
