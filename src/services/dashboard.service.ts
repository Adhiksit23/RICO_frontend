import axiosInstance from '@/lib/axios';
import type {
  DashboardFilterParams,
  DashboardFiltersMetadata,
  DashboardStatsResponse,
  DashboardSummary,
  PeriodCompareParams,
  PeriodCompareResponse,
  LongitudinalParams,
  LongitudinalResponse,
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
   * Compare two distinct periods to show defect increases or decreases.
   */
  compare: (params?: PeriodCompareParams): Promise<PeriodCompareResponse> =>
    axiosInstance
      .get<PeriodCompareResponse>('/api/dashboard/compare', { params })
      .then((r) => r.data),

  /**
   * Time-series longitudinal defect analysis.
   */
  getLongitudinal: (params?: LongitudinalParams): Promise<LongitudinalResponse> =>
    axiosInstance
      .get<LongitudinalResponse>('/api/dashboard/longitudinal', { params })
      .then((r) => r.data),

  /**
   * Backward-compatible summary fetch.
   */
  getSummary: (params?: DashboardFilterParams): Promise<DashboardSummary> =>
    axiosInstance
      .get<DashboardSummary>('/api/dashboard/summary', { params })
      .then((r) => r.data),
};

