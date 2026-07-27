import axiosInstance from '@/lib/axios';
import type { DashboardSummary } from '@/types';

export const dashboardApi = {
  getSummary: () =>
    axiosInstance.get<DashboardSummary>('/api/dashboard/summary').then((r) => r.data),
};
