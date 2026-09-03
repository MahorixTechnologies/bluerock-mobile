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
    name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  requestEmailVerification: (email: string) => Promise<{ demoCode: string | null }>;
  verifyEmail: (params: { email: string; code: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ demoCode: string | null }>;
  confirmPasswordReset: (params: {
    email: string;
    code: string;
    newPassword: string;
  }) => Promise<void>;
  updateProfile: (profile: Pick<UserProfile, 'name' | 'phone'>) => Promise<void>;
  applyForLandlord: () => Promise<void>;
};

const PROFILE_KEY = 'bluerock.profile.v1';

function requireApiUrl() {
  if (!process.env.EXPO_PUBLIC_API_URL) {
    throw new Error('This action requires a connected server. Configure EXPO_PUBLIC_API_URL.');
  }
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

        if (process.env.EXPO_PUBLIC_API_URL) {
          try {
            const me = (await apiFetch('/users/me')) as any;
            const nextProfile: UserProfile = {
              email: String(me?.email ?? safeLocal.email),
              name: String(me?.name ?? ''),
              phone: String(me?.phone ?? ''),
              emailVerified: Boolean(me?.emailVerified),
              role: (me?.role as UserProfile['role']) ?? safeLocal.role,
              ownerApplicationStatus:
                (me?.ownerApplicationStatus as UserProfile['ownerApplicationStatus']) ??
                safeLocal.ownerApplicationStatus ??
                'NONE',
              ownerApplicationAt: me?.ownerApplicationAt ?? safeLocal.ownerApplicationAt ?? null,
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
        requireApiUrl();
        const trimmedEmail = email.trim();
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
        } catch (e) {
          setStatus('signedOut');
          throw e instanceof Error ? e : new Error('Login failed');
        }
      },
      register: async ({ email, password, role, phone, name }) => {
        // Deliberately does not sign the user in — the backend never issues
        // an accessToken at registration (only an unverified account is
        // created). The caller must route to /verify-email; verifyEmail()
        // below is what actually establishes the session.
        setStatus('loading');
        try {
          requireApiUrl();
          await apiFetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              role: role ?? 'RENTER',
              phone: typeof phone === 'string' ? phone : undefined,
              name: typeof name === 'string' ? name : undefined,
            }),
          });
        } finally {
          setStatus('signedOut');
        }
      },
      logout: async () => {
        await deleteAccessToken();
        await removeItem(PROFILE_KEY);
        setProfile(null);
        setStatus('signedOut');
      },
      requestEmailVerification: async (email) => {
        requireApiUrl();
        const payload = await apiFetch('/auth/request-email-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const code = (payload as any)?.emailVerificationCode;
        return { demoCode: typeof code === 'string' ? code : null };
      },
      // A successful verification is also the first (and only, alongside
      // login()) moment the account becomes a real session — register()
      // deliberately never signs in, so this establishes it here.
      verifyEmail: async ({ email, code }) => {
        requireApiUrl();
        const payload = await apiFetch('/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        });
        const token = (payload as any)?.accessToken;
        if (!token || typeof token !== 'string') {
          throw new Error('Verification response was missing an access token.');
        }

        const nextProfile: UserProfile = {
          email: (payload as any)?.user?.email ?? email,
          name: (payload as any)?.user?.name ?? '',
          phone: (payload as any)?.user?.phone ?? '',
          emailVerified: true,
          role: ((payload as any)?.user?.role as UserProfile['role']) ?? 'RENTER',
        };
        await setAccessToken(token);
        await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        setProfile(nextProfile);
        setStatus('signedIn');
      },
      requestPasswordReset: async (email) => {
        requireApiUrl();
        const payload = await apiFetch('/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const code = (payload as any)?.passwordResetCode;
        return { demoCode: typeof code === 'string' ? code : null };
      },
      confirmPasswordReset: async ({ email, code, newPassword }) => {
        requireApiUrl();
        await apiFetch('/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code, newPassword }),
        });
      },
      updateProfile: async ({ name, phone }) => {
        if (!profile) return;
        requireApiUrl();
        await apiFetch('/users/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone }),
        });
        const nextProfile: UserProfile = { ...profile, name, phone };
        await setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        setProfile(nextProfile);
      },
      applyForLandlord: async () => {
        if (!profile) return;
        if (profile.role !== 'RENTER') {
          throw new Error('Only renter accounts can apply to become a landlord.');
        }
        if (profile.ownerApplicationStatus === 'PENDING') {
          throw new Error('You already have a pending landlord application.');
        }
        requireApiUrl();

        const payload = await apiFetch('/users/me/owner-application', {
          method: 'POST',
        });
        const nextProfile: UserProfile = {
          ...profile,
          ownerApplicationStatus:
            ((payload as any)?.ownerApplicationStatus as UserProfile['ownerApplicationStatus']) ??
            'PENDING',
          ownerApplicationAt: (payload as any)?.ownerApplicationAt ?? new Date().toISOString(),
        };
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
