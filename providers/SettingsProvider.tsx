import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getItem, setItem } from '@/lib/storage';

export type AppSettings = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  bookingReminders: boolean;
  marketingEmails: boolean;
};

const DEFAULTS: AppSettings = {
  pushNotifications: true,
  emailNotifications: true,
  bookingReminders: true,
  marketingEmails: false,
};

const SETTINGS_KEY = 'bluerock.settings.v1';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await getItem(SETTINGS_KEY);
      if (cancelled) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<AppSettings>;
          setSettings({ ...DEFAULTS, ...parsed });
        } catch {
          setSettings(DEFAULTS);
        }
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      setSetting: (key, val) => {
        setSettings((prev) => {
          const next = { ...prev, [key]: val };
          void setItem(SETTINGS_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [settings, ready],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
