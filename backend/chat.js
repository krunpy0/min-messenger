const prisma = require("./prisma");

async function ensureMember(userId, chatId) {
  const user = await prisma.chat.findUnique({
    where: { id: chatId, userId },
    select: { id: true },
  });
  return !!user;
}

async function createChat({ creatorId, memberIds }) {
  const allIds = [creatorId, ...memberIds];
  const uniqueIds = [...new Set(allIds)];

  const chat = await prisma.chat.create({
    data: {
      members: {
        create: uniqueIds.map((uid) => ({
          userId: uid,
          role: uid === creatorId ? "admin" : "member",
        })),
      },
    },
    include: { members: { include: { user: true } } },
  });
  return chat;
}
