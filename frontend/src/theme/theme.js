import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f6f61',
      dark: '#154c43',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#374151'
    },
    background: {
      default: '#f5f7f4',
      paper: '#ffffff'
    },
    text: {
      primary: '#17211f',
      secondary: '#61716d'
    },
    success: {
      main: '#1f7a4d'
    },
    warning: {
      main: '#b7791f'
    }
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 760,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '1.45rem',
      fontWeight: 720,
      lineHeight: 1.25
    },
    h3: {
      fontSize: '1.15rem',
      fontWeight: 700
    },
    button: {
      textTransform: 'none',
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 42,
          boxShadow: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true
      }
    }
  }
});

export default theme;
