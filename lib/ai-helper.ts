// AI判断ヘルパー関数

export interface TaskAnalysis {
  title: string;
  description?: string;
  category: '個人' | '事業';
  business_type?: '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート' | 'その他';
  priority?: '今すぐやる' | '今週やる' | '今月やる' | '高' | '中' | '低';
  ai_priority_score: number;
  ai_suggestion?: string;
}

/**
 * 会話からタスク情報を抽出・分析
 * @param conversation 会話内容
 * @returns タスク分析結果
 */
export async function analyzeTaskFromConversation(conversation: string): Promise<TaskAnalysis | null> {
  // TODO: OpenClaw Gateway経由でGeminiにリクエスト
  // ここでは簡易的な実装（キーワードマッチング）
  
  const lowerConv = conversation.toLowerCase();
  
  // タスク抽出のキーワード
  const taskKeywords = ['やる', 'する', 'やらな', '進める', 'やりたい', '欲しい', '作る', '作りたい'];
  const hasTaskKeyword = taskKeywords.some(keyword => lowerConv.includes(keyword));
  
  if (!hasTaskKeyword) {
    return null;
  }

  // カテゴリ判定
  const businessKeywords = ['不動産', '人材', '経済圏', '結婚相談所', 'meem', '事業'];
  const isBusinessTask = businessKeywords.some(keyword => lowerConv.includes(keyword));
  
  let business_type: TaskAnalysis['business_type'];
  if (lowerConv.includes('不動産')) business_type = '不動産';
  else if (lowerConv.includes('人材')) business_type = '人材';
  else if (lowerConv.includes('経済圏')) business_type = '経済圏';
  else if (lowerConv.includes('結婚相談所') || lowerConv.includes('ワタシ婚')) business_type = '結婚相談所';
  else if (lowerConv.includes('コーポレート')) business_type = 'コーポレート';

  // 優先度判定
  let priority: TaskAnalysis['priority'];
  let ai_priority_score = 50;
  
  if (lowerConv.includes('今すぐ') || lowerConv.includes('緊急') || lowerConv.includes('至急')) {
    priority = '今すぐやる';
    ai_priority_score = 95;
  } else if (lowerConv.includes('今週') || lowerConv.includes('週内')) {
    priority = '今週やる';
    ai_priority_score = 75;
  } else if (lowerConv.includes('今月') || lowerConv.includes('月内')) {
    priority = '今月やる';
    ai_priority_score = 60;
  } else if (lowerConv.includes('重要') || lowerConv.includes('大事')) {
    priority = '高';
    ai_priority_score = 80;
  }

  // タイトル抽出（簡易版）
  const title = conversation.substring(0, 100);

  return {
    title,
    description: conversation.length > 100 ? conversation : undefined,
    category: isBusinessTask ? '事業' : '個人',
    business_type,
    priority,
    ai_priority_score,
    ai_suggestion: '会話の文脈から具体的な最初の一歩を提案します'
  };
}

/**
 * 優先順位スコアを計算
 * @param task タスク情報
 * @returns 優先順位スコア (1-100)
 */
export function calculatePriorityScore(task: Partial<TaskAnalysis>): number {
  let score = 50; // ベーススコア

  // 優先度による加点
  switch (task.priority) {
    case '今すぐやる': score = 95; break;
    case '今週やる': score = 75; break;
    case '今月やる': score = 60; break;
    case '高': score = 80; break;
    case '中': score = 50; break;
    case '低': score = 30; break;
  }

  return Math.max(1, Math.min(100, score));
}

/**
 * 最初の一歩を提案
 * @param task タスク情報
 * @returns 提案テキスト
 */
export function suggestFirstStep(task: Partial<TaskAnalysis>): string {
  // TODO: AI生成に置き換え
  // ここでは簡易的な提案
  
  const suggestions = [
    'まずは現状を整理して、必要な情報をリストアップしましょう',
    '関係者に状況を確認して、優先順位を決めましょう',
    '小さく始められる部分から手をつけてみましょう',
    'タスクを細分化して、15分でできることから始めましょう'
  ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}
