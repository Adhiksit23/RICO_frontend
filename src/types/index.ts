// ─── Auth Types ──────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'plant_admin' | 'user';
  plant_id: string | null;
  plant_name: string | null;
  is_active: boolean;
  created_at: string;
  created_by?: number | null;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message: string;
}


export interface InviteResponse {
  invite_url: string;
  token: string;
  expires_at: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  plant_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterViaInvitePayload {
  token: string;
  email: string;
  password: string;
  full_name: string;
}

export interface InvitePayload {
  email?: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────
export interface DashboardSummary {
  total_parts: number;
  defective_parts: number;
  defect_rate: number;
  period_label?: string;
  subtitle_period?: string;
  subtitle_defects?: string;
}

export interface DashboardFilterOption {
  label: string;
  value: string;
}

export interface DashboardFiltersMetadata {
  clients: string[];
  machines: string[];
  dies: string[];
  periods: DashboardFilterOption[];
}

export interface DefectBreakdownRow {
  name: string;
  count: number;
  formatted_count: string;
  percent: string;
  rate: string;
  color: string;
  hex: string;
  width: string;
}

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStatsResponse {
  summary: DashboardSummary;
  defects_breakdown: DefectBreakdownRow[];
  chart_data: ChartSlice[];
}

export interface DashboardFilterParams {
  client?: string;
  machine?: string;
  die?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
}

export interface DefectComparisonRow {
  category: string;
  p1_count: number;
  p1_rate: number;
  p2_count: number;
  p2_rate: number;
  count_diff: number;
  rate_diff: number;
  relative_change: number;
  status: 'improved' | 'degraded' | 'unchanged';
}

export interface PeriodCompareParams {
  client?: string;
  machine?: string;
  die?: string;
  p1_period?: string;
  p1_start?: string;
  p1_end?: string;
  p2_period?: string;
  p2_start?: string;
  p2_end?: string;
}

export interface PeriodCompareResponse {
  period_1: DashboardSummary;
  period_2: DashboardSummary;
  delta: {
    rate_diff: number;
    relative_change: number;
    total_parts_diff: number;
    defective_diff: number;
    status: 'improved' | 'degraded' | 'unchanged';
    status_text: string;
  };
  defect_comparison: DefectComparisonRow[];
}

export interface LongitudinalPoint {
  date: string;
  label: string;
  total_parts: number;
  defective_parts: number;
  defect_rate: number;
  defects: Record<string, number>;
  [key: string]: string | number | Record<string, number>;
}

export interface LongitudinalParams {
  client?: string;
  machine?: string;
  die?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
  interval?: 'day' | 'week' | 'month';
}

export interface LongitudinalResponse {
  interval: 'day' | 'week' | 'month';
  period_label: string;
  categories: string[];
  timeline: LongitudinalPoint[];
  total_buckets: number;
}

// ─── Monitor / Predictor Types ────────────────────────────────────────
export interface PredictionData {
  blowhole: number;
  crack: number;
  non_filling: number;
  porosity: number;
  shrinkage: number;
  chipoff: number;
}

export interface ParameterReading {
  part_id: string;
  timestamp: string;
  [key: string]: string | number;
}

export interface CalibrationRange {
  baseline: number;
  lower_tolerance: number;
  upper_tolerance: number;
}

export type MonitorResponse = [ParameterReading, Record<string, CalibrationRange>];

// ─── Calibration Types ───────────────────────────────────────────────
export interface RangeData {
  baseline: number;
  tolerance: number;
  min_range: number;
  max_range: number;
  unit?: string;
}

export interface CalibrationRangesResponse {
  ranges: Record<string, RangeData>;
  samples_analyzed: number;
}

export interface CalibrationLatestItem {
  baseline: number;
  min_range: number;
  max_range: number;
}

export type CalibrationLatestResponse = Record<string, CalibrationLatestItem>;
export type CalibrationPayload = Record<string, RangeData>;

export interface CalibrationApplyResponse {
  message: string;
}

// ─── Common Types ────────────────────────────────────────────────────
export type RiskLevel = 'LOW' | 'MED' | 'HIGH';
export type StatusType = 'OK' | 'FAIL';
export type UserRole = 'plant_admin' | 'user';

export const DIE_OPTIONS = ['S14', 'S16', 'S17', "S18"] as const;
export const MACHINE_OPTIONS = ['UBE 850T-1', 'UBE 850T-2', 'UBE 850T-3'] as const;
export type Die = typeof DIE_OPTIONS[number];
export type Machine = typeof MACHINE_OPTIONS[number];
