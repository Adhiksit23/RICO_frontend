import axiosInstance from '@/lib/axios';
import type {
  CalibrationLatestResponse,
  CalibrationRangesResponse,
  CalibrationPayload,
  CalibrationApplyResponse,
} from '@/types';

export const calibrationApi = {
  getLatest: (machine: string, die: string) =>
    axiosInstance
      .get<CalibrationLatestResponse>('/api/calibration/latest', { params: { machine, die } })
      .then((r) => r.data),

  getRanges: (machine: string, die: string) =>
    axiosInstance
      .get<CalibrationRangesResponse>('/api/calibration/ranges', { params: { machine, die } })
      .then((r) => r.data),

  apply: (machine: string, die: string, payload: CalibrationPayload) =>
    axiosInstance
      .post<CalibrationApplyResponse>('/api/calibration/apply', payload, { params: { machine, die } })
      .then((r) => r.data),
};
