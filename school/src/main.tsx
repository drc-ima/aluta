import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

import {
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from
  "@tanstack/react-query-devtools";
import { ThemeProvider } from '@contexts/themeProvider.tsx'
import { AuthProvider } from './contexts/authProvider.tsx'
import "./assets/main.css"
import { queryClient } from "./libs/queryClient";
import { Toaster } from './components/ui/sonner';


createRoot(document.getElementById('root')!).render(
  <Suspense>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </Suspense>,
)
