import axiosInstance from '@/lib/axios';
import type {
  AuthResponse,
  User,
  SignupPayload,
  LoginPayload,
  RegisterViaInvitePayload,
  InvitePayload,
  InviteResponse,
} from '@/types';

export const authApi = {
  signup: (payload: SignupPayload) =>
    axiosInstance.post<AuthResponse>('/api/auth/signup', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    axiosInstance.post<AuthResponse>('/api/auth/login', payload).then((r) => r.data),

  logout: () =>
    axiosInstance.post<{ message: string }>('/api/auth/logout').then((r) => r.data),

  me: () =>
    axiosInstance.get<User>('/api/auth/me').then((r) => r.data),

  invite: (payload: InvitePayload) =>
    axiosInstance.post<InviteResponse>('/api/auth/invite', payload).then((r) => r.data),

  registerViaInvite: (payload: RegisterViaInvitePayload) =>
    axiosInstance.post<AuthResponse>('/api/auth/register-via-invite', payload).then((r) => r.data),

  getUsers: () =>
    axiosInstance.get<User[]>('/api/auth/users').then((r) => r.data),

  toggleUserActive: (userId: number) =>
    axiosInstance.patch<User>(`/api/auth/users/${userId}`).then((r) => r.data),
};
