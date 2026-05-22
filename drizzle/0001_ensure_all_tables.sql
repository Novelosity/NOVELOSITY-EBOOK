-- ============================================================
-- Novelosity — ensure every table exists (safe, idempotent)
-- Run once: npx drizzle-kit push  OR  psql -f this file
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'reader',
  coins INTEGER NOT NULL DEFAULT 250,
  bio TEXT DEFAULT '',
  author_name TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS novels (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  synopsis TEXT DEFAULT '',
  genre TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  content_rating TEXT DEFAULT '12+',
  views INTEGER NOT NULL DEFAULT 0,
  subscribers INTEGER NOT NULL DEFAULT 0,
  chapter_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  chapter_number INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  coin_cost INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  author_note TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure author_note column exists (idempotent)
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS author_note TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT DEFAULT '',
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_photo TEXT DEFAULT '',
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS novel_reviews (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  novel_title TEXT NOT NULL,
  chapter_title TEXT NOT NULL,
  cover_image_url TEXT DEFAULT '',
  read_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  novel_title TEXT NOT NULL,
  cover_image_url TEXT DEFAULT '',
  author_name TEXT DEFAULT '',
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS novel_follows (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapter_unlocks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  coin_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writing_sessions (
  id SERIAL PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  novel_title TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  words_written INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  href TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
