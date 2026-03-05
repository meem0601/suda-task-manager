-- 期限フィールド追加
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
