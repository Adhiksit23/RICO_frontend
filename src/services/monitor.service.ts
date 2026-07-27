import axiosInstance from '@/lib/axios';
import type { PredictionData, MonitorResponse } from '@/types';

export const MonitorService = {
  predict: (die: string): Promise<PredictionData> =>
    axiosInstance
      .get<PredictionData>('/api/predictor/predict', { params: { die } })
      .then((r) => r.data),

  monitor: (die: string): Promise<MonitorResponse> =>
    axiosInstance
      .get<MonitorResponse>('/api/predictor/monitor', { params: { die } })
      .then((r) => r.data),

  update: (): Promise<unknown> =>
    axiosInstance.get('/api/predictor/update').then((r) => r.data),
};
