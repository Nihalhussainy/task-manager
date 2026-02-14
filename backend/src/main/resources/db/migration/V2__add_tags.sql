-- Add tags column for tasks (comma-separated tags)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS tags text;

-- Backfill with empty string if null
UPDATE tasks SET tags = '' WHERE tags IS NULL;
