import axiosInstance from '@/lib/axios';
import type { PredictionData, MonitorResponse } from '@/types';

export const MonitorService = {
  /** Manual trigger only — production sync is the backend scheduler. */
  update_IOT: (): Promise<unknown> =>
    axiosInstance.get('/api/predictor/update_IOT').then((r) => r.data),

  /** Manual legacy sync — prefer backend scheduler for plant ingest. */
  update: (): Promise<unknown> =>
    axiosInstance.get('/api/predictor/update').then((r) => r.data),

  predict: (die: string): Promise<PredictionData> =>
    axiosInstance
      .get<PredictionData>('/api/predictor/predict', { params: { die } })
      .then((r) => r.data),

  monitor: (die: string): Promise<MonitorResponse> =>
    axiosInstance
      .get<MonitorResponse>('/api/predictor/monitor', { params: { die } })
      .then((r) => r.data),
};
