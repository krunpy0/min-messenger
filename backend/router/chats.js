const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const chatsRouter = express.Router();


chatsRouter.get('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        messages: true,
        members: {
          include: {
            user: {
              select: {
                username: true,
                id: true
              }
            }  
          }
        }
      }
    })
    res.status(200).json(chats)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "Unexpected server error"})
  }
})

chatsRouter.get('/:userId', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;
    const chat = await prisma.chat.findUnique({
      where: { members: { some: { userId: userId } } },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          select: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });
    res.status(200).json(chat)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "Unexpected server error"})
  }
})

chatsRouter.get('/:chatId/messages', passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Проверяем, что пользователь является участником чата
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        chatId: chatId,
        userId: req.user.id
      }
    });
    
    if (!chatMember) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const messages = await prisma.message.findMany({
      where: { chatId: chatId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unexpected server error" });
  }
});

chatsRouter.post('/create', passport.authenticate("jwt", { session: false }), async (req, res) => {
  console.log('attempting to create chat')
  try {
  const {type, membersId, name} = req.body;

  console.log('type', type)
  console.log('membersId', membersId)
  console.log('name', name)

  if (!type || !membersId || !Array.isArray(membersId))  return res.status(400).json({ 
    message: "Type and participantIds are required. membersId must be an array." 
  });

  const members = await prisma.user.findMany({
    where: {
      id: { in: membersId }
    },
    select: { id: true, username: true }
  });

  if (members.length !== membersId.length) {
    return res.status(400).json({ 
      message: "One or more members not found" 
    });
  }

  const chat = await prisma.$transaction(async (tx) => {
    // Создаем чат
    const newChat = await tx.chat.create({
      data: {
        type: type, // 'private', 'group', 'channel'
        name: name || null
      }
    });

    const allMemberIds = [req.user.id, ...membersId];

    await tx.chatMember.createMany({
      data: allMemberIds.map(userId => ({
        chatId: newChat.id,
        userId: userId,
        role: members.length > 1 ? userId === req.user.id ? 'admin' : 'member' : 'member'
      }))
    });

    return await tx.chat.findUnique({
      where: { id: newChat.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
  });
  
  res.status(201).json(chat);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "Unexpected server error"})
  }
})


module.exports = chatsRouter;