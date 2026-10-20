import axiosInstance from '@/lib/axios';
import type {
  CalibrationLatestResponse,
  CalibrationRangesResponse,
  CalibrationPayload,
  CalibrationApplyResponse,
} from '@/types';

export const CalibrationService = {
  getLatest: (machine: string, die: string): Promise<CalibrationLatestResponse> =>
    axiosInstance
      .get<CalibrationLatestResponse>('/api/calibration/latest', { params: { machine, die } })
      .then((r) => r.data),

  getRanges: (
    machine: string,
    die: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CalibrationRangesResponse> =>
    axiosInstance
      .get<CalibrationRangesResponse>('/api/calibration/ranges', {
        params: {
          machine,
          die,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
        timeout: 300000 // Adjusted to 5 minutes to take into account large samples of historical data and network latency
      })
      .then((r) => r.data),

  apply: (
    machine: string,
    die: string,
    payload: CalibrationPayload,
    samplesAnalyzed: number,
  ): Promise<CalibrationApplyResponse> =>
    axiosInstance
      .post<CalibrationApplyResponse>('/api/calibration/apply', payload, {
        params: { machine, die, samples_analyzed: samplesAnalyzed },
      })
      .then((r) => r.data),

  runWorkflow: (): Promise<{ message?: string; status?: string }> =>
    axiosInstance.get('/api/calibrator/run').then((r) => r.data),
};
