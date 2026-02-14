-- Add created_at column and backfill existing rows
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_at timestamp WITHOUT time zone DEFAULT now();

-- Backfill any existing rows that may have NULL created_at
UPDATE tasks SET created_at = now() WHERE created_at IS NULL;
