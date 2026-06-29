import { create } from 'zustand';

export interface WorkspaceTab {
  /** Unique per open document, e.g. `health-record:p1`. */
  key: string;
  kind: 'patient' | 'healthRecord';
  label: string;
  path: string;
  /**
   * Unsaved form state for this tab, keyed by field name. Lets a tab be
   * navigated away from and back to without losing in-progress edits —
   * React Query caches *fetched* data, this store caches *unsaved drafts*.
   */
  draft: Record<string, string>;
}

interface WorkspaceTabsState {
  tabs: WorkspaceTab[];
  activeKey: string | null;
  openTab: (tab: Omit<WorkspaceTab, 'draft'>) => void;
  closeTab: (key: string) => void;
  setActiveKey: (key: string) => void;
  setDraftField: (key: string, field: string, value: string) => void;
}

export const useWorkspaceTabs = create<WorkspaceTabsState>((set, get) => ({
  tabs: [],
  activeKey: null,

  openTab: (tab) => {
    const existing = get().tabs.find((t) => t.key === tab.key);
    if (existing) {
      set((state) => ({
        tabs: state.tabs.map((t) => (t.key === tab.key ? { ...t, label: tab.label } : t)),
        activeKey: tab.key,
      }));
      return;
    }
    set((state) => ({
      tabs: [...state.tabs, { ...tab, draft: {} }],
      activeKey: tab.key,
    }));
  },

  closeTab: (key) => {
    set((state) => {
      const tabs = state.tabs.filter((t) => t.key !== key);
      const activeKey =
        state.activeKey === key ? tabs[tabs.length - 1]?.key ?? null : state.activeKey;
      return { tabs, activeKey };
    });
  },

  setActiveKey: (key) => set({ activeKey: key }),

  setDraftField: (key, field, value) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.key === key ? { ...t, draft: { ...t.draft, [field]: value } } : t)),
    }));
  },
}));
