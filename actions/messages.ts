'use server';

import { db } from '@/lib/db';
import { conversations, conversationParticipants, messages, users } from '@/lib/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export interface ConversationWithMeta {
  id: number;
  lastMessage: string;
  lastMessageAt: Date | null;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: Date | null;
}

export async function getConversations(): Promise<ConversationWithMeta[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const myConvos = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  if (myConvos.length === 0) return [];
  const convoIds = myConvos.map((c) => c.conversationId);

  const allParticipants = await db
    .select({
      conversationId: conversationParticipants.conversationId,
      userId: conversationParticipants.userId,
      displayName: users.displayName,
      photoUrl: users.photoUrl,
    })
    .from(conversationParticipants)
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(inArray(conversationParticipants.conversationId, convoIds));

  const convoData = await db
    .select()
    .from(conversations)
    .where(inArray(conversations.id, convoIds))
    .orderBy(desc(conversations.lastMessageAt));

  return convoData.map((convo) => {
    const other = allParticipants.find(
      (p) => p.conversationId === convo.id && p.userId !== userId
    );
    return {
      id: convo.id,
      lastMessage: convo.lastMessage ?? '',
      lastMessageAt: convo.lastMessageAt,
      otherUserId: other?.userId ?? '',
      otherUserName: other?.displayName ?? 'Unknown',
      otherUserPhoto: other?.photoUrl ?? '',
    };
  });
}

export async function getOrCreateConversation(otherUserId: string): Promise<number> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  // Check if conversation already exists
  const myConvos = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  const myConvoIds = myConvos.map((c) => c.conversationId);

  if (myConvoIds.length > 0) {
    const shared = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.userId, otherUserId),
          inArray(conversationParticipants.conversationId, myConvoIds)
        )
      );

    if (shared.length > 0) return shared[0].conversationId;
  }

  // Create new conversation
  const [convo] = await db.insert(conversations).values({}).returning();

  await db.insert(conversationParticipants).values([
    { conversationId: convo.id, userId },
    { conversationId: convo.id, userId: otherUserId },
  ]);

  return convo.id;
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt) as Promise<Message[]>;
}

export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const [user] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, userId));

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      senderName: user?.displayName ?? 'User',
      content,
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessage: content, lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return msg as Message;
}
