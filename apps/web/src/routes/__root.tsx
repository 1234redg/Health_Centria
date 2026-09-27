import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="app">
      <header className="nav">
        <Link to="/" className="brand">
          HealthCentria
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
