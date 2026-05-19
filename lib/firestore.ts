import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Types ──────────────────────────────────────────────────────────────

export type NovelStatus = 'draft' | 'published' | 'submitted' | 'approved' | 'rejected';
export type ChapterStatus = 'draft' | 'published';

export interface Novel {
  id?: string;
  title: string;
  authorId: string;
  authorName: string;
  synopsis: string;
  genre: string;
  tags: string[];
  coverImageUrl: string;
  status: NovelStatus;
  contentRating: string;
  createdAt: unknown;
  updatedAt: unknown;
  views: number;
  subscribers: number;
  chapterCount: number;
  wordCount: number;
}

export interface Chapter {
  id?: string;
  novelId: string;
  title: string;
  content: string;
  chapterNumber: number;
  isPaid: boolean;
  coinCost: number;
  wordCount: number;
  status: ChapterStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  content: string;
  createdAt: unknown;
  read: boolean;
}

export interface Conversation {
  id?: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastMessageAt: unknown;
  unreadCount: Record<string, number>;
}

export interface Report {
  id?: string;
  reporterId: string;
  targetType: 'novel' | 'chapter' | 'user' | 'comment';
  targetId: string;
  targetTitle: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: unknown;
}

// ── Novels ─────────────────────────────────────────────────────────────

export async function createNovel(data: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'subscribers' | 'chapterCount' | 'wordCount'>): Promise<string> {
  const ref = await addDoc(collection(db, 'novels'), {
    ...data,
    views: 0,
    subscribers: 0,
    chapterCount: 0,
    wordCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNovel(novelId: string, data: Partial<Novel>): Promise<void> {
  await updateDoc(doc(db, 'novels', novelId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteNovel(novelId: string): Promise<void> {
  await deleteDoc(doc(db, 'novels', novelId));
}

export async function getNovel(novelId: string): Promise<Novel | null> {
  const snap = await getDoc(doc(db, 'novels', novelId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Novel : null;
}

export async function getPublishedNovels(limitCount = 20): Promise<Novel[]> {
  const q = query(
    collection(db, 'novels'),
    where('status', '==', 'published'),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Novel);
}

export async function getNovelsByAuthor(authorId: string): Promise<Novel[]> {
  const q = query(
    collection(db, 'novels'),
    where('authorId', '==', authorId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Novel);
}

export async function getAllNovelsForAdmin(): Promise<Novel[]> {
  const snap = await getDocs(query(collection(db, 'novels'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Novel);
}

// ── Chapters ───────────────────────────────────────────────────────────

export async function createChapter(novelId: string, data: Omit<Chapter, 'id' | 'novelId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'novels', novelId, 'chapters'), {
    ...data,
    novelId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'novels', novelId), {
    chapterCount: (await getChapterCount(novelId)) + 1,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateChapter(novelId: string, chapterId: string, data: Partial<Chapter>): Promise<void> {
  await updateDoc(doc(db, 'novels', novelId, 'chapters', chapterId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChapter(novelId: string, chapterId: string): Promise<void> {
  await deleteDoc(doc(db, 'novels', novelId, 'chapters', chapterId));
}

export async function getChapters(novelId: string): Promise<Chapter[]> {
  const q = query(
    collection(db, 'novels', novelId, 'chapters'),
    orderBy('chapterNumber', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chapter);
}

export async function getPublishedChapters(novelId: string): Promise<Chapter[]> {
  const q = query(
    collection(db, 'novels', novelId, 'chapters'),
    where('status', '==', 'published'),
    orderBy('chapterNumber', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chapter);
}

export async function getChapter(novelId: string, chapterId: string): Promise<Chapter | null> {
  const snap = await getDoc(doc(db, 'novels', novelId, 'chapters', chapterId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Chapter : null;
}

async function getChapterCount(novelId: string): Promise<number> {
  const snap = await getDocs(collection(db, 'novels', novelId, 'chapters'));
  return snap.size;
}

// ── Messages / Conversations ───────────────────────────────────────────

export async function getOrCreateConversation(userId1: string, userId2: string, names: Record<string, string>, photos: Record<string, string>): Promise<string> {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId1)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data() as Conversation;
    if (data.participantIds.includes(userId2)) return d.id;
  }
  const ref = await addDoc(collection(db, 'conversations'), {
    participantIds: [userId1, userId2],
    participantNames: names,
    participantPhotos: photos,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCount: { [userId1]: 0, [userId2]: 0 },
  });
  return ref.id;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversation);
}

export async function sendMessage(conversationId: string, senderId: string, senderName: string, senderPhotoURL: string, content: string): Promise<void> {
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    senderName,
    senderPhotoURL,
    content,
    createdAt: serverTimestamp(),
    read: false,
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
  });
}

export function subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message));
  });
}

// ── Content Reports ────────────────────────────────────────────────────

export async function createReport(data: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const ref = await addDoc(collection(db, 'reports'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPendingReports(): Promise<Report[]> {
  const q = query(
    collection(db, 'reports'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
}

export async function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  await updateDoc(doc(db, 'reports', reportId), { status });
}

// ── Users (admin) ──────────────────────────────────────────────────────

export async function getAllUsers(limitCount = 100) {
  const snap = await getDocs(query(collection(db, 'users'), limit(limitCount)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// ── Utility ────────────────────────────────────────────────────────────

export function timestampToString(ts: unknown): string {
  if (!ts) return '';
  if (ts instanceof Timestamp) return ts.toDate().toLocaleDateString();
  if (ts instanceof Date) return ts.toLocaleDateString();
  return '';
}
