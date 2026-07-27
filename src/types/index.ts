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

export const DIE_OPTIONS = ['S14', 'S16', 'S17'] as const;
export const MACHINE_OPTIONS = ['UBE 850T-1', 'UBE 850T-2', 'UBE 850T-3'] as const;
export type Die = typeof DIE_OPTIONS[number];
export type Machine = typeof MACHINE_OPTIONS[number];
