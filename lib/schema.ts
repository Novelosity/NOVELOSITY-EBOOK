import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ── Users ──────────────────────────────────────────────────────────────
// Clerk provides identity; we store extended profile here.
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID (user_xxx)
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  photoUrl: text('photo_url').default(''),
  role: text('role').notNull().default('reader'), // reader | author | editor | admin
  coins: integer('coins').notNull().default(250),
  bio: text('bio').default(''),
  authorName: text('author_name').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Novels ─────────────────────────────────────────────────────────────
export const novels = pgTable('novels', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  authorName: text('author_name').notNull(),
  synopsis: text('synopsis').default(''),
  genre: text('genre').default(''),
  tags: text('tags').default(''), // comma-separated
  coverImageUrl: text('cover_image_url').default(''),
  status: text('status').notNull().default('draft'), // draft | published | submitted | approved | rejected
  contentRating: text('content_rating').default('12+'),
  views: integer('views').notNull().default(0),
  subscribers: integer('subscribers').notNull().default(0),
  chapterCount: integer('chapter_count').notNull().default(0),
  wordCount: integer('word_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Chapters ───────────────────────────────────────────────────────────
export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  novelId: integer('novel_id').notNull().references(() => novels.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').default(''),
  chapterNumber: integer('chapter_number').notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  coinCost: integer('coin_cost').notNull().default(0),
  wordCount: integer('word_count').notNull().default(0),
  status: text('status').notNull().default('draft'), // draft | published
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Conversations ──────────────────────────────────────────────────────
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  lastMessage: text('last_message').default(''),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversationParticipants = pgTable(
  'conversation_participants',
  {
    conversationId: integer('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.userId] })]
);

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id),
  senderName: text('sender_name').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Content Reports ────────────────────────────────────────────────────
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  targetType: text('target_type').notNull(), // novel | chapter | user | comment
  targetId: text('target_id').notNull(),
  targetTitle: text('target_title').default(''),
  reason: text('reason').default(''),
  status: text('status').notNull().default('pending'), // pending | resolved | dismissed
  createdAt: timestamp('created_at').defaultNow(),
});
