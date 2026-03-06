# 🔄 Agent 4: Polisher - 引継ぎドキュメント

**作成日時:** 2026-03-06  
**担当:** Agent 3 → Agent 4  
**ステータス:** 🟢 引継ぎ準備完了

---

## 📋 前Agent（Agent 3）の完了内容

### ✅ 実装完了項目

- **Phase 1:** ボードビュー（カンバン）実装完了
- **Phase 2:** ダッシュボード改善完了
- **Phase 3:** カレンダービュー実装完了
- **Phase 4:** 検索・フィルター機能実装完了
- **Phase 5:** ビュー切替実装完了
- **Phase 6:** Zustand Store整備完了
- **Phase 7:** Realtime同期実装完了

### 📁 新規作成ファイル（15個）

**ビュー:**
- `app/board/page.tsx`
- `app/calendar/page.tsx`

**コンポーネント:**
- `app/components/board/BoardColumn.tsx`
- `app/components/board/TaskCard.tsx`
- `app/components/filters/FilterBar.tsx`
- `app/components/layout/ViewSwitcher.tsx`
- `src/components/dashboard/TodayTasks.tsx`
- `src/components/dashboard/OverdueAlert.tsx`
- `src/components/dashboard/CategorySummary.tsx`
- `src/components/dashboard/CompletionChart.tsx`

**Store・Hooks:**
- `lib/store/taskStore.ts`
- `lib/store/filterStore.ts`
- `app/hooks/useFilters.ts`
- `app/hooks/useTasks.ts`

**更新ファイル:**
- `app/page.tsx` - ViewSwitcher追加
- `app/dashboard/page.tsx` - 新ウィジェット統合

---

## 🎯 Agent 4のミッション

### Phase 8: パフォーマンス最適化 🎯 重要

**目的:** 100件以上のタスクでもスムーズに動作するように最適化する

#### 8-1. コード分割（Code Splitting）

**対象コンポーネント:**
- `CompletionChart` - Rechartsが重い
- `FilterBar` - 大きなフィルターUI
- `BoardColumn` - DnDライブラリが重い

**実装方法:**
```typescript
// 遅延ロード + Suspense
import dynamic from 'next/dynamic';

const CompletionChart = dynamic(
  () => import('@/src/components/dashboard/CompletionChart'),
  { 
    loading: () => <div className="spinner" />,
    ssr: false // クライアントサイドのみ
  }
);
```

**期待効果:**
- 初回ロード時間 -30%
- TTI（Time to Interactive）改善

#### 8-2. メモ化（Memoization）

**対象:**
- タスクリストのフィルタリング結果
- ソート結果
- カテゴリ別集計

**実装方法:**
```typescript
// useFilters.ts
const filteredTasks = useMemo(() => {
  // フィルタリングロジック
}, [tasks, filters]);

// TaskCard.tsx
export default React.memo(TaskCard, (prev, next) => {
  return prev.task.id === next.task.id && 
         prev.task.updated_at === next.task.updated_at;
});
```

**対象ファイル:**
- `app/hooks/useFilters.ts` - useMemo追加
- `app/components/board/TaskCard.tsx` - React.memo化
- `src/components/dashboard/*` - 重い計算をuseMemo化

#### 8-3. 仮想化（Virtualization）

**目的:** 大量タスク（100件以上）の描画を最適化

**ライブラリ:** `react-window` または `@tanstack/react-virtual`

**実装箇所:**
- リストビューのテーブル（app/page.tsx）
- カレンダーのタスク一覧モーダル

**実装例:**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <TaskRow task={tasks[index]} />
    </div>
  )}
</FixedSizeList>
```

---

### Phase 9: アクセシビリティ改善 🎯 重要

**目的:** WCAG 2.1 AA準拠を目指す

#### 9-1. ARIA属性追加

**対象:**
- モーダル: `role="dialog"`, `aria-labelledby`, `aria-describedby`
- ボタン: `aria-label` （アイコンのみのボタン）
- フィルター: `aria-expanded`, `aria-controls`

**実装例:**
```typescript
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <h2 id="modal-title">タスク詳細</h2>
  <p id="modal-description">...</p>
</div>
```

#### 9-2. キーボード操作対応

**実装内容:**
- タスク一覧: `↑` `↓` で選択移動
- モーダル: `Esc`で閉じる、`Tab`でフォーカス移動
- フィルター: `Enter`で適用
- ボードビュー: キーボードでドラッグ操作（`@dnd-kit/keyboard-sensors`）

**実装例:**
```typescript
import { KeyboardSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor)
);
```

#### 9-3. スクリーンリーダー対応

**実装内容:**
- ライブリージョン: `aria-live="polite"` でタスク追加通知
- ステータス変更: 音声フィードバック
- フォーム: labelとinputの関連付け

---

### Phase 10: エラーハンドリング 🎯 重要

#### 10-1. Error Boundary追加

**実装ファイル:**
- `app/components/ErrorBoundary.tsx`

**実装内容:**
```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>エラーが発生しました</h2>
          <button onClick={() => window.location.reload()}>
            リロード
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**適用箇所:**
- `app/layout.tsx` - アプリ全体
- `app/board/page.tsx` - ボードビュー
- `app/dashboard/page.tsx` - ダッシュボード

#### 10-2. Toast通知実装

**ライブラリ:** `react-hot-toast` または `sonner`

**実装内容:**
- タスク追加成功: 成功トースト
- タスク削除成功: 成功トースト
- エラー発生: エラートースト
- ネットワークエラー: ネットワークエラートースト

**実装例:**
```typescript
import toast from 'react-hot-toast';

// 成功
toast.success('タスクを追加しました');

// エラー
toast.error('タスクの追加に失敗しました');

// カスタム
toast.custom((t) => (
  <div className={`toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
    <span>カスタム通知</span>
  </div>
));
```

#### 10-3. ネットワークエラー対応

**実装内容:**
- オフライン検知: `navigator.onLine`
- リトライ機能: exponential backoff
- タイムアウト処理

**実装例:**
```typescript
const fetchWithRetry = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

---

### Phase 11: 最終QA 🎯 必須

#### 11-1. 全ビューの動作確認

**チェックリスト:**
- [ ] リストビュー: タスク追加・編集・削除が動作する
- [ ] ボードビュー: DnDが動作する、ステータス更新される
- [ ] カレンダービュー: タスクが表示される、日付クリックでモーダル表示
- [ ] ダッシュボード: 全ウィジェットが表示される、データが正しい
- [ ] フィルター: AND条件で絞り込みできる
- [ ] ビュー切替: スムーズに切り替わる
- [ ] Realtime同期: 他のブラウザでの変更が反映される

#### 11-2. レスポンシブテスト

**対象デバイス:**
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px以上)

**確認項目:**
- [ ] レイアウト崩れがない
- [ ] タッチ操作が正常
- [ ] フォントサイズが適切
- [ ] ボタンのタップエリアが十分（44px以上）

#### 11-3. ブラウザ互換性テスト

**対象ブラウザ:**
- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）

#### 11-4. パフォーマンス計測

**計測ツール:**
- Lighthouse（Chrome DevTools）
- WebPageTest

**目標値:**
- [ ] Performance: 90+
- [ ] Accessibility: 100
- [ ] Best Practices: 100
- [ ] SEO: 90+
- [ ] FCP: < 1.5s
- [ ] LCP: < 2.5s
- [ ] CLS: < 0.1

---

## 🚨 既知の問題・改善余地

### 1. フィルター保存機能のUI

**現状:** localStorage保存のみ（UIなし）

**改善案:**
```typescript
// FilterBar.tsx に追加
<div className="saved-filters">
  <h4>保存済みフィルター</h4>
  {savedFilters.map((filter) => (
    <button onClick={() => loadFilter(filter.id)}>
      {filter.name}
    </button>
  ))}
  <button onClick={() => saveFilter(prompt('名前を入力'))}>
    現在のフィルターを保存
  </button>
</div>
```

### 2. ドラッグ中のアニメーション

**現状:** シンプルな opacity 変更のみ

**改善案:**
- ドラッグ中のカードを半透明化
- ドロップ先のカラムをハイライト
- アニメーションのイージング調整

### 3. カレンダーの週間・日間ビュー

**現状:** 月間ビューのみ

**改善案:**
- 週間ビュー追加
- 日間ビュー追加
- ビュー切替ボタン追加

### 4. タスクの並べ替え（ソート）

**現状:** created_at降順のみ

**改善案:**
- ソート条件選択UI追加
- ドラッグでソート順変更（リストビュー）

---

## 📦 必要なライブラリ追加

### パフォーマンス最適化
```bash
npm install react-window @types/react-window
# または
npm install @tanstack/react-virtual
```

### トースト通知
```bash
npm install react-hot-toast
# または
npm install sonner
```

### キーボードセンサー（DnD）
```bash
# @dnd-kit/coreに含まれているので追加不要
```

---

## 🎨 デザイン指針

### 継続すべきSidekick風デザイン

**カード:**
- 白背景（`bg-white`）
- 大きめborder-radius（`rounded-xl`, `rounded-2xl`）
- 柔らかい影（`shadow-lg`）
- スムーズなトランジション

**カラーパレット（変更なし）:**
- 不動産: `#10B981`
- 人材: `#3B82F6`
- 結婚相談所: `#F43F5E`
- コーポレート: `#F59E0B`
- 経済圏: `#84CC16`
- 個人: `#A855F7`

**アニメーション:**
- Framer Motion継続使用
- 控えめで滑らか
- 遅延を適度に設定（0.1s刻み）

---

## 📝 実装の優先順位

### 必須（Phase 11: 最終QA）
1. ✅ 全ビューの動作確認
2. ✅ レスポンシブテスト
3. ✅ ブラウザ互換性テスト

### 重要（Phase 8: パフォーマンス）
4. ⚡ コード分割
5. ⚡ メモ化
6. ⚡ 仮想化（タスク100件以上の場合）

### 重要（Phase 10: エラーハンドリング）
7. 🚨 Error Boundary追加
8. 🚨 Toast通知実装
9. 🚨 ネットワークエラー対応

### 推奨（Phase 9: アクセシビリティ）
10. ♿ ARIA属性追加
11. ♿ キーボード操作対応
12. ♿ スクリーンリーダー対応

### オプション（改善余地）
13. 💎 フィルター保存UI
14. 💎 ドラッグアニメーション改善
15. 💎 カレンダー週間・日間ビュー

---

## 🛠️ 開発Tips

### 1. 既存コードを壊さない

**確認方法:**
```bash
# ビルドエラーチェック
npm run build

# 型エラーチェック
npx tsc --noEmit
```

### 2. パフォーマンス計測

**Chrome DevTools:**
1. Performance タブ
2. Record ボタン
3. タスク一覧を開く
4. Stop & 結果確認

**React DevTools Profiler:**
1. Profiler タブ
2. Record
3. 操作
4. Stop & flamegraph確認

### 3. アクセシビリティチェック

**ツール:**
- Lighthouse（Chrome DevTools）
- axe DevTools（Chrome拡張）
- WAVE（Chrome拡張）

---

## ✅ 完了条件

Agent 4の完了条件は以下の通り：

- [ ] **Phase 8:** パフォーマンス最適化完了
  - [ ] コード分割実装
  - [ ] メモ化実装
  - [ ] 仮想化実装（必要に応じて）

- [ ] **Phase 9:** アクセシビリティ改善完了
  - [ ] ARIA属性追加
  - [ ] キーボード操作対応
  - [ ] スクリーンリーダー対応

- [ ] **Phase 10:** エラーハンドリング完了
  - [ ] Error Boundary追加
  - [ ] Toast通知実装
  - [ ] ネットワークエラー対応

- [ ] **Phase 11:** 最終QA完了
  - [ ] 全ビュー動作確認
  - [ ] レスポンシブテスト
  - [ ] ブラウザ互換性テスト
  - [ ] パフォーマンス計測（Lighthouse 90+）

- [ ] **ドキュメント作成**
  - [ ] AGENT4_COMPLETION_REPORT.md
  - [ ] USER_GUIDE.md（ユーザーガイド）
  - [ ] DEPLOYMENT_GUIDE.md（デプロイガイド）

---

## 📄 参考資料

### Agent 1-3の成果物
- `AGENT1_COMPLETION_REPORT.md` - DB拡張・型定義
- `AGENT2_COMPLETION_REPORT.md` - Sidekick風デザイン
- `AGENT3_COMPLETION_REPORT.md` - コア機能実装（本レポート）

### 技術ドキュメント
- `DB_SCHEMA.md` - データベーススキーマ
- `DESIGN_GUIDE.md` - デザインガイド
- `src/lib/types.ts` - 型定義ファイル

### 外部リンク
- [@dnd-kit公式](https://dndkit.com/)
- [Zustand公式](https://zustand-demo.pmnd.rs/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Window](https://react-window.vercel.app/)

---

## 💬 メッセージ

Agent 4（Polisher）へ：

お疲れ様です！Agent 3（Builder）です。

コア機能の実装が完了しました。全てのビューが正常に動作し、ビルドエラーもありません。

あなたのミッションは「磨き上げ」です。パフォーマンス最適化、アクセシビリティ改善、エラーハンドリングを実装して、プロダクションレディな状態に仕上げてください。

特に重要なのは：
1. **パフォーマンス:** 100件以上のタスクでもスムーズに
2. **アクセシビリティ:** 全てのユーザーが使いやすく
3. **エラーハンドリング:** 予期せぬエラーにも優雅に対応

頑張ってください！🚀

---

**作成者:** Agent 3 (Builder)  
**作成日:** 2026-03-06  
**ステータス:** 🟢 引継ぎ準備完了
