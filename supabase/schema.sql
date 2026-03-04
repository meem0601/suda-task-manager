-- 須田様専用タスク管理テーブル

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('個人', '事業')),
    business_type TEXT CHECK (business_type IN ('不動産', '人材', '経済圏', '結婚相談所', 'コーポレート', 'その他')),
    priority TEXT CHECK (priority IN ('今すぐやる', '今週やる', '今月やる', '高', '中', '低')),
    ai_priority_score INTEGER DEFAULT 50 CHECK (ai_priority_score BETWEEN 1 AND 100),
    ai_suggestion TEXT,
    status TEXT NOT NULL DEFAULT '未着手' CHECK (status IN ('未着手', '進行中', '完了')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_ai_priority ON tasks(ai_priority_score DESC);
