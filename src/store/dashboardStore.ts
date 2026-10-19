import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardFilterState {
  selectedClient: string;
  selectedMachine: string;
  selectedDie: string;
  selectedPeriod: string;
  startDate: string;
  endDate: string;
  setSelectedClient: (client: string) => void;
  setSelectedMachine: (machine: string) => void;
  setSelectedDie: (die: string) => void;
  setSelectedPeriod: (period: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setCustomDateRange: (start: string, end: string) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  selectedClient: 'All',
  selectedMachine: 'All',
  selectedDie: 'All',
  selectedPeriod: 'all',
  startDate: '',
  endDate: '',
};

export const useDashboardStore = create<DashboardFilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,
      setSelectedClient: (client) => set({ selectedClient: client }),
      setSelectedMachine: (machine) => set({ selectedMachine: machine }),
      setSelectedDie: (die) => set({ selectedDie: die }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),
      setCustomDateRange: (startDate, endDate) => set({ startDate, endDate }),
      resetFilters: () => set(DEFAULT_FILTERS),
    }),
    {
      name: 'rico-dashboard-filters',
    }
  )
);

