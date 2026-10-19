import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DashboardService } from '@/services';
import { useDashboardStore } from '@/store/dashboardStore';
import type {
  DashboardFilterParams,
  PeriodCompareParams,
  LongitudinalParams,
} from '@/types';

export function useDashboardFilters() {
  return useQuery({
    queryKey: ['dashboard', 'filters'],
    queryFn: () => DashboardService.getFilters(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
  });
}

export function useDashboardStats(params?: DashboardFilterParams) {
  return useQuery({
    queryKey: [
      'dashboard',
      'stats',
      {
        client: params?.client || 'All',
        machine: params?.machine || 'All',
        die: params?.die || 'All',
        period: params?.period || 'all',
        start_date: params?.start_date || '',
        end_date: params?.end_date || '',
      },
    ],
    queryFn: () => DashboardService.getStats(params),
    staleTime: 60 * 1000, // 1 minute fresh
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    placeholderData: keepPreviousData, // Keeps previous numbers while new filter fetches
    refetchOnWindowFocus: false,
  });
}

export function usePeriodCompare(params?: PeriodCompareParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['dashboard', 'compare', params],
    queryFn: () => DashboardService.compare(params),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useLongitudinalDefects(params?: LongitudinalParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['dashboard', 'longitudinal', params],
    queryFn: () => DashboardService.getLongitudinal(params),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useDashboard() {
  const {
    selectedClient,
    selectedMachine,
    selectedDie,
    selectedPeriod,
    startDate,
    endDate,
    setSelectedClient,
    setSelectedMachine,
    setSelectedDie,
    setSelectedPeriod,
    setStartDate,
    setEndDate,
    setCustomDateRange,
    resetFilters,
  } = useDashboardStore();

  const filtersQuery = useDashboardFilters();
  const statsQuery = useDashboardStats({
    client: selectedClient,
    machine: selectedMachine,
    die: selectedDie,
    period: selectedPeriod,
    start_date: selectedPeriod === 'custom' ? startDate : undefined,
    end_date: selectedPeriod === 'custom' ? endDate : undefined,
  });

  return {
    // Filter Selections
    selectedClient,
    selectedMachine,
    selectedDie,
    selectedPeriod,
    startDate,
    endDate,
    setSelectedClient,
    setSelectedMachine,
    setSelectedDie,
    setSelectedPeriod,
    setStartDate,
    setEndDate,
    setCustomDateRange,
    resetFilters,

    // Data from React Query
    filtersMetadata: filtersQuery.data,
    isFiltersLoading: filtersQuery.isLoading,
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isFetching: statsQuery.isFetching,
    isPlaceholderData: statsQuery.isPlaceholderData,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

