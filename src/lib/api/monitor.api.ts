import axiosInstance from '@/lib/axios';
import type { PredictionData, MonitorResponse } from '@/types';

export const monitorApi = {
  predict: (die: string) =>
    axiosInstance
      .get<PredictionData>('/api/predictor/predict', { params: { die } })
      .then((r) => r.data),

  monitor: (die: string) =>
    axiosInstance
      .get<MonitorResponse>('/api/predictor/monitor', { params: { die } })
      .then((r) => r.data),
};
