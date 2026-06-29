import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { patients } from '@/data/mock/patients';

const SEGMENT_LABEL_KEY: Record<string, string> = {
  patients: 'nav.patients',
  appointments: 'nav.appointments',
  'health-records': 'nav.healthRecords',
  prescriptions: 'nav.prescriptions',
  reports: 'nav.reports',
  settings: 'nav.settings',
  ai: 'nav.ai',
  copilot: 'nav.aiCopilot',
  agents: 'nav.aiAgents',
  insight: 'nav.aiInsight',
};

/** Patient-scoped routes (/patients/:id, /health-records/:id) resolve the id segment to a name. */
const PATIENT_SCOPED_SEGMENTS = new Set(['patients', 'health-records']);

interface Crumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs() {
  const { t } = useApp();
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'dashboard') {
    return null;
  }

  const crumbs: Crumb[] = [{ label: t('nav.dashboard'), path: '/dashboard' }];

  const [first, second] = segments;
  if (first && SEGMENT_LABEL_KEY[first]) {
    const isLast = !second;
    crumbs.push({ label: t(SEGMENT_LABEL_KEY[first]), path: isLast ? undefined : `/${first}` });
  }

  if (second) {
    if (first === 'ai' && SEGMENT_LABEL_KEY[second]) {
      crumbs.push({ label: t(SEGMENT_LABEL_KEY[second]) });
    } else if (first && PATIENT_SCOPED_SEGMENTS.has(first)) {
      const patient = patients.find((p) => p.id === second);
      crumbs.push({ label: patient ? `${patient.firstName} ${patient.lastName}` : second });
    } else {
      crumbs.push({ label: second });
    }
  }

  return (
    <nav className="flex items-center gap-1.5 px-5 py-2 bg-bg border-b border-border text-xs font-mono">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={11} className="text-subtle shrink-0" />}
          {crumb.path ? (
            <Link to={crumb.path} className="text-muted hover:text-moss transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-text font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
