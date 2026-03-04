# 須田様専用タスク管理システム

AIがサポートする、パーソナライズされたタスク管理ツール

## ✨ 特徴

- 🤖 **AI自動判断**: 会話から優先度を自動判断
- 💡 **最初の一歩提案**: タスクごとに具体的なアクションを提案
- 📱 **Slack連携**: チャットで話すだけでタスク追加
- ☀️ **毎朝まとめ配信**: 今日やるべきことを自動で整理
- 📊 **カテゴリ分類**: 個人/事業でタスクを整理

## 🚀 セットアップ

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com) で新規プロジェクト作成
2. SQL Editorで `supabase/schema.sql` を実行
3. Settings > API から以下を取得:
   - Project URL
   - anon public key
   - service_role key

### 2. 環境変数設定

`.env.local` を編集:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス

### 4. Vercelデプロイ

```bash
vercel --prod
```

環境変数を忘れずに設定！

## 📡 API エンドポイント

### タスク追加（Slack連携用）
```
POST /api/slack/add-task
Body: { message: string, user_id: string }
```

### 毎朝のまとめ取得
```
GET /api/daily-summary
```

### タスク一覧取得
```
GET /api/tasks?status=未着手&category=事業
```

### タスク作成
```
POST /api/tasks
Body: { title, description, category, ... }
```

## 🔧 OpenClaw連携

### Slack自動追加

OpenClawのセッションから以下のようにタスク追加:

```javascript
// 須田様との会話からタスクを検出したら
const response = await fetch('https://your-app.vercel.app/api/slack/add-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: conversation,
    user_id: 'U04TWL5C3T7'
  })
});
```

### 毎朝配信（cron設定）

OpenClaw cronで毎朝8:00に実行:

```json
{
  "name": "須田様タスクまとめ配信",
  "schedule": { "kind": "cron", "expr": "0 8 * * *", "tz": "Asia/Tokyo" },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "須田様のタスク管理システムから今日のタスクまとめを取得して、Slackに送信してください"
  }
}
```

## 📝 タスクのデータ構造

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  category: '個人' | '事業';
  business_type?: '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート';
  priority?: '今すぐやる' | '今週やる' | '今月やる' | '高' | '中' | '低';
  ai_priority_score: number; // 1-100
  ai_suggestion?: string;
  status: '未着手' | '進行中' | '完了';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
```

## 🎯 今後の拡張予定

- [ ] AI優先順位判断の精度向上（Gemini連携）
- [ ] タスク完了機能
- [ ] タスク編集機能
- [ ] カレンダー連携
- [ ] 週次レポート
- [ ] タスクの依存関係管理

---

Made with 💕 for 須田様
