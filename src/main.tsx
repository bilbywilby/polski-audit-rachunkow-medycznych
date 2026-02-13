import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { GlossaryPage } from '@/pages/GlossaryPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { AuditStudioPage } from '@/pages/AuditStudioPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LettersPage } from '@/pages/LettersPage';
import { AuditDetailsPage } from '@/pages/AuditDetailsPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "audit", element: <AuditStudioPage /> },
      { path: "audit/:id", element: <AuditDetailsPage /> },
      { path: "glossary", element: <GlossaryPage /> },
      { path: "resources", element: <ResourcesPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "letters", element: <LettersPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)