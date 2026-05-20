'use server';

import { db } from '@/lib/db';
import {
  comments,
  novelReviews,
  readingHistory,
  library,
  novelFollows,
  chapterUnlocks,
  notifications,
  users,
  novels,
  chapters,
} from '@/lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

// ── Comments ───────────────────────────────────────────────────────────

export async function getComments(chapterId: number) {
  return db
    .select()
    .from(comments)
    .where(eq(comments.chapterId, chapterId))
    .orderBy(desc(comments.createdAt));
}

export async function addComment(chapterId: number, content: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Not authenticated');

  const displayName =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'Reader';
  const photoUrl = clerkUser.imageUrl ?? '';

  const [row] = await db
    .insert(comments)
    .values({
      chapterId,
      userId: clerkUser.id,
      authorName: displayName,
      authorPhoto: photoUrl,
      content: content.trim(),
    })
    .returning();
  return row;
}

export async function deleteComment(commentId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  // only owner can delete
  await db
    .delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)));
}

export async function likeComment(commentId: number) {
  await db
    .update(comments)
    .set({ likes: sql`${comments.likes} + 1` })
    .where(eq(comments.id, commentId));
}

// ── Novel Reviews / Ratings ────────────────────────────────────────────

export async function getNovelReviews(novelId: number) {
  return db
    .select()
    .from(novelReviews)
    .where(eq(novelReviews.novelId, novelId))
    .orderBy(desc(novelReviews.createdAt));
}

export async function getMyReview(novelId: number) {
  const { userId } = await auth();
  if (!userId) return null;
  const rows = await db
    .select()
    .from(novelReviews)
    .where(and(eq(novelReviews.novelId, novelId), eq(novelReviews.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertReview(novelId: number, rating: number, content: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Not authenticated');

  const displayName =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'Reader';

  const existing = await db
    .select({ id: novelReviews.id })
    .from(novelReviews)
    .where(and(eq(novelReviews.novelId, novelId), eq(novelReviews.userId, clerkUser.id)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(novelReviews)
      .set({ rating, content: content.trim() })
      .where(eq(novelReviews.id, existing[0].id));
  } else {
    await db.insert(novelReviews).values({
      novelId,
      userId: clerkUser.id,
      authorName: displayName,
      rating,
      content: content.trim(),
    });
  }
}

export async function getNovelAverageRating(
  novelId: number
): Promise<{ average: number; count: number }> {
  const rows = await db
    .select({
      avg: sql<string>`AVG(${novelReviews.rating})`,
      cnt: sql<string>`COUNT(*)`,
    })
    .from(novelReviews)
    .where(eq(novelReviews.novelId, novelId));

  return {
    average: parseFloat(rows[0]?.avg ?? '0') || 0,
    count: parseInt(rows[0]?.cnt ?? '0', 10) || 0,
  };
}

// ── Reading History ────────────────────────────────────────────────────

export async function trackReadingHistory(
  novelId: number,
  chapterId: number,
  novelTitle: string,
  chapterTitle: string,
  coverImageUrl: string
) {
  const { userId } = await auth();
  if (!userId) return;

  // upsert: update readAt if row already exists, else insert
  const existing = await db
    .select({ id: readingHistory.id })
    .from(readingHistory)
    .where(
      and(
        eq(readingHistory.userId, userId),
        eq(readingHistory.novelId, novelId),
        eq(readingHistory.chapterId, chapterId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(readingHistory)
      .set({ readAt: new Date() })
      .where(eq(readingHistory.id, existing[0].id));
  } else {
    await db.insert(readingHistory).values({
      userId,
      novelId,
      chapterId,
      novelTitle,
      chapterTitle,
      coverImageUrl,
    });
  }
}

export async function getReadingHistory(limit = 20) {
  const { userId } = await auth();
  if (!userId) return [];
  return db
    .select()
    .from(readingHistory)
    .where(eq(readingHistory.userId, userId))
    .orderBy(desc(readingHistory.readAt))
    .limit(limit);
}

// ── Library (Bookmarks) ────────────────────────────────────────────────

export async function getLibrary() {
  const { userId } = await auth();
  if (!userId) return [];
  return db
    .select()
    .from(library)
    .where(eq(library.userId, userId))
    .orderBy(desc(library.addedAt));
}

export async function isInLibrary(novelId: number): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const rows = await db
    .select({ id: library.id })
    .from(library)
    .where(and(eq(library.userId, userId), eq(library.novelId, novelId)))
    .limit(1);
  return rows.length > 0;
}

export async function addToLibrary(
  novelId: number,
  novelTitle: string,
  coverImageUrl: string,
  authorName: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const exists = await isInLibrary(novelId);
  if (exists) return;

  await db.insert(library).values({ userId, novelId, novelTitle, coverImageUrl, authorName });
}

export async function removeFromLibrary(novelId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db
    .delete(library)
    .where(and(eq(library.userId, userId), eq(library.novelId, novelId)));
}

// ── Novel Follows ──────────────────────────────────────────────────────

export async function isFollowingNovel(novelId: number): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const rows = await db
    .select({ id: novelFollows.id })
    .from(novelFollows)
    .where(and(eq(novelFollows.userId, userId), eq(novelFollows.novelId, novelId)))
    .limit(1);
  return rows.length > 0;
}

export async function followNovel(novelId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const exists = await isFollowingNovel(novelId);
  if (exists) return;

  await db.insert(novelFollows).values({ userId, novelId });
  await db
    .update(novels)
    .set({ subscribers: sql`${novels.subscribers} + 1` })
    .where(eq(novels.id, novelId));
}

export async function unfollowNovel(novelId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  await db
    .delete(novelFollows)
    .where(and(eq(novelFollows.userId, userId), eq(novelFollows.novelId, novelId)));
  await db
    .update(novels)
    .set({ subscribers: sql`GREATEST(${novels.subscribers} - 1, 0)` })
    .where(eq(novels.id, novelId));
}

// ── Chapter Unlocks ────────────────────────────────────────────────────

export async function isChapterUnlocked(chapterId: number): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const rows = await db
    .select({ id: chapterUnlocks.id })
    .from(chapterUnlocks)
    .where(and(eq(chapterUnlocks.userId, userId), eq(chapterUnlocks.chapterId, chapterId)))
    .limit(1);
  return rows.length > 0;
}

export async function unlockChapter(
  chapterId: number,
  novelId: number,
  coinCost: number
): Promise<{ success: boolean; remainingCoins: number }> {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Not authenticated');

  // Check already unlocked
  const alreadyUnlocked = await isChapterUnlocked(chapterId);
  if (alreadyUnlocked) return { success: true, remainingCoins: 0 };

  // Check coins balance
  const [userRow] = await db
    .select({ coins: users.coins })
    .from(users)
    .where(eq(users.id, clerkUser.id));

  const currentCoins = userRow?.coins ?? 0;
  if (currentCoins < coinCost) {
    throw new Error('Insufficient coins');
  }

  const newBalance = currentCoins - coinCost;
  await db.update(users).set({ coins: newBalance }).where(eq(users.id, clerkUser.id));
  await db.insert(chapterUnlocks).values({
    userId: clerkUser.id,
    chapterId,
    novelId,
    coinCost,
  });

  return { success: true, remainingCoins: newBalance };
}

// ── Notifications ──────────────────────────────────────────────────────

export async function getNotifications(limit = 20) {
  const { userId } = await auth();
  if (!userId) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;
  const rows = await db
    .select({ cnt: sql<string>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return parseInt(rows[0]?.cnt ?? '0', 10);
}

export async function markNotificationsRead() {
  const { userId } = await auth();
  if (!userId) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  href: string
) {
  await db.insert(notifications).values({ userId, type, title, body, href });
}
