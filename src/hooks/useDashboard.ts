import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DashboardService } from '@/services';
import { useDashboardStore } from '@/store/dashboardStore';
import type { DashboardFilterParams } from '@/types';

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
      },
    ],
    queryFn: () => DashboardService.getStats(params),
    staleTime: 60 * 1000, // 1 minute fresh
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    placeholderData: keepPreviousData, // Keeps previous numbers while new filter fetches for silky smooth UX
    refetchOnWindowFocus: false,
  });
}

export function useDashboard() {
  const {
    selectedClient,
    selectedMachine,
    selectedDie,
    selectedPeriod,
    setSelectedClient,
    setSelectedMachine,
    setSelectedDie,
    setSelectedPeriod,
    resetFilters,
  } = useDashboardStore();

  const filtersQuery = useDashboardFilters();
  const statsQuery = useDashboardStats({
    client: selectedClient,
    machine: selectedMachine,
    die: selectedDie,
    period: selectedPeriod,
  });

  return {
    // Filter Selections
    selectedClient,
    selectedMachine,
    selectedDie,
    selectedPeriod,
    setSelectedClient,
    setSelectedMachine,
    setSelectedDie,
    setSelectedPeriod,
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
