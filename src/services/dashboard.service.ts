import axiosInstance from '@/lib/axios';
import type {
  DashboardFilterParams,
  DashboardFiltersMetadata,
  DashboardStatsResponse,
  DashboardSummary,
} from '@/types';

export const DashboardService = {
  /**
   * Fetch distinct filter options directly from the database (Clients, Machines, Dies, Periods).
   */
  getFilters: (): Promise<DashboardFiltersMetadata> =>
    axiosInstance.get<DashboardFiltersMetadata>('/api/dashboard/filters').then((r) => r.data),

  /**
   * Fetch full dashboard analytics (Summary, Defect Breakdown, Chart Slices) for the given filters.
   */
  getStats: (params?: DashboardFilterParams): Promise<DashboardStatsResponse> =>
    axiosInstance
      .get<DashboardStatsResponse>('/api/dashboard/stats', { params })
      .then((r) => r.data),

  /**
   * Backward-compatible summary fetch.
   */
  getSummary: (params?: DashboardFilterParams): Promise<DashboardSummary> =>
    axiosInstance
      .get<DashboardSummary>('/api/dashboard/summary', { params })
      .then((r) => r.data),
};
