import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import { getPatient, type PatientDetail, type PatientVisit } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/staff/patients/$patientId')({
  component: PatientDetailPage,
});

function serviceName(v: PatientVisit): string {
  return typeof v.service === 'object' ? v.service.name : 'Service';
}

function PatientDetailPage() {
  const session = getSession();
  const today = getTodayService();
  const { patientId } = Route.useParams();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [visits, setVisits] = useState<PatientVisit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setPatient(null);
    setVisits(null);
    getPatient(patientId)
      .then((r) => {
        if (!cancelled) {
          setPatient(r.patient);
          setVisits(r.visits);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load patient.');
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const completed = (visits ?? []).filter((v) => v.status === 'completed');

  return (
    <DashboardShell
      title="Patient record"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <Link
        to="/staff/patients"
        className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 active:scale-[0.97]"
      >
        ← Back to patients
      </Link>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {patient === null && !error && <p className="text-sm text-slate-500">Loading record…</p>}

      {patient && (
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
          <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
          <p className="mt-0.5 text-sm text-slate-600">{patient.email}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-700">Contact</dt><dd className="text-slate-800">{patient.contactNumber}</dd></div>
            <div><dt className="font-semibold text-slate-700">Address</dt><dd className="text-slate-800">{patient.address}</dd></div>
            <div><dt className="font-semibold text-slate-700">Household</dt><dd className="text-slate-800">{patient.householdNumber}</dd></div>
            <div><dt className="font-semibold text-slate-700">Birthdate</dt><dd className="text-slate-800">{String(patient.birthdate).slice(0, 10)} · {patient.sex}</dd></div>
            <div><dt className="font-semibold text-slate-700">PhilHealth</dt><dd className="text-slate-800">{patient.philHealthNumber || '—'}</dd></div>
            <div><dt className="font-semibold text-slate-700">Emergency</dt><dd className="text-slate-800">{patient.emergencyName} · {patient.emergencyNumber}</dd></div>
          </dl>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
        <h2 className="text-base font-bold text-slate-900">
          Visit records {visits !== null && `(${completed.length} completed of ${visits.length})`}
        </h2>
        {visits === null && !error && <p className="mt-2 text-sm text-slate-500">Loading visits…</p>}
        {visits !== null && visits.length === 0 && (
          <p className="mt-2 text-sm text-slate-600">No visits yet for this patient.</p>
        )}
        <div className="mt-3 grid gap-3">
          {(visits ?? []).map((v) => (
            <article key={v.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">{serviceName(v)} <span className="font-normal text-slate-500">· {v.day}</span></h3>
                  <p className="text-xs font-semibold capitalize text-slate-500">{v.status}</p>
                </div>
              </div>
              {v.status === 'completed' && (v.diagnosis || v.prescription || v.visitNotes) ? (
                <dl className="mt-2 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
                  {v.diagnosis && <div><dt className="font-semibold text-slate-700">Diagnosis</dt><dd className="text-slate-800">{v.diagnosis}</dd></div>}
                  {v.prescription && <div><dt className="font-semibold text-slate-700">Prescription</dt><dd className="text-slate-800">{v.prescription}</dd></div>}
                  {v.visitNotes && <div><dt className="font-semibold text-slate-700">Visit notes</dt><dd className="text-slate-800">{v.visitNotes}</dd></div>}
                </dl>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No clinical record for this visit yet.</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
