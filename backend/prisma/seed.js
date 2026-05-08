import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const promptCount = await prisma.prompt.count();

  if (userCount > 0 || promptCount > 0) {
    console.log("Seed skipped: data already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash("Password@123", 10);

  const [admin, moderator, user1, user2] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Moderator One",
        email: "moderator@example.com",
        passwordHash,
        role: "MODERATOR",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jonny Lo",
        email: "jonny@example.com",
        passwordHash,
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Karthika Kumar",
        email: "karthika@example.com",
        passwordHash,
        role: "USER",
      },
    }),
  ]);

  const prompt1 = await prisma.prompt.create({
    data: {
      stage: "1. Idea development",
      steps: "Opportunity identification",
      question: "Is there an opportunity worth pursuing?",
      promptText:
        "<p><strong>Act as a grant mentor</strong> and help me evaluate whether this funding opportunity is worth pursuing based on team capacity and fit.</p>",
      category: "grant",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: moderator.id,
      createdById: user1.id,
    },
  });

  const prompt2 = await prisma.prompt.create({
    data: {
      stage: "2. Proposal development",
      steps: "Narrative framing",
      question: "What is the fundable story?",
      promptText:
        "<p>Help me convert rough project notes into a clear proposal narrative: problem, solution, outcomes, and impact.</p>",
      category: "grant",
      status: "PENDING",
      createdById: user2.id,
    },
  });

  await prisma.feedback.createMany({
    data: [
      {
        promptId: prompt1.id,
        userId: user2.id,
        feedback: "Great structure. Consider adding measurable outcomes.",
      },
      {
        promptId: prompt1.id,
        userId: moderator.id,
        feedback: "Approved. This is specific and actionable.",
      },
    ],
  });

  await prisma.reaction.createMany({
    data: [
      { promptId: prompt1.id, userId: user2.id, value: "LIKE" },
      { promptId: prompt1.id, userId: admin.id, value: "LIKE" },
      { promptId: prompt2.id, userId: user1.id, value: "DISLIKE" },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Login users:");
  console.log("admin@example.com / Password@123");
  console.log("moderator@example.com / Password@123");
  console.log("jonny@example.com / Password@123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
