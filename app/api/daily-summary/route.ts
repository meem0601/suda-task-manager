import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 毎朝のタスクまとめAPI
 * OpenClaw cronから呼び出される想定
 */
export async function GET(req: NextRequest) {
  try {
    // 未着手・進行中のタスクを優先順位順に取得
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['未着手', '進行中'])
      .order('ai_priority_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'タスクの取得に失敗しました' },
        { status: 500 }
      );
    }

    // タスクをカテゴリ別に分類
    const personalTasks = tasks?.filter(t => t.category === '個人') || [];
    const businessTasks = tasks?.filter(t => t.category === '事業') || [];

    // Slack用のフォーマット済みメッセージを生成
    let message = '☀️ **おはようございます、須田様！**\n\n';
    message += '📋 **今日のタスクまとめ**\n\n';

    if (personalTasks.length > 0) {
      message += '**【個人タスク】**\n';
      personalTasks.slice(0, 5).forEach((task, index) => {
        const priorityEmoji = getPriorityEmoji(task.priority);
        message += `${index + 1}. ${priorityEmoji} ${task.title}\n`;
        if (task.ai_suggestion) {
          message += `   💡 ${task.ai_suggestion}\n`;
        }
      });
      message += '\n';
    }

    if (businessTasks.length > 0) {
      message += '**【事業タスク】**\n';
      businessTasks.slice(0, 5).forEach((task, index) => {
        const priorityEmoji = getPriorityEmoji(task.priority);
        const businessBadge = task.business_type ? `[${task.business_type}]` : '';
        message += `${index + 1}. ${priorityEmoji} ${businessBadge} ${task.title}\n`;
        if (task.ai_suggestion) {
          message += `   💡 ${task.ai_suggestion}\n`;
        }
      });
      message += '\n';
    }

    if (tasks?.length === 0) {
      message += 'タスクはありません！余裕のある一日をお過ごしください✨\n';
    } else {
      message += `\n全タスク数: ${tasks?.length}件\n`;
      message += `詳細: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}\n`;
    }

    return NextResponse.json({
      success: true,
      message,
      tasks: {
        personal: personalTasks,
        business: businessTasks,
        total: tasks?.length || 0
      }
    });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

function getPriorityEmoji(priority?: string): string {
  switch (priority) {
    case '今すぐやる': return '🔥';
    case '今週やる': return '⚡';
    case '今月やる': return '📅';
    case '高': return '🔴';
    case '中': return '🟡';
    case '低': return '🟢';
    default: return '⚪';
  }
}
