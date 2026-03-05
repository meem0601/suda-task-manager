# 🔔 通知機能セットアップ手順

## 📋 Phase 1: 通知機能 - 実装完了

### ✅ 実装済み機能
1. **通知許可プロンプト** - 初回訪問時に表示
2. **Service Worker** - バックグラウンド通知を可能に
3. **PWA対応** - アプリとしてインストール可能
4. **通知ライブラリ** - リマインダー自動チェック機能
5. **アイコン生成** - 192x192, 512x512のPWAアイコン

### 🗄️ Supabaseマイグレーション（必須）

通知機能を有効化するため、Supabaseで以下のSQLを実行してください：

#### 手順:
1. **Supabase Dashboard**を開く
   - https://supabase.com/dashboard/project/dqrnjluulchmuukfczib

2. **SQL Editor**に移動
   - 左サイドバー「SQL Editor」をクリック

3. **新規クエリ作成**
   - 「New query」ボタンをクリック

4. **SQLをコピー&ペースト**
   ```sql
   -- 通知テーブル
   CREATE TABLE IF NOT EXISTS notifications (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
       type TEXT NOT NULL CHECK (type IN ('reminder_1day', 'reminder_1hour', 'task_completed', 'task_overdue')),
       title TEXT NOT NULL,
       body TEXT NOT NULL,
       sent_at TIMESTAMP WITH TIME ZONE,
       read_at TIMESTAMP WITH TIME ZONE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- プッシュ通知購読情報テーブル
   CREATE TABLE IF NOT EXISTS push_subscriptions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       endpoint TEXT NOT NULL UNIQUE,
       p256dh TEXT NOT NULL,
       auth TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- インデックス
   CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);
   CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
   CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

   -- 更新日時の自動更新
   CREATE TRIGGER update_push_subscriptions_updated_at
       BEFORE UPDATE ON push_subscriptions
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();
   ```

5. **実行**
   - 「Run」ボタンをクリック（またはCmd/Ctrl + Enter）

6. **確認**
   - 「Success. No rows returned」と表示されればOK
   - Table Editorで `notifications` と `push_subscriptions` テーブルが作成されているか確認

### 🎯 通知の仕組み

#### 📅 リマインダータイミング
- **1日前** (23-25時間前)
- **1時間前** (0.5-1.5時間前)
- **期限切れ** (期限を過ぎた時)
- **完了通知** (タスク完了時)

#### 🔄 自動チェック
- ブラウザを開いている間、**10分ごと**に自動チェック
- リマインダー条件に合致したタスクがあれば自動で通知

#### 💡 通知の表示
1. ブラウザ通知（デスクトップ/モバイル）
2. アプリ内通知センター（今後実装予定）
3. 通知履歴の保存（Supabase）

### 📱 動作確認

1. **開発サーバー起動**
   ```bash
   npm run dev
   ```

2. **ブラウザでアクセス**
   - http://localhost:3000

3. **通知許可プロンプト**
   - 3秒後に表示される通知許可ダイアログで「通知を有効にする」をクリック

4. **テスト用タスク作成**
   - タスクを作成
   - 期限を「明日」または「1時間後」に設定
   - 10分待つ（またはブラウザをリロード）

5. **通知確認**
   - ブラウザ通知が表示されるか確認
   - Supabaseの`notifications`テーブルにレコードが作成されているか確認

### 🚀 本番デプロイ

```bash
# Vercelにデプロイ
vercel --prod

# またはGitにプッシュ（自動デプロイ）
git add .
git commit -m "feat: 通知機能実装 (Phase 1完了)"
git push origin main
```

### ⚠️ トラブルシューティング

#### 通知が表示されない
- ブラウザの通知許可を確認
- Service Workerが登録されているか確認（DevTools > Application > Service Workers）
- コンソールにエラーが出ていないか確認

#### タスクリマインダーが動作しない
- タスクに`due_date`が設定されているか確認
- タスクのステータスが「完了」以外か確認
- 10分待つか、ページをリロード

#### Supabaseマイグレーションエラー
- `update_updated_at_column()`関数が存在するか確認（schema.sqlで定義済み）
- テーブル名の重複がないか確認
- 権限エラーの場合、Service Role Keyで実行

### 📊 次のPhase予定

- **Phase 2: 繰り返しタスク** - 毎日/毎週/毎月の定期タスク
- **Phase 3: 検索機能** - 全文検索、フィルタ、ハイライト
- **Phase 4: カレンダービュー** - 月間/週間カレンダー表示
- **Phase 5: タグ機能** - タスクのタグ付けとフィルタリング

---

**実装者**: OpenClaw Agent  
**実装日**: 2026-03-05  
**所要時間**: 約30分  
**ステータス**: ✅ Phase 1 完了 → Supabaseマイグレーション待ち
