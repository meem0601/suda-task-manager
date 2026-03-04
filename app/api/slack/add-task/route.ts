import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeTaskFromConversation } from '@/lib/ai-helper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Slack経由でタスクを追加するAPI
 * OpenClawから呼び出される想定
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, user_id } = body;

    // 須田様のユーザーIDチェック（セキュリティ）
    const allowedUserIds = ['U04TWL5C3T7'];
    if (!allowedUserIds.includes(user_id)) {
      return NextResponse.json(
        { error: '許可されていないユーザーです' },
        { status: 403 }
      );
    }

    // AI分析
    const analysis = await analyzeTaskFromConversation(message);
    
    if (!analysis) {
      return NextResponse.json(
        { success: false, message: 'タスクとして認識できませんでした' }
      );
    }

    // タスク作成
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          ...analysis,
          status: '未着手'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'タスクの作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      task: data,
      message: `✅ タスクを追加しました: ${analysis.title}`
    });
  } catch (error) {
    console.error('Error adding task:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
