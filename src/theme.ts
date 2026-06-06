import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1565C0', // azul intenso
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#FFD600', // dorado Copa del Mundo
      light: '#FFFF52',
      dark: '#C7A500',
    },
    background: {
      default: '#0A0E1A',
      paper: '#141929',
    },
    success: {
      main: '#2E7D32',
    },
    error: {
      main: '#C62828',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#141929',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
});
