import axiosInstance from '@/lib/axios';

export interface TrainModelResponse {
  status: string;
  accuracy?: number;
  message?: string;
}

export interface CalibrationRunResponse {
  status?: string;
  message?: string;
}

export const SettingsService = {
  trainModel: (): Promise<TrainModelResponse> =>
    axiosInstance.get<TrainModelResponse>('/api/trainer/train').then((r) => r.data),

  runCalibrationWorkflow: (): Promise<CalibrationRunResponse> =>
    axiosInstance.get<CalibrationRunResponse>('/api/calibrator/run').then((r) => r.data),

  updateIoTStreamStatus: (action: 'start' | 'stop'): Promise<{ message: string }> =>
    axiosInstance.get(`/api/predictor/update`, { params: { action } }).then((r) => r.data),
};
