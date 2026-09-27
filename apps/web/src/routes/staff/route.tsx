import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '../../lib/auth';

export const Route = createFileRoute('/staff')({
  beforeLoad: () => {
    const session = getSession();
    if (!session) throw redirect({ to: '/login' });
    // Admins keep access to staff views (spec §2.1); patients go home.
    if (session.role === 'patient') throw redirect({ to: '/app/dashboard' });
  },
});
