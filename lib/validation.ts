/**
 * 入力バリデーションユーティリティ
 * QA推奨: 入力値の検証を一元管理
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * タスクタイトルのバリデーション
 */
export function validateTaskTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'タイトルを入力してください' };
  }

  if (title.length > 100) {
    return { valid: false, error: 'タイトルは100文字以内で入力してください' };
  }

  // 制御文字チェック
  if (/[\x00-\x1F]/.test(title)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  return { valid: true };
}

/**
 * タスク説明のバリデーション
 */
export function validateTaskDescription(description?: string): ValidationResult {
  if (!description) {
    return { valid: true }; // 説明は任意
  }

  if (description.length > 1000) {
    return { valid: false, error: '説明は1000文字以内で入力してください' };
  }

  // 制御文字チェック
  if (/[\x00-\x1F]/.test(description)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  return { valid: true };
}

/**
 * サブタスクタイトルのバリデーション
 */
export function validateSubtaskTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'サブタスクのタイトルを入力してください' };
  }

  if (title.length > 50) {
    return { valid: false, error: 'サブタスクのタイトルは50文字以内で入力してください' };
  }

  // 制御文字チェック
  if (/[\x00-\x1F]/.test(title)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  return { valid: true };
}

/**
 * タスク全体のバリデーション
 */
export function validateTask(task: {
  title: string;
  description?: string;
  category: string;
  business_type?: string;
  priority?: string;
}): ValidationResult {
  // タイトル検証
  const titleValidation = validateTaskTitle(task.title);
  if (!titleValidation.valid) {
    return titleValidation;
  }

  // 説明検証
  const descriptionValidation = validateTaskDescription(task.description);
  if (!descriptionValidation.valid) {
    return descriptionValidation;
  }

  // カテゴリ検証
  if (!['個人', '事業'].includes(task.category)) {
    return { valid: false, error: '不正なカテゴリです' };
  }

  // 事業種別検証（事業の場合）
  if (task.category === '事業' && task.business_type) {
    const validBusinessTypes = ['不動産', '人材', '経済圏', '結婚相談所', 'コーポレート', 'その他'];
    if (!validBusinessTypes.includes(task.business_type)) {
      return { valid: false, error: '不正な事業種別です' };
    }
  }

  // 優先度検証
  if (task.priority) {
    const validPriorities = ['今すぐやる', '今週やる', '今月やる', '高', '中', '低'];
    if (!validPriorities.includes(task.priority)) {
      return { valid: false, error: '不正な優先度です' };
    }
  }

  return { valid: true };
}

/**
 * XSS対策: HTMLタグを除去
 * 注: Reactは自動的にエスケープするが、念のため
 */
export function sanitizeHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * 危険な文字列パターンをチェック
 */
export function containsDangerousPattern(text: string): boolean {
  // SQLインジェクションパターン（Supabaseは自動防御するが念のため）
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i;
  
  // XSSパターン
  const xssPatterns = /<script|javascript:|onerror=|onload=/i;
  
  return sqlPatterns.test(text) || xssPatterns.test(text);
}
