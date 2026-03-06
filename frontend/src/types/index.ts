// ─── Auth & User ────────────────────────────────────────────────────────────

export type UserRole = 'HR' | 'Manager' | 'Employee';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Backend returns exactly: { token, user: { id, name, email, role, employeeId } }
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  attendancePercentage: number;
  kpiScore: number;
  salesAchievementPercentage: number;
  peerRating: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Appraisal ───────────────────────────────────────────────────────────────

export type SentimentCategory = 'Positive' | 'Neutral' | 'Negative';
export type PerformanceCategory = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';

// Shape returned by GET /api/employee/my-report
export interface AppraisalReport {
  employee: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    department: string;
  };
  kpiScore: number;
  attendancePercentage: number;
  managerRating: number;
  managerFeedback: string;
  sentimentCategory: SentimentCategory;
  sentimentScore: number;
  finalScore: number;
  performanceCategory: PerformanceCategory;
  biasFlag: boolean;
  manager: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

// Full Appraisal document (populated) — used by analytics endpoints
// getTopPerformers and getBiasCases return full Appraisal docs with populated fields
export interface PopulatedAppraisal {
  _id: string;
  employee: Employee | null;
  manager: { _id: string; name: string; email: string } | null;
  managerRating: number;
  managerFeedback: string;
  sentimentScore: number;
  sentimentCategory: SentimentCategory;
  biasFlag: boolean;
  kpiScore: number;
  attendancePercentage: number;
  peerRating: number;
  salesAchievementPercentage: number;
  finalScore: number;
  performanceCategory: PerformanceCategory;
  createdAt: string;
}

export interface CreateAppraisalPayload {
  employeeId: string;
  managerRating: number;
  managerFeedback: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DepartmentPerformance {
  department: string;
  averageFinalScore: number;
  count: number;
}

// getOverallAverageSentiment returns ONLY { averageSentimentScore, count }
// There is NO per-category breakdown in the backend
export interface SentimentStats {
  averageSentimentScore: number;
  count: number;
}

// ─── Upload Summary ───────────────────────────────────────────────────────────
// Exact shape from hrService.js uploadEmployeesFromExcel:
// { processed, success, failed, errors: [{row, message}][], generatedAccounts?: [...] }
export interface UploadError {
  row: number;
  message: string;
}

export interface GeneratedAccount {
  name: string;
  email: string;
  generatedPassword: string;
}

export interface UploadSummary {
  processed: number;
  success: number;
  failed: number;
  errors: UploadError[];
  generatedAccounts?: GeneratedAccount[];
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
}

