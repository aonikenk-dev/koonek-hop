import { useMemo, type ReactNode } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CalendarDays, Users, CheckCircle2, Activity } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { patients } from '@/data/mock/patients';
import { appointments } from '@/data/mock/appointments';
import { monthlyVisitsLast6, patientsByAgeGroup, topConsultationReasons } from '@/data/mock/reports';

const AXIS_STYLE = { fontFamily: 'DM Mono, monospace', fontSize: 11, fill: '#4A5568' };
const TOOLTIP_STYLE = {
  fontFamily: 'DM Mono, monospace',
  fontSize: 12,
  borderRadius: 6,
  border: '1px solid #D0D8E4',
  backgroundColor: '#FFFFFF',
};

const STATUS_COLOR: Record<string, string> = {
  scheduled: '#7BAFC4',
  confirmed: '#3D6B4F',
  cancelled: '#C0623A',
  done: '#4E8863',
  overbooking: '#E07A52',
  blocked: '#0D0F12',
};

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="kpi-card">
      <p className="font-display font-bold text-sm text-text mb-4">{title}</p>
      <div style={{ width: '100%', height: 240 }}>{children}</div>
    </div>
  );
}

export default function Reports() {
  const { t, language } = useApp();

  const monthLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', { month: 'short' });
    const now = new Date();
    return monthlyVisitsLast6.map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthlyVisitsLast6.length - 1 - i), 1);
      return formatter.format(d).replace('.', '');
    });
  }, [language]);

  const monthlyVisitsData = monthlyVisitsLast6.map((visits, i) => ({ month: monthLabels[i], visits }));

  const appointmentsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach((a) => counts.set(a.status, (counts.get(a.status) ?? 0) + 1));
    return Array.from(counts.entries()).map(([status, count]) => ({
      status: t(`appointments.statusOptions.${status}`),
      count,
      color: STATUS_COLOR[status] ?? '#8896A8',
    }));
  }, [t]);

  const appointmentsThisMonth = useMemo(() => {
    const now = new Date();
    return appointments.filter((a) => {
      const d = new Date(a.start);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, []);

  const completionRate = useMemo(() => {
    const done = appointments.filter((a) => a.status === 'done').length;
    const relevant = appointments.filter((a) => a.status === 'done' || a.status === 'cancelled').length;
    return relevant === 0 ? 0 : Math.round((done / relevant) * 100);
  }, []);

  const avgDailyVisits = Math.round(
    monthlyVisitsLast6.reduce((sum, v) => sum + v, 0) / monthlyVisitsLast6.length / 22
  );

  const kpis = [
    { key: 'totalPatients', icon: Users, value: patients.length, color: 'text-moss' },
    { key: 'appointmentsThisMonth', icon: CalendarDays, value: appointmentsThisMonth, color: 'text-glacier' },
    { key: 'completionRate', icon: CheckCircle2, value: `${completionRate}%`, color: 'text-moss' },
    { key: 'avgDailyVisits', icon: Activity, value: avgDailyVisits, color: 'text-sienna' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ key, icon: Icon, value, color }) => (
          <div key={key} className="kpi-card">
            <Icon size={18} className={color} />
            <p className="font-display font-bold text-2xl text-text mt-3">{value}</p>
            <p className="text-xs text-muted mt-1">{t(`reports.kpi.${key}`)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={t('reports.charts.monthlyVisits')}>
          <ResponsiveContainer>
            <LineChart data={monthlyVisitsData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#D0D8E4" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={{ stroke: '#D0D8E4' }} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [value, t('reports.visits')]} />
              <Line type="monotone" dataKey="visits" stroke="#3D6B4F" strokeWidth={2} dot={{ r: 3, fill: '#3D6B4F' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('reports.charts.appointmentsByStatus')}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={appointmentsByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {appointmentsByStatus.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3">
            {appointmentsByStatus.map((entry) => (
              <span key={entry.status} className="flex items-center gap-1.5 text-2xs text-muted font-mono">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                {entry.status} ({entry.count})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title={t('reports.charts.patientsByAgeGroup')}>
          <ResponsiveContainer>
            <BarChart data={patientsByAgeGroup} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#D0D8E4" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="group" tick={AXIS_STYLE} axisLine={{ stroke: '#D0D8E4' }} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [value, t('reports.patients')]} />
              <Bar dataKey="count" fill="#7BAFC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('reports.charts.topReasons')}>
          <ResponsiveContainer>
            <BarChart
              data={topConsultationReasons}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#D0D8E4" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="reason"
                tick={AXIS_STYLE}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#C0623A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
