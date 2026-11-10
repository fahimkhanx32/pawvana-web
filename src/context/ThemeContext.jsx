import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';

const font = '"Outfit Variable", system-ui, sans-serif';
const v = (name, a) => (a === undefined ? `rgb(var(--${name}))` : `rgb(var(--${name}) / ${a})`);

/**
 * MUI is used for the floating-label inputs. All colours come from the same CSS variables
 * as the rest of the UI, so light/dark switching is instant and perfectly in sync.
 */
function buildMuiTheme(mode) {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#3FD0B6' : '#0E7C6B' },
      error: { main: dark ? '#F87171' : '#C83737' },
    },
    typography: { fontFamily: font },
    shape: { borderRadius: 16 },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 22,
            minHeight: 60,
            paddingLeft: 18,
            paddingRight: 14,
            fontSize: 17,
            backgroundColor: v('surface', 0.55),
            transition: 'background-color .2s',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: v('line'), paddingLeft: 20, transition: 'border-color .2s' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: v('muted', 0.55) },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: v('brand'), borderWidth: 1.5 },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: v('danger') },
            '&.Mui-disabled': { backgroundColor: v('surface-2', 0.6) },
            '&.MuiInputBase-multiline': { padding: '16px 14px 16px 18px', alignItems: 'flex-start' },
          },
          input: {
            padding: '17px 14px 17px 0',
            height: 'auto',
            color: v('ink'),
            fontFamily: font,
            '&::placeholder': { color: v('muted'), opacity: 0.7 },
            '&.Mui-disabled': { WebkitTextFillColor: v('muted') },
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${dark ? '#0D2426' : '#FFFFFF'} inset`,
              WebkitTextFillColor: dark ? '#EAF4F1' : '#10231F',
              caretColor: dark ? '#EAF4F1' : '#10231F',
              borderRadius: 20,
            },
          },
          inputMultiline: { padding: '4px 0' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: font,
            fontSize: 16,
            color: v('muted'),
            '&.Mui-focused': { color: v('brand') },
            '&.Mui-error': { color: v('danger') },
            // always floated, like the reference design; offset clears the 22px corner radius
            '&.MuiInputLabel-shrink': { transform: 'translate(26px, -9px) scale(0.75)' },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { fontFamily: font, margin: '6px 18px 0', fontSize: 13, color: v('muted'), '&.Mui-error': { color: v('danger') } } },
      },
      MuiSelect: { styleOverrides: { icon: { right: 14, color: v('muted') } } },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: v('surface'),
            backgroundImage: 'none',
            color: v('ink'),
            border: `1px solid ${v('line')}`,
            borderRadius: 18,
            boxShadow: '0 24px 48px -16px rgba(0,0,0,.35)',
            marginTop: 6,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: font,
            fontSize: 15,
            borderRadius: 10,
            margin: '2px 6px',
            minHeight: 42,
            '&:hover': { backgroundColor: v('surface-2') },
            '&.Mui-selected': { backgroundColor: v('brand-soft'), color: v('brand'), fontWeight: 500 },
            '&.Mui-selected:hover': { backgroundColor: v('brand-soft') },
          },
        },
      },
    },
  });
}

const ThemeCtx = createContext(null);
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('pawvana:theme', mode); } catch { /* storage blocked */ }
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', mode === 'dark' ? '#07191A' : '#F4F6F3');
  }, [mode]);

  const toggle = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), []);
  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggle, isDark: mode === 'dark' }), [mode, toggle]);

  return (
    <ThemeCtx.Provider value={value}>
      {/* injectFirst: Tailwind utilities can always override MUI's generated CSS */}
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeCtx.Provider>
  );
}
