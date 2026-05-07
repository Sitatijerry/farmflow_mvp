/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ============================================================
// FarmFlow Domain Types
// ============================================================

// Farm Types
export interface FarmOverview {
  id: string;
  name: string;
  location: string;
  totalArea: number;
  cropType: string;
  fieldCount: number;
  activeTaskCount: number;
  pendingRecommendationCount: number;
}

// Field Types
export interface FieldData {
  id: string;
  farmId: string;
  name: string;
  area: number;
  cropType: string;
  plantedDate: Date | null;
  expectedHarvestDate: Date | null;
  growthStage: string;
  waterStressIndex: number;
  pestRiskLevel: "low" | "medium" | "high";
  soilMoisture: number;
  temperature: number;
  latitude: number;
  longitude: number;
  daysToMaturity?: number;
}

// Task Types
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskUrgency = "low" | "medium" | "high";
export type TaskType = "irrigate" | "fertilize" | "scout" | "harvest" | "weeding" | "pesticide" | "other";

export interface WorkerTaskData {
  id: string;
  farmId: string;
  fieldId: string;
  workerId: number;
  title: string;
  description: string | null;
  taskType: TaskType;
  status: TaskStatus;
  urgency: TaskUrgency;
  dueAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  proofImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Recommendation Types
export type RecommendationAction =
  | "irrigate"
  | "block_fertiliser"
  | "scout_field"
  | "prepare_harvest"
  | "apply_pesticide"
  | "reduce_irrigation"
  | "increase_nitrogen"
  | "monitor_pest";

export type RecommendationStatus = "pending" | "acknowledged" | "completed";

export interface RecommendationData {
  id: string;
  farmId: string;
  fieldId: string;
  action: RecommendationAction;
  urgency: TaskUrgency;
  rationale: string;
  status: RecommendationStatus;
  acknowledgedAt: Date | null;
  completedAt: Date | null;
  source: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Image Upload Types
export type ImageType = "soil" | "crop" | "pest" | "irrigation" | "general";

export interface FieldUploadData {
  id: string;
  farmId: string;
  fieldId: string;
  workerId: number;
  imageUrl: string;
  imageType: ImageType;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  storageKey: string;
  createdAt: Date;
}

// Weather Types
export interface WeatherDataPoint {
  id: string;
  farmId: string;
  fieldId: string | null;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  forecastDate: Date;
  createdAt: Date;
}

export interface WeatherForecast {
  current: WeatherDataPoint;
  next72h: WeatherDataPoint[];
}

// Notification Types
export type NotificationType = "recommendation" | "task_completed" | "alert" | "info";

export interface NotificationData {
  id: string;
  userId: number;
  farmId: string;
  title: string;
  content: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

// Worker Assignment Types
export interface WorkerAssignmentData {
  id: string;
  workerId: number;
  farmId: string;
  fieldId: string | null;
  assignedAt: Date;
  unassignedAt: Date | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Offline Sync Types
export interface OfflineSyncItem {
  id: string;
  type: "task_update" | "image_upload" | "recommendation_ack";
  data: unknown;
  timestamp: number;
  retries: number;
  status: "pending" | "synced" | "failed";
}

// FastAPI Intelligence Layer Types
export interface AIRecommendationRequest {
  farmId: string;
  fieldId: string;
  currentData: FieldData;
  weatherData: WeatherDataPoint;
  historicalData?: unknown;
}

export interface AIRecommendationResponse {
  action: RecommendationAction;
  urgency: TaskUrgency;
  rationale: string;
  confidence: number;
  metadata: Record<string, unknown>;
}

// Dashboard Types
export interface DashboardStats {
  totalFields: number;
  activeRecommendations: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  workerCount: number;
}

export interface FieldSummary extends FieldData {
  activeRecommendations: RecommendationData[];
  activeTasks: WorkerTaskData[];
  recentUploads: FieldUploadData[];
  weatherForecast: WeatherForecast;
}
