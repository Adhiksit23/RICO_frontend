import axiosInstance from "@/lib/axios";
import type { ReportPreviewResponse, PartDossierResult, HourlyMismatchRecord } from "@/types";

export interface ReportQueryParams {
  client?: string;
  machine?: string;
  die?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export const ReportService = {
  /**
   * Fetch tabular report preview data for the 4 sheets:
   * 1. Prescription history
   * 2. Predicted vs Actual (Defects)
   * 3. Prediction Accuracy
   * 4. Hourly Parameter Mismatches
   */
  getPreview: (params?: ReportQueryParams): Promise<ReportPreviewResponse> =>
    axiosInstance
      .get<ReportPreviewResponse>("/api/reports/preview", { params })
      .then((r) => r.data),

  /**
   * Global lookup of a specific part across the entire database
   */
  lookupPart: (query: string): Promise<PartDossierResult> =>
    axiosInstance
      .get<PartDossierResult>("/api/reports/part-lookup", { params: { query } })
      .then((r) => r.data),

  /**
   * Fetch time-stamped hourly aggregated report of parameter mismatches
   */
  getHourlyMismatches: (params?: ReportQueryParams): Promise<HourlyMismatchRecord[]> =>
    axiosInstance
      .get<HourlyMismatchRecord[]>("/api/reports/mismatched-parameters/hourly", { params })
      .then((r) => r.data),

  /**
   * Download the multi-sheet Excel report (.xlsx)
   */
  downloadExcel: async (params?: ReportQueryParams, filename?: string): Promise<void> => {
    const response = await axiosInstance.get("/api/reports/export", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download =
      filename || `RICO_Quality_Report_${params?.die || "All"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
  },
};

