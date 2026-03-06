# MEEM Task Manager - DBスキーマ一覧

## 📅 更新日: 2026-03-06

このドキュメントは、MEEM Task ManagerのSupabase DBスキーマを記載しています。

---

## 🗄️ テーブル一覧

### 既存テーブル（拡張済み）

1. **tasks** - タスク（メインテーブル）
2. **subtasks** - サブタスク
3. **notifications** - 通知
4. **push_subscriptions** - プッシュ通知購読

### 新規追加テーブル

5. **users** - ユーザー情報
6. **categories** - カテゴリ（business_typeの置き換え）
7. **tags** - タグ
8. **task_tags** - タスク-タグ中間テーブル
9. **activity_logs** - アクティビティログ
10. **saved_filters** - 保存されたフィルター
11. **recurring_tasks** - 繰り返しタスク（将来用）

---

## 📋 テーブル詳細

### 1. tasks

**概要:** タスクのメインテーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | タスクID |
| title | TEXT | NO | - | タスク名 |
| description | TEXT | YES | NULL | 説明 |
| category | TEXT | NO | - | カテゴリ（個人/事業） |
| business_type | TEXT | YES | NULL | 事業タイプ（旧） |
| **category_id** | **UUID** | **YES** | **NULL** | **カテゴリID（新）** |
| priority | TEXT | YES | NULL | 優先度（緊急/高/中/低） |
| ai_priority_score | INTEGER | YES | 50 | AI優先度スコア（1-100） |
| ai_suggestion | TEXT | YES | NULL | AI提案 |
| status | TEXT | NO | '未着手' | ステータス |
| **start_date** | **DATE** | **YES** | **NULL** | **開始日（新）** |
| due_date | DATE | YES | NULL | 期限日 |
| **parent_task_id** | **UUID** | **YES** | **NULL** | **親タスクID（新）** |
| **sort_order** | **INTEGER** | **NO** | **0** | **表示順（新）** |
| **is_archived** | **BOOLEAN** | **NO** | **FALSE** | **アーカイブ済み（新）** |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |
| completed_at | TIMESTAMPTZ | YES | NULL | 完了日時 |

**制約:**
- CHECK: `category IN ('個人', '事業')`
- CHECK: `business_type IN ('不動産', '人材', '経済圏', '結婚相談所', 'コーポレート', 'その他')`
- CHECK: `priority IN ('緊急', '高', '中', '低')`
- CHECK: `status IN ('未着手', '進行中', 'レビュー中', '完了')`
- CHECK: `ai_priority_score BETWEEN 1 AND 100`
- FK: `category_id → categories(id)`
- FK: `parent_task_id → tasks(id)` (自己参照)

**インデックス:**
- `idx_tasks_status` ON (status)
- `idx_tasks_category` ON (category)
- `idx_tasks_category_id` ON (category_id)
- `idx_tasks_created_at` ON (created_at DESC)
- `idx_tasks_ai_priority` ON (ai_priority_score DESC)
- `idx_tasks_due_date` ON (due_date)
- `idx_tasks_start_date` ON (start_date)
- `idx_tasks_parent_task_id` ON (parent_task_id)
- `idx_tasks_sort_order` ON (sort_order)
- `idx_tasks_is_archived` ON (is_archived)

---

### 2. subtasks

**概要:** サブタスク

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | サブタスクID |
| task_id | UUID | NO | - | 親タスクID |
| title | TEXT | NO | - | サブタスク名 |
| completed | BOOLEAN | NO | FALSE | 完了状態 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| completed_at | TIMESTAMPTZ | YES | NULL | 完了日時 |

**制約:**
- FK: `task_id → tasks(id) ON DELETE CASCADE`

**インデックス:**
- `idx_subtasks_task_id` ON (task_id)
- `idx_subtasks_completed` ON (completed)

---

### 3. notifications

**概要:** 通知

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 通知ID |
| task_id | UUID | NO | - | タスクID |
| type | TEXT | NO | - | 通知タイプ |
| title | TEXT | NO | - | 通知タイトル |
| body | TEXT | NO | - | 通知本文 |
| sent_at | TIMESTAMPTZ | YES | NULL | 送信日時 |
| read_at | TIMESTAMPTZ | YES | NULL | 既読日時 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

**制約:**
- CHECK: `type IN ('reminder_1day', 'reminder_1hour', 'task_completed', 'task_overdue')`

---

### 4. push_subscriptions

**概要:** プッシュ通知購読

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 購読ID |
| endpoint | TEXT | NO | - | エンドポイントURL |
| p256dh | TEXT | NO | - | 公開鍵 |
| auth | TEXT | NO | - | 認証シークレット |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

---

### 5. users 🆕

**概要:** ユーザー情報（auth.usersと連携）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | - | ユーザーID（auth.usersと同じ） |
| email | TEXT | NO | - | メールアドレス |
| display_name | TEXT | YES | NULL | 表示名 |
| avatar_url | TEXT | YES | NULL | アバター画像URL |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

**制約:**
- FK: `id → auth.users(id) ON DELETE CASCADE`

**インデックス:**
- `idx_users_email` ON (email)

---

### 6. categories 🆕

**概要:** カテゴリ（business_typeの置き換え）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | カテゴリID |
| name | TEXT | NO | - | カテゴリ名 |
| color | TEXT | NO | '#3b82f6' | カラーコード |
| icon | TEXT | YES | NULL | アイコン（絵文字等） |
| sort_order | INTEGER | NO | 0 | 表示順 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

**制約:**
- UNIQUE: name

**インデックス:**
- `idx_categories_sort_order` ON (sort_order)

**デフォルトデータ:**
| name | color | sort_order |
|------|-------|------------|
| 不動産 | #00c875 | 1 |
| 人材 | #0073ea | 2 |
| 経済圏 | #9cd326 | 3 |
| 結婚相談所 | #ff3d57 | 4 |
| コーポレート | #fdab3d | 5 |
| その他 | #a3a3a3 | 6 |

---

### 7. tags 🆕

**概要:** タグ

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | タグID |
| name | TEXT | NO | - | タグ名 |
| color | TEXT | NO | '#a855f7' | カラーコード |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

**制約:**
- UNIQUE: name

**インデックス:**
- `idx_tags_name` ON (name)

---

### 8. task_tags 🆕

**概要:** タスク-タグ中間テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| task_id | UUID | NO | - | タスクID |
| tag_id | UUID | NO | - | タグID |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

**制約:**
- PRIMARY KEY: (task_id, tag_id)
- FK: `task_id → tasks(id) ON DELETE CASCADE`
- FK: `tag_id → tags(id) ON DELETE CASCADE`

**インデックス:**
- `idx_task_tags_task_id` ON (task_id)
- `idx_task_tags_tag_id` ON (tag_id)

---

### 9. activity_logs 🆕

**概要:** アクティビティログ（タスクの変更履歴）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | ログID |
| task_id | UUID | YES | NULL | タスクID |
| user_id | UUID | YES | NULL | ユーザーID |
| action | TEXT | NO | - | アクション |
| field_name | TEXT | YES | NULL | 変更されたフィールド名 |
| old_value | TEXT | YES | NULL | 変更前の値 |
| new_value | TEXT | YES | NULL | 変更後の値 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

**制約:**
- CHECK: `action IN ('created', 'updated', 'completed', 'deleted', 'status_changed', 'priority_changed')`
- FK: `task_id → tasks(id) ON DELETE CASCADE`
- FK: `user_id → users(id) ON DELETE SET NULL`

**インデックス:**
- `idx_activity_logs_task_id` ON (task_id)
- `idx_activity_logs_created_at` ON (created_at DESC)

---

### 10. saved_filters 🆕

**概要:** 保存されたフィルター設定

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | フィルターID |
| user_id | UUID | NO | - | ユーザーID |
| name | TEXT | NO | - | フィルター名 |
| filter_config | JSONB | NO | - | フィルター設定 |
| is_default | BOOLEAN | NO | FALSE | デフォルトフィルターか |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

**制約:**
- FK: `user_id → users(id) ON DELETE CASCADE`

**インデックス:**
- `idx_saved_filters_user_id` ON (user_id)

**filter_config JSONBの例:**
```json
{
  "status": ["未着手", "進行中"],
  "priority": ["緊急", "高"],
  "category_ids": ["uuid-1", "uuid-2"],
  "search": "検索キーワード",
  "sort_by": "due_date",
  "sort_order": "asc"
}
```

---

### 11. recurring_tasks 🆕

**概要:** 繰り返しタスク（将来用）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | レコードID |
| task_id | UUID | NO | - | タスクID |
| recurrence_rule | TEXT | NO | - | 繰り返しルール（RRULE形式） |
| next_occurrence | DATE | YES | NULL | 次回発生日 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

**制約:**
- FK: `task_id → tasks(id) ON DELETE CASCADE`

**インデックス:**
- `idx_recurring_tasks_task_id` ON (task_id)
- `idx_recurring_tasks_next_occurrence` ON (next_occurrence)

**RRULE例:**
```
FREQ=DAILY;INTERVAL=1  # 毎日
FREQ=WEEKLY;BYDAY=MO,WE,FR  # 毎週月水金
FREQ=MONTHLY;BYMONTHDAY=1  # 毎月1日
```

---

## 🔄 Realtime購読

以下のテーブルでRealtime購読を有効化:

- ✅ `tasks`
- ✅ `activity_logs`

**使用例（Next.js）:**
```typescript
import { supabase } from '@/lib/supabase';

// タスクの変更を購読
supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tasks' }, 
    (payload) => {
      console.log('Task changed:', payload);
    }
  )
  .subscribe();
```

---

## 📊 ER図（テキスト表現）

```
users (auth.users連携)
  ↓
  ├─ saved_filters (1:N)
  └─ activity_logs (1:N)

categories
  ↓
  └─ tasks (1:N)
       ├─ subtasks (1:N)
       ├─ task_tags (N:M via tags)
       ├─ activity_logs (1:N)
       ├─ notifications (1:N)
       ├─ recurring_tasks (1:1)
       └─ tasks (親子関係, 自己参照)

tags
  ↓
  └─ task_tags (N:M via tasks)
```

---

## 🎯 次のステップ

- [ ] DB拡張SQLを実行
- [ ] Realtimeを有効化
- [ ] 型定義をアプリケーションコードに統合
- [ ] UI実装（Agent 2: Designerへ引継ぎ）

---

**更新履歴:**
- 2026-03-06: 初版作成（Agent 1: Architect）
