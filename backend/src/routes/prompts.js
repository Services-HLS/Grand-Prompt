import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const createPromptSchema = z.object({
  stage: z.string().min(1),
  steps: z.string().min(1),
  question: z.string().min(1),
  promptText: z.string().min(10),
  category: z.string().min(1).optional(),
});

const updatePromptSchema = z.object({
  stage: z.string().min(1).optional(),
  steps: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
  promptText: z.string().min(10).optional(),
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

router.get("/", async (req, res) => {
  const { status, category, stage, search } = req.query;

  const prompts = await prisma.prompt.findMany({
    where: {
      ...(status ? { status: String(status).toUpperCase() } : {}),
      ...(category ? { category: String(category) } : {}),
      ...(stage ? { stage: String(stage) } : {}),
      ...(search
        ? {
            promptText: {
              contains: String(search),
              mode: "insensitive",
            },
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

  const response = prompts.map((prompt) => {
    const likes = prompt.reactions.filter((reaction) => reaction.value === "LIKE").length;
    const dislikes = prompt.reactions.filter((reaction) => reaction.value === "DISLIKE").length;

    return {
      ...prompt,
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

  const prompt = await prisma.prompt.create({
    data: {
      ...parsed.data,
      category: parsed.data.category ?? "grant",
      createdById: req.user.id,
    },
  });

  return res.status(201).json(prompt);
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

  const updated = await prisma.prompt.update({
    where: { id },
    data: parsed.data,
  });

  return res.json(updated);
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
