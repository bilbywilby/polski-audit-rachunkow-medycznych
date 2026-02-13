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
import { DashboardPage } from '@/pages/DashboardPage';
import { GlossaryPage } from '@/pages/GlossaryPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
// Placeholder pages for next phase
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-12 text-center text-muted-foreground">
    <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
    Coming soon in Phase 2.
  </div>
);
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "audit", element: <PlaceholderPage title="Audit Studio" /> },
      { path: "glossary", element: <GlossaryPage /> },
      { path: "resources", element: <ResourcesPage /> },
      { path: "history", element: <PlaceholderPage title="Audit History" /> },
      { path: "letters", element: <PlaceholderPage title="Letter Generator" /> },
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