import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { matchCopilotResponse } from '@/data/mock/ai';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  textKey?: string;
  params?: Record<string, string | number>;
}

interface AIContextValue {
  aiModuleEnabled: boolean;
  setAiModuleEnabled: (enabled: boolean) => void;
  lawenWidgetEnabled: boolean;
  setLawenWidgetEnabled: (enabled: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: AIMessage[];
  thinking: boolean;
  sendMessage: (text: string) => void;
}

const AIContext = createContext<AIContextValue | null>(null);

const MODULE_STORAGE_KEY = 'koonek.ai.module';
const WIDGET_STORAGE_KEY = 'koonek.ai.widget';

function readBoolean(key: string, fallback: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : stored === 'true';
  } catch {
    return fallback;
  }
}

export function AIProvider({ children }: { children: ReactNode }) {
  const [aiModuleEnabled, setAiModuleEnabledState] = useState(() => readBoolean(MODULE_STORAGE_KEY, true));
  const [lawenWidgetEnabled, setLawenWidgetEnabledState] = useState(() => readBoolean(WIDGET_STORAGE_KEY, true));
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([{ id: 'm0', role: 'assistant', textKey: 'ai.copilot.greeting' }]);
  const [thinking, setThinking] = useState(false);

  const setAiModuleEnabled = useCallback((enabled: boolean) => {
    setAiModuleEnabledState(enabled);
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  }, []);

  const setLawenWidgetEnabled = useCallback((enabled: boolean) => {
    setLawenWidgetEnabledState(enabled);
    try {
      localStorage.setItem(WIDGET_STORAGE_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMessage: AIMessage = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setThinking(true);
    setTimeout(() => {
      const key = matchCopilotResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', textKey: `ai.copilot.responses.${key}` },
      ]);
      setThinking(false);
    }, 900);
  }, []);

  return (
    <AIContext.Provider
      value={{
        aiModuleEnabled,
        setAiModuleEnabled,
        lawenWidgetEnabled,
        setLawenWidgetEnabled,
        chatOpen,
        setChatOpen,
        messages,
        thinking,
        sendMessage,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
