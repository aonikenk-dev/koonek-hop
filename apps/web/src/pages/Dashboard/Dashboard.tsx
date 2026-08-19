import { CalendarDays, Users, ClipboardList, Activity, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { kpis, upcomingAppointments, recentPatients } from '@/data/mock/dashboard';

const KPI_ITEMS = [
  { key: 'todayAppointments', icon: CalendarDays, value: kpis.todayAppointments, color: 'text-moss' },
  { key: 'activePatients', icon: Users, value: kpis.activePatients, color: 'text-glacier' },
  { key: 'pendingPrescriptions', icon: ClipboardList, value: kpis.pendingPrescriptions, color: 'text-sienna' },
  { key: 'monthlyVisits', icon: Activity, value: kpis.monthlyVisits, color: 'text-moss' },
] as const;

export default function Dashboard() {
  const { t } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_ITEMS.map(({ key, icon: Icon, value, color }) => (
          <div key={key} className="kpi-card">
            <Icon size={18} className={color} />
            <p className="font-display font-bold text-2xl text-text mt-3">{value}</p>
            <p className="text-xs text-muted mt-1">{t(`dashboard.kpi.${key}`)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="kpi-card">
          <p className="font-display font-bold text-sm text-text mb-4">{t('dashboard.upcomingAppointments')}</p>
          <ul className="divide-y divide-border">
            {upcomingAppointments.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{a.patient}</p>
                  <p className="text-xs text-muted truncate">{a.reason}</p>
                </div>
                <span className="badge-glacier shrink-0">{a.time}</span>
                <button
                  onClick={() => navigate(`/health-records/${a.patientId}`)}
                  className="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 text-xs font-mono rounded border border-moss/40 text-moss hover:bg-moss/10 transition-colors"
                >
                  <Stethoscope size={11} />
                  {t('dashboard.startConsultation')}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="kpi-card">
          <p className="font-display font-bold text-sm text-text mb-4">{t('dashboard.recentPatients')}</p>
          <ul className="divide-y divide-border">
            {recentPatients.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5">
                <p className="text-sm text-text">{p.name}</p>
                <span className="text-xs text-muted font-mono">{p.lastVisit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
