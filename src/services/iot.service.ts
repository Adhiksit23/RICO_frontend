import axiosInstance from '@/lib/axios';

export type IotSyncStatus = {
  running: boolean;
  desired_running: boolean;
  interval_seconds: number;
  include_legacy: boolean;
  boot_env_enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  updated_by: string | null;
  last_result: {
    status?: string;
    trigger?: string;
    error?: string;
    shot_sync?: string | null;
    legacy_sync?: string | null;
    finished_at?: string;
  } | null;
  message?: string;
};

export const IotService = {
  status: (): Promise<IotSyncStatus> =>
    axiosInstance.get<IotSyncStatus>('/api/iot/status').then((r) => r.data),

  start: (): Promise<IotSyncStatus> =>
    axiosInstance.post<IotSyncStatus>('/api/iot/start').then((r) => r.data),

  stop: (): Promise<IotSyncStatus> =>
    axiosInstance.post<IotSyncStatus>('/api/iot/stop').then((r) => r.data),

  runNow: (): Promise<unknown> =>
    axiosInstance.post('/api/iot/run-now').then((r) => r.data),
};
