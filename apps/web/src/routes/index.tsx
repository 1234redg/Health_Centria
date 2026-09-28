import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BellRing, CalendarCheck, ClipboardList, MapPin, Megaphone } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

const services = [
  {
    icon: CalendarCheck,
    title: 'Book appointments',
    body: 'Request checkups, immunization, and other barangay health services online — no more lining up early.',
  },
  {
    icon: Megaphone,
    title: 'Health announcements',
    body: 'Schedule changes, vaccination days, and advisories from the center, readable without logging in.',
  },
  {
    icon: BellRing,
    title: 'Reminders & updates',
    body: 'Get notified when your appointment is confirmed, declined, or coming up tomorrow.',
  },
  {
    icon: ClipboardList,
    title: 'Your visit history',
    body: 'Patients can review upcoming and past appointments in one dashboard.',
  },
];

const steps = [
  {
    n: '1',
    title: 'Create a patient account',
    body: 'Register with your basic profile and contact details in a few minutes.',
  },
  {
    n: '2',
    title: 'Book a service & date',
    body: 'Pick a service offered by the Barangay 11 Health Center and your preferred day.',
  },
  {
    n: '3',
    title: 'Get confirmed & reminded',
    body: 'Staff confirms your booking. You get in-app and email reminders before your visit.',
  },
];

function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/images/E-Kalinga_Logo.png"
              alt="E-Kalinga logo"
              className="h-10 w-10 rounded-xl bg-slate-900 object-contain"
            />
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">E-Kalinga</span>
              <span className="block text-[11px] font-medium text-teal-700">Barangay 11 Health Center</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="ml-auto flex items-center gap-1 text-sm sm:gap-2">
            <Link
              to="/announcements"
              className="hidden rounded-xl px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 sm:block"
            >
              Announcements
            </Link>
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-2 font-medium text-white active:scale-[0.97]"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#f0fdfa_0%,#eff6ff_55%,#f0fdf4_100%)]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-white px-3 py-1 text-xs font-semibold text-teal-800">
                <MapPin size={14} aria-hidden />
                Barangay 11 • Malaybalay City
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Barangay health care,{' '}
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  now online
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                E-Kalinga is the appointment and announcement portal of the Barangay 11 Health
                Center. Book visits, receive confirmations and reminders, and stay updated on
                community health programs.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(15,60,90,0.18)] active:scale-[0.97]"
                >
                  Create patient account
                  <ArrowRight size={17} aria-hidden />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.97]"
                >
                  Log in
                </Link>
                <Link
                  to="/announcements"
                  className="text-sm font-medium text-teal-700 underline-offset-4 hover:underline"
                >
                  View public announcements →
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <img
                  src="/images/logo1.jpg"
                  alt="City of Malaybalay official seal"
                  className="h-12 w-12 rounded-full border border-slate-200 bg-white object-cover"
                />
                <img
                  src="/images/logo2.jpg"
                  alt="Barangay Eleven Malaybalay City seal"
                  className="h-12 w-12 rounded-full border border-slate-200 bg-white object-cover"
                />
                <p className="text-xs leading-5 text-slate-500">
                  In coordination with the City of Malaybalay
                  <br />
                  and Barangay Eleven, Malaybalay City.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.45, delay: 0.08 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,60,90,0.15)]">
                <img
                  src="/images/barangayhall.png"
                  alt="Barangay 11 hall building"
                  className="h-72 w-full object-cover sm:h-80"
                />
                <div className="flex items-center gap-3 p-4">
                  <img
                    src="/images/E-Kalinga_Logo.png"
                    alt=""
                    aria-hidden
                    className="h-10 w-10 rounded-xl bg-slate-900 object-contain"
                  />
                  <div className="text-sm">
                    <p className="font-semibold">Visit us or book online</p>
                    <p className="text-slate-500">Mon–Fri • 8:00 AM – 5:00 PM</p>
                  </div>
                  <Link
                    to="/register"
                    className="ml-auto inline-flex h-9 items-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white active:scale-[0.97]"
                  >
                    Book now
                  </Link>
                </div>
              </div>
              <div className="absolute -left-3 top-6 hidden rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:block">
                <p className="text-xs font-semibold text-teal-700">Appointment confirmed</p>
                <p className="text-xs text-slate-500">Reminder sent a day before</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section aria-labelledby="services-heading" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-sm font-semibold text-teal-700">What you can do</p>
          <h2 id="services-heading" className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            One portal for patients and staff
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                  <s.icon size={19} aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="border-y border-slate-200/60 bg-slate-50">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <h2 id="how-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="rounded-2xl border border-slate-200/70 bg-white p-5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 text-sm font-semibold text-white active:scale-[0.97]"
              >
                Get started <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        {/* Visit */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <img
            src="/images/barangayhall.png"
            alt="Barangay hall"
            className="h-64 w-full rounded-3xl border border-slate-200/70 object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Visit the health center</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Barangay 11 Health Center, Malaybalay City, Bukidnon. Bring a valid ID on your
              appointment day and arrive on time. For password resets or account help, ask the
              front desk — self-service reset is not available in v1.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/announcements"
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Check announcements
              </Link>
              <Link to="/login" className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white">
                Staff & patient login
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-6 sm:px-6">
          <img
            src="/images/E-Kalinga_Logo.png"
            alt="E-Kalinga logo"
            className="h-8 w-8 rounded-lg bg-slate-900 object-contain"
          />
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">E-Kalinga</span> • Barangay 11 Health
            Center, Malaybalay City
          </p>
          <nav aria-label="Footer" className="ml-auto flex items-center gap-3 text-sm">
            <Link to="/announcements" className="text-slate-500 hover:underline">
              Announcements
            </Link>
            <Link to="/login" className="text-slate-500 hover:underline">
              Log in
            </Link>
            <Link to="/register" className="text-slate-500 hover:underline">
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
