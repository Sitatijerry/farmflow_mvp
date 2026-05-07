import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Farms table - represents a farm managed by users
 */
export const farms = mysqlTable("farms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  ownerId: int("ownerId").notNull(),
  totalArea: decimal("totalArea", { precision: 10, scale: 2 }), // in hectares
  cropType: varchar("cropType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Farm = typeof farms.$inferSelect;
export type InsertFarm = typeof farms.$inferInsert;

/**
 * Fields table - represents individual fields within a farm
 */
export const fields = mysqlTable("fields", {
  id: varchar("id", { length: 36 }).primaryKey(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  area: decimal("area", { precision: 10, scale: 2 }), // in hectares
  cropType: varchar("cropType", { length: 100 }),
  plantedDate: timestamp("plantedDate"),
  expectedHarvestDate: timestamp("expectedHarvestDate"),
  growthStage: varchar("growthStage", { length: 50 }), // e.g., "seedling", "vegetative", "flowering", "maturity"
  waterStressIndex: decimal("waterStressIndex", { precision: 5, scale: 2 }), // 0-100
  pestRiskLevel: mysqlEnum("pestRiskLevel", ["low", "medium", "high"]).default("low"),
  soilMoisture: decimal("soilMoisture", { precision: 5, scale: 2 }), // percentage
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // celsius
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Field = typeof fields.$inferSelect;
export type InsertField = typeof fields.$inferInsert;

/**
 * Worker tasks table - represents tasks assigned to workers
 */
export const workerTasks = mysqlTable("workerTasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  fieldId: varchar("fieldId", { length: 36 }).notNull(),
  workerId: int("workerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  taskType: mysqlEnum("taskType", [
    "irrigate",
    "fertilize",
    "scout",
    "harvest",
    "weeding",
    "pesticide",
    "other",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue"]).default("pending"),
  urgency: mysqlEnum("urgency", ["low", "medium", "high"]).default("medium"),
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  proofImageUrl: varchar("proofImageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkerTask = typeof workerTasks.$inferSelect;
export type InsertWorkerTask = typeof workerTasks.$inferInsert;

/**
 * Recommendations table - stores AI-generated recommendations
 */
export const recommendations = mysqlTable("recommendations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  fieldId: varchar("fieldId", { length: 36 }).notNull(),
  action: mysqlEnum("action", [
    "irrigate",
    "block_fertiliser",
    "scout_field",
    "prepare_harvest",
    "apply_pesticide",
    "reduce_irrigation",
    "increase_nitrogen",
    "monitor_pest",
  ]).notNull(),
  urgency: mysqlEnum("urgency", ["low", "medium", "high"]).default("medium"),
  rationale: text("rationale"),
  status: mysqlEnum("status", ["pending", "acknowledged", "completed"]).default("pending"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  completedAt: timestamp("completedAt"),
  source: varchar("source", { length: 100 }), // e.g., "fastapi_intelligence_layer"
  metadata: json("metadata"), // Additional data from AI layer
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Field uploads table - stores field observation photos
 */
export const fieldUploads = mysqlTable("fieldUploads", {
  id: varchar("id", { length: 36 }).primaryKey(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  fieldId: varchar("fieldId", { length: 36 }).notNull(),
  workerId: int("workerId").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  imageType: mysqlEnum("imageType", ["soil", "crop", "pest", "irrigation", "general"]).default("general"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  notes: text("notes"),
  storageKey: varchar("storageKey", { length: 500 }), // S3 key
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FieldUpload = typeof fieldUploads.$inferSelect;
export type InsertFieldUpload = typeof fieldUploads.$inferInsert;

/**
 * Weather data table - stores weather forecasts per farm
 */
export const weatherData = mysqlTable("weatherData", {
  id: varchar("id", { length: 36 }).primaryKey(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  fieldId: varchar("fieldId", { length: 36 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  rainfall: decimal("rainfall", { precision: 5, scale: 2 }), // mm
  windSpeed: decimal("windSpeed", { precision: 5, scale: 2 }), // km/h
  condition: varchar("condition", { length: 50 }), // e.g., "sunny", "rainy", "cloudy"
  forecastDate: timestamp("forecastDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = typeof weatherData.$inferInsert;

/**
 * Notifications table - stores notifications for farm managers
 */
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["recommendation", "task_completed", "alert", "info"]).default("info"),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Worker assignments table - maps workers to farms and fields
 */
export const workerAssignments = mysqlTable("workerAssignments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workerId: int("workerId").notNull(),
  farmId: varchar("farmId", { length: 36 }).notNull(),
  fieldId: varchar("fieldId", { length: 36 }),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  unassignedAt: timestamp("unassignedAt"),
});

export type WorkerAssignment = typeof workerAssignments.$inferSelect;
export type InsertWorkerAssignment = typeof workerAssignments.$inferInsert;
