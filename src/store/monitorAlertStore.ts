import { create } from 'zustand';
import type { RangeMismatchAlert } from '@/types';

interface MonitorAlertState {
  die: string | null;
  alert: RangeMismatchAlert | null;
  setAlert: (die: string, alert: RangeMismatchAlert) => void;
  clearAlert: () => void;
}

export const useMonitorAlertStore = create<MonitorAlertState>((set) => ({
  die: null,
  alert: null,
  setAlert: (die, alert) => set({ die, alert }),
  clearAlert: () => set({ die: null, alert: null }),
}));
