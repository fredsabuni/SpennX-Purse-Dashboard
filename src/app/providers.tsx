'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#317CFF',
    },
    background: {
      default: '#0A0A0A',
      paper: '#0A0A0A',
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    // Customize MUI components
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1F1F1F',
        },
      },
    },
    // @ts-ignore
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: '#E5E7EB',
          '&:hover': {
            backgroundColor: 'rgba(49, 124, 255, 0.15)',
          },
          '&.Mui-selected': {
            backgroundColor: '#317CFF',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2563EB',
            },
          },
        },
        today: {
          borderColor: '#317CFF',
        },
      },
    },
    // @ts-ignore
    MuiPickersCalendarHeader: {
        styleOverrides: {
            root: {
                color: '#ffffff',
            },
            switchViewButton: {
                color: '#ffffff',
            }
        }
    },
    // @ts-ignore
    MuiDayCalendar: {
        styleOverrides: {
            weekDayLabel: {
                color: '#9CA3AF',
            }
        }
    }
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {children}
        </LocalizationProvider>
      </ThemeProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
