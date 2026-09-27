import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import './styles/globals.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
