import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const createPromptSchema = z.object({
  stage: z.string().min(1),
  steps: z.string().min(1),
  question: z.string().min(1),
  promptText: z.string().min(10),
  additionalInput: z.string().optional(),
  category: z.string().min(1).optional(),
});

const updatePromptSchema = z.object({
  stage: z.string().min(1).optional(),
  steps: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
  promptText: z.string().min(10).optional(),
  additionalInput: z.string().nullable().optional(),
  category: z.string().min(1).optional(),
});

const rejectSchema = z.object({
  reason: z.string().min(3),
});

const reactionSchema = z.object({
  value: z.enum(["LIKE", "DISLIKE"]),
});

const feedbackSchema = z.object({
  feedback: z.string().min(2).max(2000),
});

const archiveManySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
});

router.post("/archive", requireAuth, requireRole("MODERATOR", "ADMIN"), async (req, res) => {
  const parsed = archiveManySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const uniqueIds = [...new Set(parsed.data.ids)];

  try {
    const archivedIds = await prisma.$transaction(async (tx) => {
      const done = [];
      for (const id of uniqueIds) {
        const p = await tx.prompt.findUnique({ where: { id } });
        if (!p) {
          throw new Error(`Prompt ${id} not found`);
        }
        await tx.archivedPrompt.create({
          data: {
            originalPromptId: p.id,
            stage: p.stage,
            steps: p.steps,
            question: p.question,
            promptText: p.promptText,
            additionalInput: p.additionalInput,
            category: p.category,
            status: p.status,
            rejectionReason: p.rejectionReason,
            submittedAt: p.submittedAt,
            approvedAt: p.approvedAt,
            approvedBy: p.approvedBy,
            createdById: p.createdById,
            archivedById: req.user.id,
          },
        });
        await tx.prompt.delete({ where: { id } });
        done.push(id);
      }
      return done;
    });
    return res.json({ archivedIds });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Archive failed";
    return res.status(400).json({ message });
  }
});

router.get("/archived", requireAuth, requireRole("MODERATOR", "ADMIN"), async (_req, res) => {
  const rows = await prisma.archivedPrompt.findMany({
    orderBy: { archivedAt: "desc" },
  });
  const userIds = [
    ...new Set(
      rows.flatMap((r) => [r.createdById, r.archivedById, r.approvedBy].filter((id) => id != null)),
    ),
  ].map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  const response = rows.map((r) => {
    const author = userById.get(r.createdById);
    const archiver = r.archivedById != null ? userById.get(r.archivedById) : null;
    const aid = r.approvedBy != null ? Number(r.approvedBy) : NaN;
    const approver = Number.isFinite(aid) && aid > 0 ? userById.get(aid) : null;
    return {
      ...r,
      createdByDisplay: author?.name?.trim() || author?.email || "Unknown",
      archivedByDisplay: archiver ? archiver.name?.trim() || archiver.email : null,
      approvedByDisplay: approver?.name?.trim() || approver?.email || null,
    };
  });
  return res.json(response);
});

const restoreArchivedManySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
});

router.post("/archived/restore", requireAuth, requireRole("MODERATOR", "ADMIN"), async (req, res) => {
  const parsed = restoreArchivedManySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const uniqueIds = [...new Set(parsed.data.ids)];

  try {
    const restoredIds = await prisma.$transaction(async (tx) => {
      const done = [];
      for (const archiveId of uniqueIds) {
        const a = await tx.archivedPrompt.findUnique({ where: { id: archiveId } });
        if (!a) {
          throw new Error(`Archived prompt ${archiveId} not found`);
        }
        await tx.prompt.create({
          data: {
            stage: a.stage,
            steps: a.steps,
            question: a.question,
            promptText: a.promptText,
            additionalInput: a.additionalInput,
            category: a.category,
            status: a.status,
            rejectionReason: a.rejectionReason,
            submittedAt: a.submittedAt,
            approvedAt: a.approvedAt,
            approvedBy: a.approvedBy,
            createdById: a.createdById,
          },
        });
        await tx.archivedPrompt.delete({ where: { id: archiveId } });
        done.push(archiveId);
      }
      return done;
    });
    return res.json({ restoredIds });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Restore failed";
    return res.status(400).json({ message });
  }
});

router.post(
  "/archived/:archiveId/restore",
  requireAuth,
  requireRole("MODERATOR", "ADMIN"),
  async (req, res) => {
    const archiveId = Number(req.params.archiveId);
    if (!Number.isFinite(archiveId)) {
      return res.status(400).json({ message: "Invalid archive id" });
    }

    try {
      const prompt = await prisma.$transaction(async (tx) => {
        const a = await tx.archivedPrompt.findUnique({ where: { id: archiveId } });
        if (!a) {
          throw new Error("Archived prompt not found");
        }
        const created = await tx.prompt.create({
          data: {
            stage: a.stage,
            steps: a.steps,
            question: a.question,
            promptText: a.promptText,
            additionalInput: a.additionalInput,
            category: a.category,
            status: a.status,
            rejectionReason: a.rejectionReason,
            submittedAt: a.submittedAt,
            approvedAt: a.approvedAt,
            approvedBy: a.approvedBy,
            createdById: a.createdById,
          },
        });
        await tx.archivedPrompt.delete({ where: { id: archiveId } });
        return created;
      });

      const createdBy = await prisma.user.findUnique({
        where: { id: prompt.createdById },
        select: { id: true, name: true, email: true },
      });

      return res.status(201).json({
        ...prompt,
        createdBy: createdBy ?? { id: prompt.createdById, name: "Unknown", email: "" },
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Restore failed";
      const status = message === "Archived prompt not found" ? 404 : 400;
      return res.status(status).json({ message });
    }
  },
);

router.get("/", async (req, res) => {
  const { status, category, stage, search } = req.query;

  const prompts = await prisma.prompt.findMany({
    where: {
      ...(status ? { status: String(status).toUpperCase() } : {}),
      ...(category ? { category: String(category) } : {}),
      ...(stage ? { stage: String(stage) } : {}),
      ...(search
        ? {
            OR: [
              {
                promptText: {
                  contains: String(search),
                  mode: "insensitive",
                },
              },
              {
                additionalInput: {
                  contains: String(search),
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      feedbacks: {
        select: { id: true },
      },
      reactions: {
        select: { value: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const approverIdNums = [
    ...new Set(
      prompts
        .map((p) => p.approvedBy)
        .filter((id) => id != null)
        .map((id) => Number(id)),
    ),
  ].filter((n) => Number.isFinite(n) && n > 0);

  const approvers =
    approverIdNums.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: approverIdNums } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const approverById = new Map(approvers.map((u) => [Number(u.id), u]));

  const response = prompts.map((prompt) => {
    const likes = prompt.reactions.filter((reaction) => reaction.value === "LIKE").length;
    const dislikes = prompt.reactions.filter((reaction) => reaction.value === "DISLIKE").length;
    const aid = prompt.approvedBy != null ? Number(prompt.approvedBy) : NaN;
    const approver = Number.isFinite(aid) && aid > 0 ? approverById.get(aid) ?? null : null;

    return {
      ...prompt,
      approver,
      approvedByDisplay: approver?.name ?? approver?.email ?? null,
      likes,
      dislikes,
      feedbackCount: prompt.feedbacks.length,
      feedbacks: undefined,
      reactions: undefined,
    };
  });

  return res.json(response);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createPromptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  try {
    const d = parsed.data;
    const prompt = await prisma.prompt.create({
      data: {
        stage: d.stage,
        steps: d.steps,
        question: d.question,
        promptText: d.promptText,
        category: d.category ?? "grant",
        createdById: req.user.id,
        ...(d.additionalInput?.trim() ? { additionalInput: d.additionalInput } : {}),
      },
    });
    return res.status(201).json(prompt);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2000") {
      return res.status(413).json({
        message:
          "Prompt text (or another field) is too long for the current database column. Widen `promptText`, `additionalInput`, or `question` in MariaDB, then restart the API.",
        meta: err.meta,
      });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to create prompt" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid prompt id" });

  const parsed = updatePromptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) return res.status(404).json({ message: "Prompt not found" });

  const isOwner = prompt.createdById === req.user.id;
  const isModerator = req.user.role === "MODERATOR" || req.user.role === "ADMIN";
  if (!isOwner && !isModerator) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const updated = await prisma.prompt.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2000") {
      return res.status(413).json({
        message: "Updated text is too long for the current database column. Widen `promptText` / `question` in MariaDB.",
        meta: err.meta,
      });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to update prompt" });
  }
});

router.post("/:id/approve", requireAuth, requireRole("MODERATOR", "ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid prompt id" });

  const updated = await prisma.prompt.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: req.user.id,
      rejectionReason: null,
    },
  });

  return res.json(updated);
});

router.post("/:id/reject", requireAuth, requireRole("MODERATOR", "ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid prompt id" });

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const updated = await prisma.prompt.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: parsed.data.reason,
      approvedAt: new Date(),
      approvedBy: req.user.id,
    },
  });

  return res.json(updated);
});

router.post("/:id/reaction", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid prompt id" });

  const parsed = reactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const existing = await prisma.reaction.findUnique({
    where: { promptId_userId: { promptId: id, userId: req.user.id } },
  });

  if (!existing) {
    await prisma.reaction.create({
      data: { promptId: id, userId: req.user.id, value: parsed.data.value },
    });
  } else if (existing.value === parsed.data.value) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.update({
      where: { id: existing.id },
      data: { value: parsed.data.value },
    });
  }

  const [likes, dislikes] = await Promise.all([
    prisma.reaction.count({ where: { promptId: id, value: "LIKE" } }),
    prisma.reaction.count({ where: { promptId: id, value: "DISLIKE" } }),
  ]);

  return res.json({ promptId: id, likes, dislikes });
});

router.get("/:id/feedback", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid prompt id" });

  const rows = await prisma.feedback.findMany({
    where: { promptId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return res.json(rows);
});

router.post("/:id/feedback", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid prompt id" });

  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const feedback = await prisma.feedback.create({
    data: {
      promptId: id,
      userId: req.user.id,
      feedback: parsed.data.feedback,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return res.status(201).json(feedback);
});

export default router;
