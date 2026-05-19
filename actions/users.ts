'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string;
  role: UserRole;
  coins: number;
  bio: string;
  authorName: string;
  createdAt: Date | null;
}

/** Get or create the current user's profile in Neon. */
export async function getOrCreateProfile(): Promise<UserProfile | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await db.select().from(users).where(eq(users.id, clerkUser.id)).limit(1);

  if (existing.length > 0) {
    return existing[0] as UserProfile;
  }

  // First sign-in — create profile
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const displayName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'Reader';
  const photoUrl = clerkUser.imageUrl ?? '';

  const [created] = await db
    .insert(users)
    .values({ id: clerkUser.id, email, displayName, photoUrl })
    .returning();

  return created as UserProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows.length > 0 ? (rows[0] as UserProfile) : null;
}

export async function updateUserRole(role: UserRole): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserCoins(delta: number): Promise<number> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const [profile] = await db.select({ coins: users.coins }).from(users).where(eq(users.id, userId));
  const newBalance = Math.max(0, (profile?.coins ?? 0) + delta);

  await db.update(users).set({ coins: newBalance }).where(eq(users.id, userId));
  return newBalance;
}

export async function updateUserProfile(data: Partial<Pick<UserProfile, 'bio' | 'authorName' | 'displayName'>>): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers(limit = 100) {
  return db.select().from(users).limit(limit);
}

export async function adminUpdateUserRole(targetUserId: string, role: UserRole): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  const [me] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
  if (me?.role !== 'admin') throw new Error('Not authorized');
  await db.update(users).set({ role }).where(eq(users.id, targetUserId));
}
