'use server';

import { db } from '@/lib/db';
import { novels, chapters, writingSessions, comments, novelReviews } from '@/lib/schema';
import { eq, and, desc, sql, count, sum, avg } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export interface NovelStats {
  id: number;
  title: string;
  status: string;
  genre: string;
  coverImageUrl: string;
  views: number;
  subscribers: number;
  chapterCount: number;
  wordCount: number;
  publishedChapters: number;
  publishedWords: number;
  avgChapterLength: number;
  updatedAt: Date | null;
}

export interface ChapterStat {
  id: number;
  title: string;
  chapterNumber: number;
  wordCount: number;
  status: string;
  isPaid: boolean;
  coinCost: number;
  createdAt: Date | null;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  words: number;
  novelTitle?: string;
}

export interface AuthorOverview {
  totalWordsReleased: number;
  chaptersReleased: number;
  avgChapterLength: number;
  writingDaysThisMonth: number;
  totalViews: number;
  totalSubscribers: number;
  totalNovels: number;
  totalComments: number;
}

/** Aggregate stats for all of the current author's novels */
export async function getAuthorOverview(): Promise<AuthorOverview> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const novelRows = await db
    .select()
    .from(novels)
    .where(eq(novels.authorId, userId));

  const novelIds = novelRows.map((n) => n.id);

  let chaptersReleased = 0;
  let totalWordsReleased = 0;

  if (novelIds.length > 0) {
    const chapterAgg = await db
      .select({
        count: count(),
        totalWords: sum(chapters.wordCount),
      })
      .from(chapters)
      .where(
        and(
          eq(chapters.status, 'published'),
          sql`${chapters.novelId} = ANY(ARRAY[${sql.raw(novelIds.join(','))}]::int[])`,
        ),
      );
    chaptersReleased = Number(chapterAgg[0]?.count ?? 0);
    totalWordsReleased = Number(chapterAgg[0]?.totalWords ?? 0);
  }

  const totalViews = novelRows.reduce((s, n) => s + n.views, 0);
  const totalSubscribers = novelRows.reduce((s, n) => s + n.subscribers, 0);
  const avgChapterLength =
    chaptersReleased > 0 ? Math.round(totalWordsReleased / chaptersReleased) : 0;

  // Writing days this month
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthSessions = await db
    .select({ date: writingSessions.date })
    .from(writingSessions)
    .where(
      and(
        eq(writingSessions.authorId, userId),
        sql`${writingSessions.date} LIKE ${monthPrefix + '%'}`,
      ),
    );
  const writingDaysThisMonth = new Set(monthSessions.map((s) => s.date)).size;

  // Total comments across all novels (via chapters)
  let totalComments = 0;
  if (novelIds.length > 0) {
    const commentAgg = await db
      .select({ count: count() })
      .from(comments)
      .where(
        sql`${comments.chapterId} IN (
          SELECT id FROM chapters WHERE novel_id = ANY(ARRAY[${sql.raw(novelIds.join(','))}]::int[])
        )`,
      );
    totalComments = Number(commentAgg[0]?.count ?? 0);
  }

  return {
    totalWordsReleased,
    chaptersReleased,
    avgChapterLength,
    writingDaysThisMonth,
    totalViews,
    totalSubscribers,
    totalNovels: novelRows.length,
    totalComments,
  };
}

/** Per-novel stats for the current author */
export async function getNovelStatsList(): Promise<NovelStats[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const novelRows = await db
    .select()
    .from(novels)
    .where(eq(novels.authorId, userId))
    .orderBy(desc(novels.updatedAt));

  const result: NovelStats[] = [];

  for (const n of novelRows) {
    const chapterAgg = await db
      .select({
        publishedCount: count(),
        publishedWords: sum(chapters.wordCount),
      })
      .from(chapters)
      .where(and(eq(chapters.novelId, n.id), eq(chapters.status, 'published')));

    const publishedChapters = Number(chapterAgg[0]?.publishedCount ?? 0);
    const publishedWords = Number(chapterAgg[0]?.publishedWords ?? 0);

    result.push({
      id: n.id,
      title: n.title,
      status: n.status,
      genre: n.genre ?? '',
      coverImageUrl: n.coverImageUrl ?? '',
      views: n.views,
      subscribers: n.subscribers,
      chapterCount: n.chapterCount,
      wordCount: n.wordCount,
      publishedChapters,
      publishedWords,
      avgChapterLength: publishedChapters > 0
        ? Math.round(publishedWords / publishedChapters)
        : 0,
      updatedAt: n.updatedAt,
    });
  }

  return result;
}

/** Per-chapter stats for a specific novel */
export async function getChapterStats(novelId: number): Promise<ChapterStat[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const rows = await db
    .select()
    .from(chapters)
    .where(eq(chapters.novelId, novelId))
    .orderBy(chapters.chapterNumber);

  return rows.map((ch) => ({
    id: ch.id,
    title: ch.title,
    chapterNumber: ch.chapterNumber,
    wordCount: ch.wordCount,
    status: ch.status,
    isPaid: ch.isPaid,
    coinCost: ch.coinCost,
    createdAt: ch.createdAt,
  }));
}

/** Daily writing activity for the last N days (or filtered by novel) */
export async function getDailyActivity(
  days = 30,
  novelId?: number,
): Promise<DailyActivity[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const rows = await db
    .select()
    .from(writingSessions)
    .where(
      and(
        eq(writingSessions.authorId, userId),
        novelId !== undefined ? eq(writingSessions.novelId, novelId) : undefined,
        sql`${writingSessions.date} >= ${cutoffStr}`,
      ),
    )
    .orderBy(writingSessions.date);

  // Aggregate by date
  const byDate: Record<string, number> = {};
  for (const row of rows) {
    byDate[row.date] = (byDate[row.date] ?? 0) + row.wordsWritten;
  }

  // Fill every date in range (so chart shows 0-gaps)
  const result: DailyActivity[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    result.push({ date: ds, words: byDate[ds] ?? 0 });
  }
  return result;
}
