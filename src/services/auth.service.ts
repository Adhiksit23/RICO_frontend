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

export const AuthService = {
  signup: (payload: SignupPayload): Promise<AuthResponse> =>
    axiosInstance.post<AuthResponse>('/api/auth/signup', payload).then((r) => r.data),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    axiosInstance.post<AuthResponse>('/api/auth/login', payload).then((r) => r.data),

  logout: (): Promise<{ message: string }> =>
    axiosInstance.post<{ message: string }>('/api/auth/logout').then((r) => r.data),

  me: (): Promise<User> =>
    axiosInstance.get<User>('/api/auth/me').then((r) => r.data),

  invite: (payload: InvitePayload): Promise<InviteResponse> =>
    axiosInstance.post<InviteResponse>('/api/auth/invite', payload).then((r) => r.data),

  registerViaInvite: (payload: RegisterViaInvitePayload): Promise<AuthResponse> =>
    axiosInstance.post<AuthResponse>('/api/auth/register-via-invite', payload).then((r) => r.data),

  getUsers: (): Promise<User[]> =>
    axiosInstance.get<User[]>('/api/auth/users').then((r) => r.data),

  toggleUserActive: (userId: number): Promise<User> =>
    axiosInstance.patch<User>(`/api/auth/users/${userId}`).then((r) => r.data),
};
