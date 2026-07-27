import axiosInstance from '@/lib/axios';
import type { DashboardSummary } from '@/types';

export const DashboardService = {
  getSummary: (): Promise<DashboardSummary> =>
    axiosInstance.get<DashboardSummary>('/api/dashboard/summary').then((r) => r.data),
};
