import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '../../lib/auth';

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const session = getSession();
    if (!session) throw redirect({ to: '/login' });
    if (session.role !== 'admin') {
      throw redirect({ to: session.role === 'patient' ? '/app/dashboard' : '/staff/dashboard' });
    }
  },
});
