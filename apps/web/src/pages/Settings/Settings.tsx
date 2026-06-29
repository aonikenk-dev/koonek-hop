import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/contexts/AIContext';
import { copilotUsage } from '@/data/mock/ai';
import LawenAvatar from '@/components/ai/LawenAvatar';
import Toggle from '@/components/ui/Toggle';

export default function Settings() {
  const { t } = useApp();
  const { aiModuleEnabled, setAiModuleEnabled, lawenWidgetEnabled, setLawenWidgetEnabled } = useAI();

  const usagePercent = Math.round((copilotUsage.used / copilotUsage.limit) * 100);
  const usageRemaining = copilotUsage.limit - copilotUsage.used;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="kpi-card flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <LawenAvatar size={32} />
          <div>
            <p className="font-display font-bold text-sm text-text">{t('settings.modules.aiModule.title')}</p>
            <p className="text-sm text-muted mt-1">{t('settings.modules.aiModule.description')}</p>
          </div>
        </div>
        <Toggle checked={aiModuleEnabled} onChange={setAiModuleEnabled} />
      </div>

      <div className="kpi-card flex items-start justify-between gap-4">
        <div>
          <p className="font-display font-bold text-sm text-text">{t('settings.assistant.title')}</p>
          <p className="text-sm text-muted mt-1">{t('settings.assistant.description')}</p>
          {!aiModuleEnabled && (
            <p className="text-2xs text-sienna mt-2">{t('settings.assistant.disabledNotice')}</p>
          )}
        </div>
        <Toggle checked={lawenWidgetEnabled} onChange={setLawenWidgetEnabled} disabled={!aiModuleEnabled} />
      </div>

      {aiModuleEnabled && (
        <div className="kpi-card space-y-3">
          <p className="font-display font-bold text-sm text-text">{t('settings.usage.title')}</p>
          <p className="text-sm text-muted">{t('settings.usage.description')}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-muted">
              <span>{t('settings.usage.label', { used: copilotUsage.used, limit: copilotUsage.limit })}</span>
              <span>{usagePercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div
                className={clsx('h-full rounded-full', usagePercent >= 90 ? 'bg-sienna' : 'bg-moss')}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <p className="text-2xs text-muted">{t('settings.usage.remaining', { remaining: usageRemaining })}</p>
          </div>
        </div>
      )}
    </div>
  );
}
