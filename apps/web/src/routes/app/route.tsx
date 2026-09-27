import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '../../lib/auth';

export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    const session = getSession();
    if (!session) throw redirect({ to: '/login' });
    if (session.role !== 'patient') {
      throw redirect({ to: session.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard' });
    }
  },
});
