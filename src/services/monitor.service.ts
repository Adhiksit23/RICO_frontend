import axiosInstance from '@/lib/axios';
import type { PredictionData, MonitorResponse } from '@/types';

export const UpdateService = {
  update: (): Promise<unknown> =>
    axiosInstance.get('/api/predictor/update').then((r) => r.data),
};


export const MonitorService = {
  
  update_IOT: (): Promise<unknown> =>
    axiosInstance.get('/api/predictor/update_IOT').then((r) => r.data),

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
