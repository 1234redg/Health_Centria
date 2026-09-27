import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { fetchHealth, type HealthResponse } from '../lib/api';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Request failed'));
  }, []);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1>HealthCentria</h1>
      <p>React + Vite + TanStack Router + Express + MongoDB Atlas</p>
      <h2>API status</h2>
      {error && <p role="alert">API error: {error}</p>}
      {!health && !error && <p>Checking API…</p>}
      {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
    </section>
  );
}
