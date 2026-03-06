-- ========================================
-- MEEM Task Manager - DB拡張スクリプト
-- 作成日: 2026-03-06
-- 目的: 指示書の仕様に基づいてDBを拡張
-- ========================================

-- ========================================
-- 1. usersテーブル作成（auth.usersと連携）
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- usersテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ========================================
-- 2. categoriesテーブル作成（business_typeの置き換え）
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- categoriesテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ========================================
-- 3. 既存business_typeデータをcategoriesに変換
-- ========================================
INSERT INTO categories (name, color, sort_order)
VALUES 
    ('不動産', '#00c875', 1),
    ('人材', '#0073ea', 2),
    ('経済圏', '#9cd326', 3),
    ('結婚相談所', '#ff3d57', 4),
    ('コーポレート', '#fdab3d', 5),
    ('その他', '#a3a3a3', 6)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 4. tagsテーブル作成
-- ========================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#a855f7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tagsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ========================================
-- 5. task_tags中間テーブル作成
-- ========================================
CREATE TABLE IF NOT EXISTS task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, tag_id)
);

-- task_tagsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- ========================================
-- 6. activity_logsテーブル作成
-- ========================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'completed', 'deleted', 'status_changed', 'priority_changed')),
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- activity_logsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ========================================
-- 7. saved_filtersテーブル作成
-- ========================================
CREATE TABLE IF NOT EXISTS saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filter_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- saved_filtersテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);

-- ========================================
-- 8. recurring_tasksテーブル作成（将来用）
-- ========================================
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    recurrence_rule TEXT NOT NULL, -- RRULE形式
    next_occurrence DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- recurring_tasksテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_task_id ON recurring_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_next_occurrence ON recurring_tasks(next_occurrence);

-- ========================================
-- 9. tasksテーブルに新しいカラムを追加
-- ========================================

-- category_idカラムの追加
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- start_dateカラムの追加
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;

-- parent_task_idカラムの追加（サブタスクの親参照）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- sort_orderカラムの追加
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- is_archivedカラムの追加
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- ========================================
-- 10. 既存タスクにcategory_idを設定（マイグレーション）
-- ========================================
UPDATE tasks t
SET category_id = c.id
FROM categories c
WHERE t.business_type = c.name
  AND t.category_id IS NULL;

-- ========================================
-- 11. 新しいカラムのインデックス作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON tasks(is_archived);

-- ========================================
-- 12. Realtime有効化
-- ========================================
-- Supabase DashboardでRealtime > Enable Realtimeを有効化する必要あり
-- または以下のコマンドで有効化（スーパーユーザー権限が必要）
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

-- ========================================
-- 13. 更新日時トリガーの追加（新しいテーブル用）
-- ========================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_filters_updated_at
    BEFORE UPDATE ON saved_filters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at
    BEFORE UPDATE ON recurring_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 完了！
-- ========================================
-- このSQLファイルをSupabase SQL Editorで実行してください
-- 実行後、以下を確認：
-- 1. すべてのテーブルが作成されているか
-- 2. 既存のtasksデータが保持されているか
-- 3. category_idが正しく設定されているか
