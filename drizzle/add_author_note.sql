-- Add author_note column to chapters table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS author_note TEXT DEFAULT '';
