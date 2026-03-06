# Agent 2（Designer）への引継ぎメモ

## 👋 概要

Agent 1（Architect）の作業が完了しました。  
DB拡張・型定義整備・ディレクトリ構造整備を実施しました。

**作業日:** 2026-03-06  
**担当:** Agent 1 (Architect)  
**次の担当:** Agent 2 (Designer)

---

## ✅ 完了事項

### 1. DB拡張SQL作成 ✅

**ファイル:** `supabase/01-db-extension.sql`

以下のテーブルを追加するSQLを作成:
- ✅ `users` - ユーザー情報
- ✅ `categories` - カテゴリ（business_typeの置き換え）
- ✅ `tags` - タグ
- ✅ `task_tags` - タスク-タグ中間テーブル
- ✅ `activity_logs` - アクティビティログ
- ✅ `saved_filters` - 保存されたフィルター
- ✅ `recurring_tasks` - 繰り返しタスク（将来用）

既存の`tasks`テーブルに以下のカラムを追加:
- ✅ `category_id` - カテゴリID
- ✅ `start_date` - 開始日
- ✅ `parent_task_id` - 親タスクID（階層構造用）
- ✅ `sort_order` - 表示順
- ✅ `is_archived` - アーカイブ済みフラグ

### 2. 型定義ファイル整備 ✅

**ファイル:** `src/lib/types.ts`

以下の型を定義:
- ✅ Union型（TaskStatus, TaskPriority, TaskCategory等）
- ✅ データベーステーブル型（User, Category, Task, Tag等）
- ✅ フィルター設定型（FilterConfig）
- ✅ ダッシュボード統計型（DashboardStats）
- ✅ タスク拡張型（TaskWithSubtasks, TaskWithTags等）
- ✅ API関連型（CreateTaskRequest, UpdateTaskRequest等）
- ✅ UI関連型（ViewMode, SortConfig等）

**注意:** 後方互換性のため、旧優先度（「今すぐやる」「今週やる」「今月やる」）も型定義に含めました。

### 3. 定数ファイル作成 ✅

**ファイル:** `src/lib/constants.ts`

以下の定数を定義:
- ✅ STATUS_CONFIG - ステータス設定
- ✅ PRIORITY_CONFIG - 優先度設定（新旧両対応）
- ✅ CATEGORY_COLORS - カテゴリカラー設定
- ✅ KEYBOARD_SHORTCUTS - キーボードショートカット
- ✅ VIEW_CONFIG - ビュー設定
- ✅ DEFAULT_VALUES - デフォルト値
- ✅ API_ENDPOINTS - APIエンドポイント
- ✅ VALIDATION - バリデーション定数
- ✅ ERROR_MESSAGES / SUCCESS_MESSAGES - メッセージ定数

### 4. ユーティリティ関数作成 ✅

**ファイル:** `src/lib/utils.ts`

以下のユーティリティ関数を実装:
- ✅ `cn()` - クラス名結合
- ✅ `formatDate()` - 日付フォーマット
- ✅ `formatRelativeDate()` - 相対日付表示
- ✅ `getStatusColor()` - ステータス色取得
- ✅ `getPriorityColor()` - 優先度色取得
- ✅ `getCategoryColor()` - カテゴリ色取得
- ✅ `isTaskOverdue()` - 期限切れチェック
- ✅ `filterTasks()` - タスクフィルタリング
- ✅ `sortTasks()` - タスクソート
- ✅ `debounce()` / `throttle()` - デバウンス/スロットル

### 5. Supabase型定義整備 ✅

**ディレクトリ:** `src/lib/supabase/`

- ✅ `client.ts` - Supabaseクライアント設定
- ✅ `database.types.ts` - Supabase Database型定義
- ✅ `index.ts` - エクスポート集約

**後方互換性:** 既存の`lib/supabase.ts`から新しい型定義を参照するように更新。

### 6. ディレクトリ構造整備 ✅

```
src/
├── app/ (既存のまま)
├── components/
│   ├── layout/      ✅ 作成済み
│   ├── task/        ✅ 作成済み
│   ├── board/       ✅ 作成済み
│   ├── list/        ✅ 作成済み
│   ├── calendar/    ✅ 作成済み
│   ├── dashboard/   ✅ 作成済み
│   └── ui/          ✅ 作成済み
├── lib/
│   ├── supabase/    ✅ 作成済み
│   ├── store/       ✅ 作成済み
│   ├── constants.ts ✅ 作成済み
│   ├── types.ts     ✅ 作成済み
│   └── utils.ts     ✅ 作成済み
└── hooks/           ✅ 作成済み
```

### 7. ドキュメント作成 ✅

- ✅ `DB_MIGRATION_GUIDE.md` - DB拡張実行手順
- ✅ `DB_SCHEMA.md` - DBスキーマ一覧
- ✅ `AGENT2_HANDOFF.md` - 引継ぎメモ（このファイル）

### 8. TypeScriptビルド確認 ✅

`npx tsc --noEmit` でエラーなし ✅

---

## ⚠️ 未完了事項（Agent 2が実施）

### 1. DB拡張SQLの実行 ❌

**重要:** `supabase/01-db-extension.sql` をSupabase SQL Editorで実行する必要があります。

**手順:** `DB_MIGRATION_GUIDE.md` を参照

**確認項目:**
- [ ] 新規テーブルが全て作成されている
- [ ] 既存データがマイグレーション済み
- [ ] Realtime購読が有効化されている

### 2. Realtime有効化 ❌

Supabase Dashboard > Database > Replicationで以下を有効化:
- [ ] `tasks` テーブル
- [ ] `activity_logs` テーブル

### 3. UI実装 ❌

以下のUIコンポーネントを実装:
- [ ] ボードビュー（カンバン）
- [ ] カレンダービュー
- [ ] ダッシュボード（統計表示）
- [ ] タグ管理UI
- [ ] フィルター保存UI
- [ ] アクティビティログ表示
- [ ] カテゴリ管理UI

---

## 📁 主要ファイルの場所

| ファイル | パス | 説明 |
|---------|------|------|
| DB拡張SQL | `supabase/01-db-extension.sql` | Supabaseで実行するSQL |
| DBスキーマ一覧 | `DB_SCHEMA.md` | 全テーブルの詳細 |
| マイグレーションガイド | `DB_MIGRATION_GUIDE.md` | 実行手順 |
| 型定義 | `src/lib/types.ts` | 全ての型定義 |
| 定数 | `src/lib/constants.ts` | 定数・設定 |
| ユーティリティ | `src/lib/utils.ts` | ユーティリティ関数 |
| Supabaseクライアント | `src/lib/supabase/client.ts` | DB接続 |
| Supabase型定義 | `src/lib/supabase/database.types.ts` | DB型定義 |

---

## 🔧 既存コードとの互換性

### 型定義の参照方法

**既存コード（今まで通り動く）:**
```typescript
import { Task, Subtask } from '@/lib/supabase';
```

**新しいコード（推奨）:**
```typescript
import type { Task, Subtask } from '@/src/lib/types';
import { supabase } from '@/src/lib/supabase';
```

### 優先度の扱い

**旧優先度（既存データ互換）:**
- 「今すぐやる」
- 「今週やる」
- 「今月やる」

**新優先度（新規タスク推奨）:**
- 「緊急」
- 「高」
- 「中」
- 「低」

両方とも型定義に含まれているため、TypeScriptエラーは出ません。

### ステータスの変更

**旧ステータス:**
- '未着手', '進行中', '完了'

**新ステータス:**
- '未着手', '進行中', **'レビュー中'**, '完了'

「レビュー中」が追加されました。既存データには影響ありません。

---

## 🎯 Agent 2（Designer）の次のステップ

### 1. DBマイグレーション実施

1. `DB_MIGRATION_GUIDE.md` を読む
2. Supabase SQL Editorで `supabase/01-db-extension.sql` を実行
3. テーブル作成を確認
4. Realtimeを有効化

### 2. UI設計・実装

1. `DESIGN_GUIDE.md` を参照してデザインシステムを理解
2. 以下のビューを実装:
   - ボードビュー（カンバン）
   - カレンダービュー
   - ダッシュボード
3. タグ・カテゴリ管理UIを実装
4. フィルター保存機能を実装
5. アクティビティログ表示を実装

### 3. 動作確認

1. `npm run dev` でローカル起動
2. 各ビューが正しく表示されるか確認
3. タスク作成・更新・削除が動作するか確認
4. Realtime購読が動作するか確認

---

## 📝 注意事項

### 1. 既存データの保護

- 既存の`tasks`と`subtasks`のデータは全て保持されます
- business_typeデータは残したまま、category_idを追加しています
- 後方互換性を保つため、旧優先度も型定義に含めています

### 2. マイグレーション戦略

- 一気に全てのUIを新システムに移行する必要はありません
- 段階的に機能を追加していけます
- 既存のリストビューは動作し続けます

### 3. TypeScriptの型チェック

- `npx tsc --noEmit` でエラーがないことを確認済みです
- 新しいコンポーネントを追加する際は、`src/lib/types.ts` の型を使用してください

---

## 🚀 完成イメージ

Agent 2の作業完了後、以下が実現されます:

- ✅ リストビュー（既存）
- ✅ ボードビュー（カンバン、ステータスごとに列）
- ✅ カレンダービュー（期限日ベース）
- ✅ ダッシュボード（統計・グラフ表示）
- ✅ タグ機能（タスクに複数タグ付与）
- ✅ カテゴリ機能（カラフルなカテゴリ分け）
- ✅ フィルター保存機能
- ✅ アクティビティログ表示
- ✅ Realtime同期（複数タブで自動更新）

---

## 💬 質問・相談

わからないことがあれば、以下のドキュメントを参照してください:
- `DB_SCHEMA.md` - DBの詳細
- `DESIGN_GUIDE.md` - デザインガイドライン
- `README.md` - プロジェクト概要
- `src/lib/types.ts` - 型定義
- `src/lib/constants.ts` - 定数・設定

---

**引継ぎ完了！Agent 2、頑張ってください！🎨**
