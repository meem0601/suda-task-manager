# DB拡張マイグレーションガイド

## 📋 概要

このガイドでは、MEEM Task ManagerのSupabase DBを拡張する手順を説明します。

**作成日:** 2026-03-06  
**対象DB:** https://dqrnjluulchmuukfczib.supabase.co

---

## 🚀 実行手順

### 1. Supabase Dashboardにアクセス

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクト `dqrnjluulchmuukfczib` を選択
3. 左メニューから **SQL Editor** を選択

### 2. SQLファイルを実行

1. **New query** ボタンをクリック
2. `supabase/01-db-extension.sql` の内容をコピー&ペースト
3. **Run** ボタンをクリック

### 3. 実行結果の確認

以下のメッセージが表示されればOK:

```
Success. No rows returned
```

エラーが出た場合は、エラーメッセージをコピーして須田様に報告してください。

### 4. テーブル作成の確認

左メニューから **Table Editor** を選択し、以下のテーブルが作成されていることを確認:

- ✅ `users`
- ✅ `categories`
- ✅ `tags`
- ✅ `task_tags`
- ✅ `activity_logs`
- ✅ `saved_filters`
- ✅ `recurring_tasks`

既存のテーブル:
- ✅ `tasks` (新しいカラムが追加されている)
- ✅ `subtasks`
- ✅ `notifications`
- ✅ `push_subscriptions`

### 5. tasksテーブルの新規カラム確認

`tasks` テーブルを開き、以下のカラムが追加されていることを確認:

- ✅ `category_id` (UUID)
- ✅ `start_date` (DATE)
- ✅ `parent_task_id` (UUID)
- ✅ `sort_order` (INTEGER)
- ✅ `is_archived` (BOOLEAN)

### 6. 既存データのマイグレーション確認

`tasks` テーブルを開き、既存のタスクに `category_id` が設定されていることを確認:

```sql
SELECT 
  id, 
  title, 
  business_type, 
  category_id 
FROM tasks 
LIMIT 10;
```

`business_type` が「不動産」のタスクは、`category_id` に不動産カテゴリのUUIDが設定されているはずです。

### 7. Realtime有効化

1. 左メニューから **Database > Replication** を選択
2. `supabase_realtime` の Publication を開く
3. 以下のテーブルにチェックを入れる:
   - ✅ `tasks`
   - ✅ `activity_logs`
4. **Save** をクリック

---

## 📊 作成されたテーブル詳細

### users

auth.usersと連携するユーザー情報テーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | auth.usersのIDと同じ |
| email | TEXT | メールアドレス |
| display_name | TEXT | 表示名 |
| avatar_url | TEXT | アバター画像URL |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### categories

カテゴリテーブル（既存のbusiness_typeを置き換え）。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | カテゴリID |
| name | TEXT | カテゴリ名 |
| color | TEXT | カラーコード |
| icon | TEXT | アイコン（絵文字等） |
| sort_order | INTEGER | 表示順 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**デフォルトデータ:**
- 不動産 (#00c875)
- 人材 (#0073ea)
- 経済圏 (#9cd326)
- 結婚相談所 (#ff3d57)
- コーポレート (#fdab3d)
- その他 (#a3a3a3)

### tags

タグテーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | タグID |
| name | TEXT | タグ名 |
| color | TEXT | カラーコード |
| created_at | TIMESTAMPTZ | 作成日時 |

### task_tags

タスクとタグの中間テーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| task_id | UUID | タスクID |
| tag_id | UUID | タグID |
| created_at | TIMESTAMPTZ | 作成日時 |

### activity_logs

タスクの変更履歴テーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ログID |
| task_id | UUID | タスクID |
| user_id | UUID | ユーザーID |
| action | TEXT | アクション（created, updated, completed等） |
| field_name | TEXT | 変更されたフィールド名 |
| old_value | TEXT | 変更前の値 |
| new_value | TEXT | 変更後の値 |
| created_at | TIMESTAMPTZ | 作成日時 |

### saved_filters

保存されたフィルター設定テーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | フィルターID |
| user_id | UUID | ユーザーID |
| name | TEXT | フィルター名 |
| filter_config | JSONB | フィルター設定（JSON） |
| is_default | BOOLEAN | デフォルトフィルターか |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### recurring_tasks

繰り返しタスクテーブル（将来用）。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | レコードID |
| task_id | UUID | タスクID |
| recurrence_rule | TEXT | 繰り返しルール（RRULE形式） |
| next_occurrence | DATE | 次回発生日 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

---

## ✅ 確認項目

マイグレーション完了後、以下を確認してください:

- [ ] 新規テーブルが全て作成されている
- [ ] tasksテーブルに新しいカラムが追加されている
- [ ] 既存のタスクデータが保持されている
- [ ] 既存のタスクにcategory_idが設定されている
- [ ] categoriesテーブルにデフォルトデータが入っている
- [ ] Realtimeが有効化されている（tasks, activity_logs）

---

## 🔧 トラブルシューティング

### エラー: `relation "users" already exists`

→ すでにテーブルが作成されています。スキップしてOK。

### エラー: `column "category_id" of relation "tasks" already exists`

→ すでにカラムが追加されています。スキップしてOK。

### エラー: `foreign key constraint failed`

→ auth.usersテーブルが存在しない可能性があります。Supabase Authenticationが有効か確認してください。

### マイグレーション済みか確認する方法

以下のSQLを実行:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name IN ('category_id', 'start_date', 'parent_task_id', 'sort_order', 'is_archived');
```

5行返ってくればマイグレーション済みです。

---

## 📝 ロールバック方法

もし問題が発生した場合、以下のSQLで新規追加を削除できます:

```sql
-- 新規テーブルを削除
DROP TABLE IF EXISTS recurring_tasks CASCADE;
DROP TABLE IF EXISTS saved_filters CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- tasksテーブルの新規カラムを削除
ALTER TABLE tasks DROP COLUMN IF EXISTS category_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS start_date;
ALTER TABLE tasks DROP COLUMN IF EXISTS parent_task_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS sort_order;
ALTER TABLE tasks DROP COLUMN IF EXISTS is_archived;
```

**注意:** ロールバックすると新規データは全て削除されます！

---

## 🎉 完了！

マイグレーションが完了したら、Agent 2（Designer）に作業を引き継いでください。
