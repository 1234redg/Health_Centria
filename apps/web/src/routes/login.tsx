import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getSession, isValidEmail, login } from '../lib/auth';
import { cn } from '../lib/utils';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20';

function LoginComponent() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState(() => getSession()?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const emailInvalid = touched.email && !isValidEmail(email);
  const passwordInvalid = touched.password && password.length === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError(null);
    if (!isValidEmail(email) || password.length === 0) return;
    setPending(true);
    try {
      const session = await login({ email, password });
      await navigate({
        to: session.role === 'admin' ? '/admin/dashboard' : session.role === 'staff' ? '/staff/dashboard' : '/app/dashboard',
      });
    } catch {
      // Generic message on purpose — do not reveal whether the email exists.
      setError('Invalid email or password.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f0fdfa_0%,#eff6ff_55%,#f0fdf4_100%)]"
      />
      <motion.section
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        aria-labelledby="login-heading"
        className="w-full max-w-[420px] rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.08)] sm:p-8"
      >
        <p className="text-sm font-medium text-teal-700">E-Kalinga</p>
        <h1 id="login-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Log in
        </h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Staff and patients use their email and password.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-800">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={emailInvalid}
              aria-describedby={emailInvalid ? 'login-email-error' : undefined}
              className={inputClass}
            />
            {emailInvalid && (
              <p id="login-email-error" role="alert" className="mt-1.5 text-sm text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-800">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
                  setCapsOn(e.getModifierState ? e.getModifierState('CapsLock') : false);
                }}
                aria-invalid={passwordInvalid}
                aria-describedby={passwordInvalid ? 'login-password-error' : undefined}
                className={cn(inputClass, 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-500 transition-colors hover:text-slate-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {capsOn && password.length > 0 && (
              <p className="mt-1.5 text-sm text-amber-700">Caps Lock is on.</p>
            )}
            {passwordInvalid && (
              <p id="login-password-error" role="alert" className="mt-1.5 text-sm text-destructive">
                Enter your password.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full bg-gradient-to-r from-teal-600 to-blue-600 text-base active:scale-[0.97]"
          >
            {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden />}
            {pending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <div className="mt-5 space-y-2 text-center text-sm">
          <p className="text-slate-600">
            New patient?{' '}
            <Link to="/register" className="font-medium text-teal-700 underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            <button
              type="button"
              disabled
              title="Ask the front desk for a password reset — self-service reset is not in v1"
              className="cursor-not-allowed text-slate-400"
            >
              Forgot password? (ask front desk — v1)
            </button>
          </p>
          <p>
            <Link to="/" className="text-slate-500 underline-offset-4 hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </motion.section>
    </div>
  );
}
