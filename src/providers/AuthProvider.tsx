import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/lib/api-client';
import type { UserProfile } from '@/lib/models';
import { getItem, removeItem, setItem } from '@/lib/storage';
import { deleteAccessToken, getAccessToken, setAccessToken } from '@/lib/token-store';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  profile: UserProfile | null;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    role?: UserProfile['role'];
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  markEmailVerified: () => Promise<void>;
  updateProfile: (profile: Pick<UserProfile, 'name' | 'phone'>) => Promise<void>;
};

const PROFILE_KEY = 'bluerock.profile.v1';

type DemoAccount = {
  email: string;
  password: string;
  role: UserProfile['role'];
  name: string;
  phone?: string;
  emailVerified: boolean;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@bluerock.com',
    password: 'admin123',
    role: 'ADMIN',
    name: 'BlueRock Admin',
    emailVerified: true,
  },
  {
    email: 'landlord@bluerock.com',
    password: 'landlord123',
    role: 'LANDLORD',
    name: 'BlueRock Landlord',
    phone: '+2348123456789',
    emailVerified: true,
  },
  {
    email: 'renter@bluerock.com',
    password: 'renter123',
    role: 'RENTER',
    name: 'BlueRock Renter',
    emailVerified: true,
  },
];

function matchDemoAccount(email: string, password: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    ) ?? null
  );
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const token = await getAccessToken();
      const rawProfile = await getItem(PROFILE_KEY);
      let parsed: UserProfile | null = null;
      if (rawProfile) {
        try {
          parsed = JSON.parse(rawProfile) as UserProfile;
        } catch {
          parsed = null;
        }
      }

      if (!isMounted) return;

      if (token && parsed?.email) {
        const safeLocal = { ...parsed, role: parsed.role ?? 'RENTER' };
        setProfile(safeLocal);
        setStatus('signedIn');

        const isDemoToken = typeof token === 'string' && token.startsWith('demo.');
        if (!isDemoToken && process.env.EXPO_PUBLIC_API_URL) {
          try {
            const me = (await apiFetch('/users/me')) as any;
            const nextProfile: UserProfile = {
              email: String(me?.email ?? safeLocal.email),
              name: String(me?.name ?? ''),
              phone: String(me?.phone ?? ''),
              emailVerified: Boolean(me?.emailVerified),
              role: (me?.role as UserProfile['role']) ?? safeLocal.role,
            };
            await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
            if (isMounted) {
              setProfile(nextProfile);
            }
          } catch {
            await deleteAccessToken();
            await removeItem(PROFILE_KEY);
            if (isMounted) {
              setProfile(null);
              setStatus('signedOut');
            }
          }
        }

        return;
      }

      setProfile(null);
      setStatus('signedOut');
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      profile,
      login: async ({ email, password }) => {
        setStatus('loading');
        const trimmedEmail = email.trim();
        const demo = matchDemoAccount(trimmedEmail, password);
        if (demo) {
          const devToken = `demo.${demo.role}.${Date.now()}`;
          const nextProfile: UserProfile = {
            email: demo.email,
            name: demo.name,
            phone: demo.phone ?? '',
            emailVerified: demo.emailVerified,
            role: demo.role,
          };
          await setAccessToken(devToken);
          await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
          setProfile(nextProfile);
          setStatus('signedIn');
          return;
        }

        if (process.env.EXPO_PUBLIC_API_URL) {
          try {
            const payload = await apiFetch('/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: trimmedEmail, password }),
            });
            const token = (payload as any)?.accessToken ?? (payload as any)?.token;
            if (!token || typeof token !== 'string') throw new Error('Login token missing');

            const nextProfile: UserProfile = {
              email: trimmedEmail,
              name: (payload as any)?.user?.name ?? '',
              phone: (payload as any)?.user?.phone ?? '',
              emailVerified: Boolean((payload as any)?.user?.emailVerified),
              role: ((payload as any)?.user?.role as UserProfile['role']) ?? 'RENTER',
            };
            await setAccessToken(token);
            await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
            setProfile(nextProfile);
            setStatus('signedIn');
            return;
          } catch (e) {
            setStatus('signedOut');
            throw new Error(
              e instanceof Error
                ? e.message
                : 'Invalid credentials. Try the demo accounts below.',
            );
          }
        }

        setStatus('signedOut');
        throw new Error(
          'Unknown account. Use a demo account (renter@bluerock.com / renter123) or configure EXPO_PUBLIC_API_URL.',
        );
      },
      register: async ({ email, password, role, phone }) => {
        setStatus('loading');
        if (process.env.EXPO_PUBLIC_API_URL) {
          const payload = await apiFetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              role: role ?? 'RENTER',
              phone: typeof phone === 'string' ? phone : undefined,
            }),
          });
          const token = (payload as any)?.accessToken ?? (payload as any)?.token;
          if (!token || typeof token !== 'string') throw new Error('Registration token missing');

          const nextProfile: UserProfile = {
            email,
            name: (payload as any)?.user?.name ?? '',
            phone: (payload as any)?.user?.phone ?? '',
            emailVerified: Boolean((payload as any)?.user?.emailVerified),
            role: ((payload as any)?.user?.role as UserProfile['role']) ?? (role ?? 'RENTER'),
          };
          await setAccessToken(token);
          await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
          setProfile(nextProfile);
          setStatus('signedIn');
          return;
        }

        const devToken = `dev.${Date.now()}`;
        const nextProfile: UserProfile = {
          email,
          name: '',
          phone: phone ?? '',
          emailVerified: false,
          role: role ?? 'RENTER',
        };
        await setAccessToken(devToken);
        await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        setProfile(nextProfile);
        setStatus('signedIn');
      },
      logout: async () => {
        await deleteAccessToken();
        await removeItem(PROFILE_KEY);
        setProfile(null);
        setStatus('signedOut');
      },
      requestPasswordReset: async (email) => {
        if (process.env.EXPO_PUBLIC_API_URL) {
          await apiFetch('/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          return;
        }
      },
      markEmailVerified: async () => {
        if (!profile) return;
        const nextProfile: UserProfile = { ...profile, emailVerified: true };
        await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        setProfile(nextProfile);
      },
      updateProfile: async ({ name, phone }) => {
        if (!profile) return;
        const nextProfile: UserProfile = { ...profile, name, phone };
        if (process.env.EXPO_PUBLIC_API_URL) {
          await apiFetch('/users/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone }),
          });
        }
        await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        setProfile(nextProfile);
      },
    };
  }, [profile, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
