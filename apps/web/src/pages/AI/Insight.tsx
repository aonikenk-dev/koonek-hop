import { AlertTriangle, AlertCircle, Info, CheckCircle2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { insights, type InsightSeverity } from '@/data/mock/insights';

const SEVERITY_STYLE: Record<InsightSeverity, { icon: typeof AlertTriangle; badge: string }> = {
  critical: { icon: AlertCircle, badge: 'badge-sienna' },
  warning: { icon: AlertTriangle, badge: 'badge-sienna' },
  info: { icon: Info, badge: 'badge-glacier' },
  positive: { icon: CheckCircle2, badge: 'badge-moss' },
};

export default function Insight() {
  const { t } = useApp();

  const total = insights.length;
  const critical = insights.filter((i) => i.severity === 'critical').length;
  const avgConfidence = Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / total);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <Sparkles size={18} className="text-glacier" />
          <p className="font-display font-bold text-2xl text-text mt-3">{total}</p>
          <p className="text-xs text-muted mt-1">{t('ai.insight.kpi.total')}</p>
        </div>
        <div className="kpi-card">
          <AlertCircle size={18} className="text-sienna" />
          <p className="font-display font-bold text-2xl text-sienna mt-3">{critical}</p>
          <p className="text-xs text-muted mt-1">{t('ai.insight.kpi.critical')}</p>
        </div>
        <div className="kpi-card">
          <CheckCircle2 size={18} className="text-moss" />
          <p className="font-display font-bold text-2xl text-text mt-3">{avgConfidence}%</p>
          <p className="text-xs text-muted mt-1">{t('ai.insight.kpi.avgConfidence')}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="eyebrow">{t('ai.insight.listTitle')}</p>
        <p className="text-sm text-muted">{t('ai.insight.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const { icon: Icon, badge } = SEVERITY_STYLE[insight.severity];
          return (
            <div key={insight.id} className="kpi-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={clsx(insight.severity === 'positive' ? 'text-moss' : insight.severity === 'info' ? 'text-glacier' : 'text-sienna')} />
                  <p className="font-display font-bold text-sm text-text">{t(`ai.insight.items.${insight.id}.title`)}</p>
                </div>
                <span className={clsx(badge, 'text-2xs shrink-0')}>{t(`ai.insight.severity.${insight.severity}`)}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {t(`ai.insight.items.${insight.id}.description`, insight.params)}
              </p>
              <p className="text-2xs font-mono text-muted">{t('ai.insight.confidence', { value: insight.confidence })}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
