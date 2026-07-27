'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import type { LoginPayload, SignupPayload, RegisterViaInvitePayload } from '@/types';

/** Initializes auth state by calling GET /api/auth/me on mount. */
export function useCurrentUser() {
  const { setUser, clearUser, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      setLoading(true);
      try {
        const user = await AuthService.me();
        setUser(user);
        return user;
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rico_token');
        }
        clearUser();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/** Login mutation — on success sets user & token, then redirects to /dashboard. */
export function useLogin() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => AuthService.login(payload),
    onSuccess: (data) => {
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('rico_token', data.token);
      }
      setUser(data.user);
      router.push('/dashboard');
    },
  });
}

/** Signup mutation — on success sets user & token, then redirects to /dashboard. */
export function useSignup() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SignupPayload) => AuthService.signup(payload),
    onSuccess: (data) => {
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('rico_token', data.token);
      }
      setUser(data.user);
      router.push('/dashboard');
    },
  });
}

/** Logout mutation — on success clears token & Zustand, then redirects to /login. */
export function useLogout() {
  const { clearUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rico_token');
      }
      clearUser();
      router.push('/login');
    },
    onError: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rico_token');
      }
      clearUser();
      router.push('/login');
    },
  });
}

/** Register-via-invite mutation — on success sets user & token, then redirects to /dashboard. */
export function useRegisterViaInvite() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterViaInvitePayload) => AuthService.registerViaInvite(payload),
    onSuccess: (data) => {
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('rico_token', data.token);
      }
      setUser(data.user);
      router.push('/dashboard');
    },
  });
}

