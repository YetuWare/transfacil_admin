import { createTheme } from '@mui/material/styles';

const colors = {
  primary: '#C8E600',
  primaryDark: '#B0CC00',
  primaryLight: '#E4F57A',
  secondary: '#FF8F00',
  background: '#F0F2F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FB',
  dark: '#111827',
  grey: '#6B7280',
  greyLight: '#9CA3AF',
  greyLighter: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const theme = createTheme({
  palette: {
    primary: { main: colors.primary, dark: colors.primaryDark, light: colors.primaryLight, contrastText: colors.dark },
    secondary: { main: colors.secondary, contrastText: '#fff' },
    background: { default: colors.background, paper: colors.surface },
    text: { primary: colors.dark, secondary: colors.grey },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    info: { main: colors.info },
    divider: colors.greyLighter,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700, fontSize: '1.25rem' },
    h6: { fontWeight: 700, fontSize: '1.1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, padding: '8px 20px' } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase',
            letterSpacing: '0.05em', color: colors.grey,
            backgroundColor: colors.surfaceVariant,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 10 },
        },
      },
    },
  },
});

export { colors };
export default theme;
