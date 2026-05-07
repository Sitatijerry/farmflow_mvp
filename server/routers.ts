import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";
import {
  farms,
  fields,
  workerTasks,
  recommendations,
  fieldUploads,
  weatherData,
  notifications,
  workerAssignments,
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================
  // Farm Procedures
  // ============================================================
  farm: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(farms).where(eq(farms.ownerId, ctx.user.id));
      return result;
    }),

    getById: protectedProcedure
      .input(z.object({ farmId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db
          .select()
          .from(farms)
          .where(and(eq(farms.id, input.farmId), eq(farms.ownerId, ctx.user.id)))
          .limit(1);
        return result[0] || null;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          location: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          totalArea: z.number().optional(),
          cropType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const farmId = nanoid();
        await db.insert(farms).values({
          id: farmId,
          name: input.name,
          location: input.location,
          latitude: input.latitude ? String(input.latitude) : undefined,
          longitude: input.longitude ? String(input.longitude) : undefined,
          totalArea: input.totalArea ? String(input.totalArea) : undefined,
          cropType: input.cropType,
          ownerId: ctx.user.id,
        });

        return { id: farmId, ...input };
      }),

    update: protectedProcedure
      .input(
        z.object({
          farmId: z.string(),
          name: z.string().optional(),
          location: z.string().optional(),
          cropType: z.string().optional(),
          totalArea: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, unknown> = {};
        if (input.name) updateData.name = input.name;
        if (input.location) updateData.location = input.location;
        if (input.cropType) updateData.cropType = input.cropType;
        if (input.totalArea) updateData.totalArea = String(input.totalArea);

        await db
          .update(farms)
          .set(updateData)
          .where(and(eq(farms.id, input.farmId), eq(farms.ownerId, ctx.user.id)));

        return { success: true };
      }),
  }),

  // ============================================================
  // Field Procedures
  // ============================================================
  field: router({
    listByFarm: protectedProcedure
      .input(z.object({ farmId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db.select().from(fields).where(eq(fields.farmId, input.farmId));
        return result;
      }),

    getById: protectedProcedure
      .input(z.object({ fieldId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(fields).where(eq(fields.id, input.fieldId)).limit(1);
        return result[0] || null;
      }),

    create: protectedProcedure
      .input(
        z.object({
          farmId: z.string(),
          name: z.string(),
          area: z.number().optional(),
          cropType: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const fieldId = nanoid();
        await db.insert(fields).values({
          id: fieldId,
          farmId: input.farmId,
          name: input.name,
          area: input.area ? String(input.area) : undefined,
          cropType: input.cropType,
          latitude: input.latitude ? String(input.latitude) : undefined,
          longitude: input.longitude ? String(input.longitude) : undefined,
          growthStage: "seedling",
          pestRiskLevel: "low",
        });

        return { id: fieldId, ...input };
      }),

    update: protectedProcedure
      .input(
        z.object({
          fieldId: z.string(),
          growthStage: z.string().optional(),
          waterStressIndex: z.number().optional(),
          pestRiskLevel: z.enum(["low", "medium", "high"]).optional(),
          soilMoisture: z.number().optional(),
          temperature: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, unknown> = {};
        if (input.growthStage) updateData.growthStage = input.growthStage;
        if (input.waterStressIndex !== undefined) updateData.waterStressIndex = String(input.waterStressIndex);
        if (input.pestRiskLevel) updateData.pestRiskLevel = input.pestRiskLevel;
        if (input.soilMoisture !== undefined) updateData.soilMoisture = String(input.soilMoisture);
        if (input.temperature !== undefined) updateData.temperature = String(input.temperature);

        await db.update(fields).set(updateData).where(eq(fields.id, input.fieldId));

        return { success: true };
      }),
  }),

  // ============================================================
  // Worker Task Procedures
  // ============================================================
  task: router({
    listByFarm: protectedProcedure
      .input(z.object({ farmId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(workerTasks)
          .where(eq(workerTasks.farmId, input.farmId))
          .orderBy(desc(workerTasks.dueAt));
        return result;
      }),

    listByWorker: protectedProcedure
      .input(z.object({ workerId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(workerTasks)
          .where(eq(workerTasks.workerId, input.workerId))
          .orderBy(desc(workerTasks.dueAt));
        return result;
      }),

    create: protectedProcedure
      .input(
        z.object({
          farmId: z.string(),
          fieldId: z.string(),
          workerId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          taskType: z.enum(["irrigate", "fertilize", "scout", "harvest", "weeding", "pesticide", "other"]),
          urgency: z.enum(["low", "medium", "high"]).optional(),
          dueAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const taskId = nanoid();
        await db.insert(workerTasks).values({
          id: taskId,
          farmId: input.farmId,
          fieldId: input.fieldId,
          workerId: input.workerId,
          title: input.title,
          description: input.description,
          taskType: input.taskType,
          urgency: input.urgency || "medium",
          dueAt: input.dueAt,
          status: "pending",
        });

        return { id: taskId, ...input };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ taskId: z.string(), status: z.enum(["pending", "in_progress", "completed", "overdue"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, unknown> = { status: input.status };
        if (input.status === "completed") {
          updateData.completedAt = new Date();
        }

        await db.update(workerTasks).set(updateData).where(eq(workerTasks.id, input.taskId));

        return { success: true };
      }),

    addNotes: protectedProcedure
      .input(z.object({ taskId: z.string(), notes: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(workerTasks).set({ notes: input.notes }).where(eq(workerTasks.id, input.taskId));

        return { success: true };
      }),
  }),

  // ============================================================
  // Recommendation Procedures
  // ============================================================
  recommendation: router({
    listByFarm: protectedProcedure
      .input(z.object({ farmId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(recommendations)
          .where(eq(recommendations.farmId, input.farmId))
          .orderBy(desc(recommendations.createdAt));
        return result;
      }),

    listByField: protectedProcedure
      .input(z.object({ fieldId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(recommendations)
          .where(eq(recommendations.fieldId, input.fieldId))
          .orderBy(desc(recommendations.createdAt));
        return result;
      }),

    create: protectedProcedure
      .input(
        z.object({
          farmId: z.string(),
          fieldId: z.string(),
          action: z.enum([
            "irrigate",
            "block_fertiliser",
            "scout_field",
            "prepare_harvest",
            "apply_pesticide",
            "reduce_irrigation",
            "increase_nitrogen",
            "monitor_pest",
          ]),
          urgency: z.enum(["low", "medium", "high"]),
          rationale: z.string(),
          source: z.string().optional(),
          metadata: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const recId = nanoid();
        await db.insert(recommendations).values({
          id: recId,
          farmId: input.farmId,
          fieldId: input.fieldId,
          action: input.action,
          urgency: input.urgency,
          rationale: input.rationale,
          source: input.source || "system",
          metadata: input.metadata,
          status: "pending",
        });

        return { id: recId, ...input };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ recId: z.string(), status: z.enum(["pending", "acknowledged", "completed"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, unknown> = { status: input.status };
        if (input.status === "acknowledged") {
          updateData.acknowledgedAt = new Date();
        } else if (input.status === "completed") {
          updateData.completedAt = new Date();
        }

        await db.update(recommendations).set(updateData).where(eq(recommendations.id, input.recId));

        return { success: true };
      }),
  }),

  // ============================================================
  // Image Upload Procedures
  // ============================================================
  upload: router({
    listByField: protectedProcedure
      .input(z.object({ fieldId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(fieldUploads)
          .where(eq(fieldUploads.fieldId, input.fieldId))
          .orderBy(desc(fieldUploads.createdAt));
        return result;
      }),

    create: protectedProcedure
      .input(
        z.object({
          farmId: z.string(),
          fieldId: z.string(),
          workerId: z.number(),
          imageUrl: z.string(),
          imageType: z.enum(["soil", "crop", "pest", "irrigation", "general"]),
          storageKey: z.string(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const uploadId = nanoid();
        await db.insert(fieldUploads).values({
          id: uploadId,
          farmId: input.farmId,
          fieldId: input.fieldId,
          workerId: input.workerId,
          imageUrl: input.imageUrl,
          imageType: input.imageType,
          storageKey: input.storageKey,
          latitude: input.latitude ? String(input.latitude) : undefined,
          longitude: input.longitude ? String(input.longitude) : undefined,
          notes: input.notes,
        });

        return { id: uploadId, ...input };
      }),
  }),

  // ============================================================
  // Weather Procedures
  // ============================================================
  weather: router({
    getLatestByFarm: protectedProcedure
      .input(z.object({ farmId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db
          .select()
          .from(weatherData)
          .where(eq(weatherData.farmId, input.farmId))
          .orderBy(desc(weatherData.createdAt))
          .limit(1);
        return result[0] || null;
      }),

    getForecast: protectedProcedure
      .input(z.object({ farmId: z.string(), days: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(weatherData)
          .where(eq(weatherData.farmId, input.farmId))
          .orderBy(desc(weatherData.forecastDate))
          .limit(input.days || 3);
        return result;
      }),
  }),

  // ============================================================
  // Notification Procedures
  // ============================================================
  notification: router({
    listByUser: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt));
      return result;
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(notifications).set({ read: true }).where(eq(notifications.id, input.notificationId));

        return { success: true };
      }),
  }),

  // ============================================================
  // Worker Assignment Procedures
  // ============================================================
  assignment: router({
    listByWorker: protectedProcedure
      .input(z.object({ workerId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const result = await db
          .select()
          .from(workerAssignments)
          .where(eq(workerAssignments.workerId, input.workerId));
        return result;
      }),

    create: protectedProcedure
      .input(z.object({ workerId: z.number(), farmId: z.string(), fieldId: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const assignmentId = nanoid();
        await db.insert(workerAssignments).values({
          id: assignmentId,
          workerId: input.workerId,
          farmId: input.farmId,
          fieldId: input.fieldId,
        });

        return { id: assignmentId, ...input };
      }),
  }),
});

export type AppRouter = typeof appRouter;
