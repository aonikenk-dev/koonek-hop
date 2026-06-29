import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/contexts/AIContext';
import { copilotQuickPrompts } from '@/data/mock/ai';
import LawenAvatar from '@/components/ai/LawenAvatar';

export default function Copilot() {
  const { t } = useApp();
  const { messages, thinking, sendMessage } = useAI();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-4">
        <div className="kpi-card flex flex-col items-center text-center gap-3">
          <LawenAvatar size={72} />
          <div>
            <p className="font-display font-bold text-lg text-text">{t('ai.copilot.name')}</p>
            <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('ai.copilot.role')}</p>
          </div>
          <p className="text-sm text-muted leading-relaxed">{t('ai.copilot.description')}</p>
        </div>

        <div className="kpi-card space-y-2">
          <p className="eyebrow">{t('ai.copilot.quickPromptsTitle')}</p>
          {copilotQuickPrompts.map((key) => (
            <button
              key={key}
              onClick={() => sendMessage(t(`ai.copilot.quickPrompts.${key}`))}
              className="w-full text-left text-xs px-3 py-2 rounded border border-border bg-bg hover:border-moss hover:text-moss transition-colors"
            >
              {t(`ai.copilot.quickPrompts.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 kpi-card flex flex-col h-[32rem] p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={clsx('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && <LawenAvatar size={28} className="shrink-0 mt-1" />}
              <div
                className={clsx(
                  'max-w-[75%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed',
                  m.role === 'user' ? 'bg-moss text-white' : 'bg-surface-2 text-text'
                )}
              >
                {m.role === 'user' ? m.text : t(m.textKey ?? '', m.params)}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2 justify-start">
              <LawenAvatar size={28} className="shrink-0 mt-1" />
              <div className="bg-surface-2 px-3.5 py-3 rounded-lg flex gap-1">
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
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ai.copilot.placeholder')}
            className="flex-1 px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
          />
          <button type="submit" className="p-2.5 rounded bg-moss text-white hover:bg-moss-dim transition-colors">
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
