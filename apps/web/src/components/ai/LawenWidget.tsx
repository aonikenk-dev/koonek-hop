import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X, EyeOff, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/contexts/AIContext';
import { copilotQuickPrompts } from '@/data/mock/ai';
import LawenAvatar from './LawenAvatar';

export default function LawenWidget() {
  const { t } = useApp();
  const { aiModuleEnabled, lawenWidgetEnabled, setLawenWidgetEnabled, chatOpen, setChatOpen, messages, thinking, sendMessage } =
    useAI();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking, chatOpen]);

  if (!aiModuleEnabled || !lawenWidgetEnabled) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {chatOpen && (
        <div className="w-80 sm:w-96 h-[28rem] bg-surface rounded-lg border border-border shadow-card-lg flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
            <LawenAvatar size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-text leading-none">{t('ai.copilot.name')}</p>
              <p className="text-2xs text-muted leading-tight mt-0.5">{t('ai.copilot.role')}</p>
            </div>
            <button
              onClick={() => setLawenWidgetEnabled(false)}
              title={t('ai.copilot.hide')}
              className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            >
              <EyeOff size={14} />
            </button>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((m) => (
              <div key={m.id} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed',
                    m.role === 'user' ? 'bg-moss text-white' : 'bg-surface-2 text-text'
                  )}
                >
                  {m.role === 'user' ? m.text : t(m.textKey ?? '', m.params)}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-surface-2 px-3 py-2.5 rounded-lg flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {messages.length === 1 && !thinking && (
              <div className="space-y-1.5 pt-1">
                <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('ai.copilot.quickPromptsTitle')}</p>
                {copilotQuickPrompts.map((key) => (
                  <button
                    key={key}
                    onClick={() => sendMessage(t(`ai.copilot.quickPrompts.${key}`))}
                    className="w-full text-left text-xs px-3 py-2 rounded border border-border bg-surface hover:border-moss hover:text-moss transition-colors"
                  >
                    {t(`ai.copilot.quickPrompts.${key}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.copilot.placeholder')}
              className="flex-1 px-3 py-2 rounded border border-border bg-bg font-mono text-sm text-text outline-none focus:border-moss"
            />
            <button type="submit" className="p-2 rounded bg-moss text-white hover:bg-moss-dim transition-colors">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="relative w-14 h-14 rounded-full bg-surface border border-border shadow-card-lg flex items-center justify-center hover:border-moss transition-colors"
        title={t('ai.copilot.name')}
      >
        <LawenAvatar size={42} />
        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-moss border-2 border-surface" />
      </button>
    </div>
  );
}
