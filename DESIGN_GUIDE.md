# 須田タスク管理 - デザインガイドライン

## 🎯 デザインコンセプト

**目標:** 月3000円で売れるレベルのプロフェッショナルなプロダクトデザイン

**参考プロダクト:**
- **Notion** - 洗練されたミニマリズム、シンプルで美しいUI
- **Linear** - モダンなダークモード対応、スムーズなアニメーション
- **Monday.com** - カラフルで親しみやすい、視覚的な分かりやすさ
- **Figma** - シンプルで機能的、無駄のないデザイン

---

## 🎨 カラーシステム

### プライマリカラー（ブルー）
プロフェッショナルで信頼感のあるブルーをブランドカラーとして使用。

```css
--color-primary-500: #3b82f6  /* メインの青 */
--color-primary-600: #2563eb  /* ホバー状態 */
--color-primary-700: #1d4ed8  /* アクティブ状態 */
```

**使用例:**
- プライマリボタン
- フォーカスリング
- アクティブ状態のナビゲーション

### セカンダリカラー（パープル）
個人タスク用のアクセントカラー。

```css
--color-secondary-500: #a855f7
--color-secondary-600: #9333ea
```

### 事業カラー（Monday.com風）
各事業を視覚的に区別するためのカラフルなパレット。

- **不動産:** `#00c875` (グリーン)
- **人材:** `#0073ea` (ブルー)
- **結婚相談所:** `#ff3d57` (レッド)
- **コーポレート:** `#fdab3d` (オレンジ)
- **経済圏:** `#9cd326` (ライム)

### ステータスカラー
- **完了:** `#22c55e` (グリーン)
- **進行中:** `#3b82f6` (ブルー)
- **未着手:** `#a3a3a3` (グレー)
- **期限切れ:** `#ef4444` (レッド)

### ニュートラルカラー（グレースケール）
テキスト、背景、ボーダーに使用。

```css
--text-primary: #171717      /* メインテキスト */
--text-secondary: #525252    /* サブテキスト */
--text-tertiary: #737373     /* 補足テキスト */

--bg-primary: #ffffff        /* メイン背景 */
--bg-secondary: #fafafa      /* セカンダリ背景 */
--border-primary: #e5e5e5    /* ボーダー */
```

---

## 📐 スペーシングシステム

4pxグリッドシステムを採用。

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px   /* 基準サイズ */
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

**使い方:**
- 要素間の余白は基本的に `--space-4` (16px) を使用
- 小さい余白は `--space-2` (8px)、`--space-3` (12px)
- 大きいセクション分けは `--space-8` (32px) 以上

---

## 🔤 タイポグラフィ

### フォントファミリー
システムフォントスタックを使用（高速で美しい表示）

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
```

### フォントサイズスケール

| サイズ | 用途 | CSS変数 |
|--------|------|---------|
| 12px | キャプション、バッジ | `--font-size-xs` |
| 14px | ボタン、小さいテキスト | `--font-size-sm` |
| 16px | 本文（基準） | `--font-size-base` |
| 18px | リード文 | `--font-size-lg` |
| 20px | 小見出し | `--font-size-xl` |
| 24px | セクション見出し | `--font-size-2xl` |
| 30px | ページタイトル | `--font-size-3xl` |
| 36px | ヒーロータイトル | `--font-size-4xl` |

### フォントウェイト

- **Regular (400):** 本文
- **Medium (500):** ボタン、ナビゲーション
- **Semibold (600):** 小見出し、強調
- **Bold (700):** ページタイトル、重要な見出し

---

## 📦 コンポーネント

### ボタン

#### Primary Button（プライマリボタン）
```html
<button class="btn btn-primary">
  保存する
</button>
```

**特徴:**
- 背景: `primary-600`
- ホバー: `primary-700` + シャドウ拡大
- 最小高さ: 44px（タッチターゲット確保）
- トランジション: 200ms

#### Secondary Button
```html
<button class="btn btn-secondary">
  キャンセル
</button>
```

#### Danger Button
```html
<button class="btn btn-danger">
  削除
</button>
```

#### Ghost Button
```html
<button class="btn-ghost">
  詳細
</button>
```

**サイズバリエーション:**
- `btn-sm` - 小サイズ（36px）
- デフォルト - 標準（44px）
- `btn-lg` - 大サイズ（52px）

---

### カード

#### 基本カード
```html
<div class="card">
  <!-- コンテンツ -->
</div>
```

#### インタラクティブカード
```html
<div class="card-interactive">
  <!-- クリック可能なカード -->
</div>
```

**特徴:**
- 背景: 白
- ボーダー: `1px solid neutral-200`
- 角丸: `12px` (xl)
- シャドウ: `shadow-sm`
- ホバー時: `shadow-md` + ボーダー色変化
- アクティブ時: 0.99倍にスケール

---

### バッジ

```html
<span class="badge badge-primary">ラベル</span>
<span class="badge badge-success">完了</span>
<span class="badge badge-warning">注意</span>
<span class="badge badge-danger">緊急</span>
```

**特徴:**
- 角丸: フル（pill型）
- パディング: 横12px、縦4px
- フォントサイズ: 12px
- フォントウェイト: Medium (500)

---

### 入力フィールド

```html
<input type="text" class="input" placeholder="入力してください">
<textarea class="textarea" rows="4"></textarea>
<select class="select">
  <option>選択肢</option>
</select>
```

**特徴:**
- 最小高さ: 44px
- ボーダー: `1px solid neutral-300`
- フォーカス時: `ring-2 ring-primary-500`
- ホバー時: ボーダー色を `neutral-400` に変更
- トランジション: 200ms

---

### ステータスピル

```html
<span class="status-pill status-done">完了</span>
<span class="status-pill status-progress">進行中</span>
<span class="status-pill status-todo">未着手</span>
```

**特徴:**
- 最小幅: 80px（統一感）
- 中央揃え
- フォントウェイト: Semibold (600)
- フォントサイズ: 12px

---

### モーダル

```html
<div class="modal-backdrop">
  <div class="modal-content">
    <h2>モーダルタイトル</h2>
    <!-- コンテンツ -->
  </div>
</div>
```

**特徴:**
- バックドロップ: 黒50% + ぼかし
- コンテンツ: 白背景、角丸16px
- 最大幅: 672px (2xl)
- 最大高さ: 90vh（スクロール可能）
- アニメーション: フェードイン + スライドアップ

---

## 🎭 マイクロインタラクション

### ホバー効果
すべてのインタラクティブ要素にホバー効果を追加。

```css
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**例:**
- ボタン: 背景色変化 + シャドウ拡大
- カード: シャドウ拡大 + ボーダー色変化
- リンク: テキスト色変化

### クリックフィードバック
アクティブ状態で視覚的フィードバック。

```css
active:scale-[0.99]
```

### ローディング状態
```html
<div class="spinner spinner-md"></div>
```

3サイズ: `spinner-sm` (16px), `spinner-md` (32px), `spinner-lg` (48px)

### アニメーション

**フェードイン:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**スライドアップ:**
```css
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}
```

**パルス（ソフト）:**
```css
.animate-pulse-soft {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 📱 レスポンシブデザイン

### ブレークポイント

```css
/* Tailwind デフォルト */
sm: 640px   /* スマホ（横向き）〜 */
md: 768px   /* タブレット〜 */
lg: 1024px  /* PC〜 */
xl: 1280px  /* 大画面〜 */
```

### モバイル最適化

**1. タッチターゲット:**
すべてのボタン・リンクは **最低44px × 44px** を確保。

```css
.btn {
  min-height: 44px;
}
```

**2. 余白の調整:**
モバイルでは余白を少し小さく。

```css
/* PC: p-6 (24px) */
/* Mobile: p-4 (16px) */
```

**3. フォントサイズ:**
モバイルでは可読性を優先。

```css
/* 本文: 16px（変更なし） */
/* 見出し: 少し小さめに */
```

**4. カード型レイアウト:**
モバイルではテーブルの代わりにカード型レイアウトを表示。

---

## ♿ アクセシビリティ

### コントラスト比

**WCAG AA準拠:**
- 通常テキスト: 4.5:1 以上
- 大きいテキスト: 3:1 以上

**実装:**
- プライマリテキスト: `neutral-900` on `white` → 21:1 ✅
- セカンダリテキスト: `neutral-600` on `white` → 7:1 ✅

### フォーカスリング

すべてのインタラクティブ要素に明確なフォーカスリング。

```css
*:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

### キーボードナビゲーション

- Tab: 次の要素へ
- Shift + Tab: 前の要素へ
- Enter / Space: ボタンの実行
- Escape: モーダルを閉じる

### セマンティックHTML

```html
<button>ボタン</button>  ✅
<div onclick="">ボタン</div>  ❌

<nav>ナビゲーション</nav>  ✅
<main>メインコンテンツ</main>  ✅
```

### ARIAラベル

```html
<button aria-label="サイドバーを開閉">☰</button>
<button aria-label="閉じる">×</button>
```

---

## 🎨 使用例

### タスクカード（モバイル）

```html
<div class="card-interactive p-4">
  <div class="flex items-start gap-3 mb-3">
    <div class="accent-bar accent-fudosan"></div>
    <div class="flex-1">
      <h4 class="font-semibold text-neutral-900 mb-1">
        タスクのタイトル
      </h4>
      <p class="text-sm text-neutral-600 truncate-2">
        タスクの説明文がここに入ります
      </p>
    </div>
  </div>
  
  <div class="flex flex-wrap gap-2">
    <span class="status-pill status-progress">進行中</span>
    <span class="badge badge-primary">不動産</span>
    <span class="badge badge-warning">⚡ 今週やる</span>
  </div>
</div>
```

### モーダル

```html
<div class="modal-backdrop">
  <div class="modal-content">
    <div class="flex items-start justify-between mb-6">
      <h2 class="text-2xl font-bold text-neutral-900">
        新しいタスクを追加
      </h2>
      <button class="btn-ghost p-2" aria-label="閉じる">
        <svg>...</svg>
      </button>
    </div>
    
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-semibold text-neutral-700 mb-2">
          タスク名 <span class="text-danger-500">*</span>
        </label>
        <input type="text" class="input" placeholder="例: 資料作成">
      </div>
      <!-- その他のフィールド -->
    </div>
    
    <div class="flex gap-3 mt-8">
      <button class="btn btn-secondary flex-1">キャンセル</button>
      <button class="btn btn-primary flex-1">追加する</button>
    </div>
  </div>
</div>
```

---

## 🚀 パフォーマンス

### CSS最適化
- Tailwind CSS v4の自動Purge機能で未使用CSSを削除
- カスタムプロパティでテーマ管理
- レイヤー化でカスケード最適化

### アニメーション
- `transform` と `opacity` のみ使用（GPU加速）
- `will-change` の乱用を避ける
- `cubic-bezier` で自然なイージング

### 画像
- SVGアイコンを優先（軽量・スケーラブル）
- 必要に応じて WebP を使用

---

## 📚 参考リソース

- **Tailwind CSS:** https://tailwindcss.com/
- **Radix Colors:** https://www.radix-ui.com/colors
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design:** https://m3.material.io/
- **Apple Human Interface Guidelines:** https://developer.apple.com/design/

---

## ✅ チェックリスト

デザイン実装時の確認項目：

- [ ] カラーパレットに従っているか
- [ ] スペーシングは4pxグリッドか
- [ ] タッチターゲットは44px以上か
- [ ] コントラスト比はAA準拠か
- [ ] フォーカスリングは明確か
- [ ] ホバー効果は実装されているか
- [ ] モバイルでの見た目を確認したか
- [ ] アニメーションは自然か（200-300ms）
- [ ] ローディング状態はあるか
- [ ] エラー状態の表示は適切か

---

**作成日:** 2026-03-06  
**バージョン:** 1.0  
**ステータス:** 完成 ✅
