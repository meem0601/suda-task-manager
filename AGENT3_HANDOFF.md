# Agent 3（Builder）への引継ぎメモ

## 👋 概要

Agent 2（Designer）の作業が完了しました。  
Monday.com Sidekick風のデザインシステムを実装し、ダッシュボードビューを完成させました。

**作業日:** 2026-03-06  
**前担当:** Agent 2 (Designer)  
**次の担当:** Agent 3 (Builder)

---

## ✅ Agent 2完了事項（確認済み）

### デザインシステム ✅
- ✅ レインボーグラデーション背景実装
- ✅ rainbow-borderクラス実装
- ✅ パステルカラー適用（個人: 紫、不動産: 緑、人材: 青、等）
- ✅ 大きめborder-radius（16px）
- ✅ Noto Sans JPフォント設定
- ✅ Framer Motionアニメーション

### 新規実装 ✅
- ✅ ダッシュボードページ (`app/dashboard/page.tsx`)
- ✅ WelcomeHeroコンポーネント
- ✅ DashboardStatsコンポーネント
- ✅ 完了推移グラフ（Recharts）

### 既存更新 ✅
- ✅ タスク一覧ページ（ダッシュボードリンク追加、優先度絵文字拡大）
- ✅ デザインシステムCSS（Sidekick風）
- ✅ グローバルCSS（レインボー背景）

---

## 🎯 Agent 3の役割

**ミッション:** 残りの機能実装とDB拡張の完了

### 優先順位1（必須）:

#### 1. DB拡張SQL実行 ⚠️
**重要:** これを最初に実施すること！

**手順:**
1. `DB_MIGRATION_GUIDE.md` を読む
2. Supabase SQL Editorで `supabase/01-db-extension.sql` を実行
3. 以下を確認:
   - [ ] `users` テーブル作成
   - [ ] `categories` テーブル作成
   - [ ] `tags` テーブル作成
   - [ ] `task_tags` テーブル作成
   - [ ] `activity_logs` テーブル作成
   - [ ] `saved_filters` テーブル作成
   - [ ] `recurring_tasks` テーブル作成
   - [ ] 既存`tasks`テーブルに新カラム追加
4. Realtime有効化:
   - Supabase Dashboard > Database > Replication
   - [ ] `tasks` テーブル有効化
   - [ ] `activity_logs` テーブル有効化

**確認方法:**
```sql
-- Supabase SQL Editorで実行
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### 2. ボードビュー実装

**ファイル:** `app/board/page.tsx`

**機能:**
- [ ] カンバン形式（ステータス別列）
- [ ] ドラッグ&ドロップ（react-beautiful-dnd or dnd-kit推奨）
- [ ] 列: 未着手 / 進行中 / レビュー中 / 完了
- [ ] タスクカード（パステルカラー）
- [ ] タスク追加（列ごとに）
- [ ] タスククリックで詳細モーダル

**デザイン参考:**
- 各列にパステルグラデーション背景
- カードはrounded-2xl、shadow-lg
- ドラッグ時にscale(1.05)

#### 3. カレンダービュー実装

**ファイル:** `app/calendar/page.tsx`

**機能:**
- [ ] 月表示カレンダー（react-big-calendar or FullCalendar推奨）
- [ ] 期限日ベースでタスク表示
- [ ] タスククリックで詳細モーダル
- [ ] 日付クリックで新規タスク作成（その日を期限に）
- [ ] 事業別カラーコーディング

**デザイン参考:**
- カレンダーヘッダーにパステルグラデーション
- タスクイベントはrounded-lg、小さな絵文字付き
- 今日の日付を強調（border-2 border-purple-500）

---

### 優先順位2（重要）:

#### 4. タグ機能実装

**実装箇所:**
- [ ] タグ管理UI (`app/settings/tags/page.tsx`)
- [ ] タスク詳細でタグ追加/削除
- [ ] タグフィルター（サイドバーまたはヘッダー）
- [ ] タグ一覧表示（パステルカラー背景）

**API:**
```typescript
// GET /api/tags - タグ一覧取得
// POST /api/tags - タグ作成
// DELETE /api/tags/:id - タグ削除
// POST /api/task-tags - タスクにタグ付与
// DELETE /api/task-tags - タスクからタグ削除
```

**デザイン:**
- タグバッジはrounded-full、shadow-sm
- 各タグにランダムなパステルカラー割り当て
- タグクリックでフィルター

#### 5. フィルター保存機能

**実装箇所:**
- [ ] フィルター保存モーダル (`components/SaveFilterModal.tsx`)
- [ ] 保存済みフィルター一覧（サイドバー）
- [ ] フィルター適用ボタン
- [ ] デフォルトフィルター設定

**API:**
```typescript
// GET /api/saved-filters - 保存済みフィルター取得
// POST /api/saved-filters - フィルター保存
// PUT /api/saved-filters/:id - フィルター更新
// DELETE /api/saved-filters/:id - フィルター削除
```

**デザイン:**
- フィルターカードはrounded-xl、パステル背景
- アクティブフィルターはborder-2 border-purple-500

#### 6. アクティビティログ表示

**実装箇所:**
- [ ] タスク詳細パネルにアクティビティタブ追加
- [ ] アクティビティログ一覧表示
- [ ] タイムライン形式（縦線 + アイコン）

**表示内容:**
- タスク作成
- ステータス変更
- 優先度変更
- 期限変更
- サブタスク追加/完了
- タスク完了

**デザイン:**
- アイコン: 円形、パステルグラデーション背景
- タイムライン: 紫色の縦線
- 時刻表示: 相対時刻（5分前、1時間前、等）

---

### 優先順位3（追加機能）:

#### 7. カテゴリ管理UI

**ファイル:** `app/settings/categories/page.tsx`

**機能:**
- [ ] カテゴリ一覧表示
- [ ] カテゴリ作成（名前、色、アイコン）
- [ ] カテゴリ編集
- [ ] カテゴリ削除（タスクが紐づいていない場合のみ）
- [ ] 並び替え（drag & drop）

#### 8. 検索機能強化

**実装箇所:**
- [ ] ヘッダーに検索バー追加
- [ ] タスク名、説明、タグで検索
- [ ] 検索結果ハイライト
- [ ] キーボードショートカット（Ctrl+K）

#### 9. 通知機能（プッシュ通知）

**実装箇所:**
- [ ] Service Worker登録済み（`app/components/ServiceWorkerRegistration.tsx`）
- [ ] プッシュ通知許可リクエスト
- [ ] 通知設定UI
- [ ] 期限1日前通知
- [ ] 期限1時間前通知
- [ ] タスク完了通知

---

## 📁 主要ファイルの場所

### Agent 1作成（DB関連）:
- `supabase/01-db-extension.sql` - DB拡張SQL ⚠️ 未実行
- `DB_MIGRATION_GUIDE.md` - マイグレーション手順
- `DB_SCHEMA.md` - DBスキーマ詳細
- `src/lib/types.ts` - 型定義
- `src/lib/constants.ts` - 定数
- `src/lib/utils.ts` - ユーティリティ関数

### Agent 2作成（デザイン）:
- `app/globals.css` - レインボー背景、フォント
- `app/design-system.css` - Sidekick風スタイル
- `app/layout.tsx` - Noto Sans JPフォント
- `app/dashboard/page.tsx` - ダッシュボード
- `src/components/dashboard/WelcomeHero.tsx` - ウェルカムヒーロー
- `src/components/dashboard/DashboardStats.tsx` - 統計カード

### 既存ファイル:
- `app/page.tsx` - タスク一覧（リストビュー）
- `lib/supabase.ts` - Supabaseクライアント
- `lib/validation.ts` - バリデーション

---

## 🛠️ 推奨パッケージ

### ボードビュー:
```bash
npm install @dnd-kit/core @dnd-kit/sortable
# または
npm install react-beautiful-dnd
```

### カレンダービュー:
```bash
npm install react-big-calendar
# または
npm install @fullcalendar/react @fullcalendar/daygrid
```

### 日付処理:
```bash
npm install date-fns
```

---

## 📝 実装ガイドライン

### 1. コンポーネント構造

```
src/components/
├── board/
│   ├── BoardColumn.tsx
│   ├── BoardCard.tsx
│   └── BoardView.tsx
├── calendar/
│   ├── CalendarView.tsx
│   ├── EventCard.tsx
│   └── DayCell.tsx
├── tags/
│   ├── TagManager.tsx
│   ├── TagBadge.tsx
│   └── TagFilter.tsx
└── activity/
    ├── ActivityLog.tsx
    ├── ActivityItem.tsx
    └── ActivityTimeline.tsx
```

### 2. APIルート

```
app/api/
├── tags/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (PUT, DELETE)
├── task-tags/
│   └── route.ts (POST, DELETE)
├── activity-logs/
│   └── route.ts (GET)
├── saved-filters/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (PUT, DELETE)
└── categories/
    ├── route.ts (GET, POST)
    └── [id]/route.ts (PUT, DELETE)
```

### 3. デザインシステム適用

**必ず使用するクラス:**
- カード: `card` + `rounded-2xl` + `shadow-lg`
- ボタン: `btn btn-primary` / `btn btn-secondary`
- 入力欄: `input` / `textarea` / `select`
- バッジ: `badge badge-{color}`
- アニメーション: Framer Motion（fadeIn, slideUp, scaleIn）

**カラー:**
- パステルグラデーション背景を使用
- `bg-gradient-to-br from-{color}-50 to-{color}-100`

---

## 🔍 動作確認手順

### 開発サーバー起動:
```bash
cd suda-task-manager
npm run dev
```

### チェックリスト:
- [ ] http://localhost:3000 でリストビュー表示
- [ ] http://localhost:3000/dashboard でダッシュボード表示
- [ ] レインボーグラデーション背景が見える
- [ ] ダッシュボード→タスク一覧の遷移が動作
- [ ] タスク追加モーダルが開く
- [ ] TypeScriptエラーなし（`npx tsc --noEmit`）

---

## ⚠️ 注意事項

### 1. DB拡張を最優先
- **必ずDB拡張SQLを最初に実行すること**
- 新機能（タグ、カテゴリ等）はDB拡張後にのみ動作

### 2. 既存機能を壊さない
- リストビュー、ダッシュボードは動作継続
- 既存APIルートは変更しない
- 段階的に新機能を追加

### 3. Realtime対応
- DB拡張後、必ずRealtime有効化
- タスク更新時に自動リフレッシュ確認

### 4. レスポンシブ対応
- 全ビュー（ボード、カレンダー）でモバイル対応必須
- テストデバイス: iPhone, iPad, Desktop

---

## 💬 質問・相談

わからないことがあれば、以下のドキュメントを参照:
- `DB_SCHEMA.md` - DBの詳細
- `DESIGN_GUIDE.md` - デザインガイドライン
- `src/lib/types.ts` - 型定義
- `src/lib/constants.ts` - 定数・設定
- `AGENT2_COMPLETION_REPORT.md` - Agent 2の作業内容

---

## 🎯 完成イメージ

### ボードビュー:
```
┌────────────┬────────────┬────────────┬────────────┐
│ 未着手     │ 進行中     │ レビュー中 │ 完了       │
├────────────┼────────────┼────────────┼────────────┤
│ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │
│ │ タスクA│ │ │ タスクB│ │ │ タスクC│ │ │ タスクD│ │
│ │ 🔥高    │ │ │ 🟡中   │ │ │ 📅低   │ │ │ ✅     │ │
│ └────────┘ │ └────────┘ │ └────────┘ │ └────────┘ │
│            │            │            │            │
│ + 追加     │ + 追加     │ + 追加     │            │
└────────────┴────────────┴────────────┴────────────┘
```

### カレンダービュー:
```
┌─────────────────────────────────────────────┐
│ 2026年3月                         < 今月 > │
├─────────────────────────────────────────────┤
│ 日 月 火 水 木 金 土                        │
├─────────────────────────────────────────────┤
│                    1  2  3  4  5  6  7     │
│  8  9 10 11 12 13 14                        │
│    🔥A  🟡B              ✅C                │
│ 15 16 17 18 19 20 21                        │
│ 22 23 24 25 26 27 28                        │
│ 29 30 31                                    │
└─────────────────────────────────────────────┘
```

---

**引継ぎ完了！Agent 3、頑張ってください！💪**

---

**作成者:** Agent 2 (Designer)  
**作成日:** 2026-03-06  
**ステータス:** Ready for Agent 3
