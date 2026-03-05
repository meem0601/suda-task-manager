import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// AI提案機能は一旦オフ（2026-03-05 須田様指示）
// 将来的に再実装する際は、環境変数経由でAPIキーを設定すること

async function generateAISuggestion(title: string, description?: string): Promise<string> {
  // AI提案機能オフ - デフォルトメッセージを返す
  return 'まず具体的な目標を1つ決めて、最初のアクションを書き出してみましょう';
}

// POST /api/ai-suggestion - 特定のタスクにAI提案を生成
export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    // タスク情報を取得
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // AI提案を生成（現在はデフォルトメッセージ）
    const aiSuggestion = await generateAISuggestion(task.title, task.description);

    // DBを更新
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ ai_suggestion: aiSuggestion })
      .eq('id', taskId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      ai_suggestion: aiSuggestion 
    });
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestion' },
      { status: 500 }
    );
  }
}

// PUT /api/ai-suggestion - 全タスクに一括でAI提案を生成
export async function PUT(req: NextRequest) {
  try {
    // AI提案がまだないタスクを取得
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .is('ai_suggestion', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No tasks need AI suggestions',
        count: 0
      });
    }

    // 各タスクにAI提案を生成（現在はデフォルトメッセージ）
    const updates = await Promise.all(
      tasks.map(async (task) => {
        const aiSuggestion = await generateAISuggestion(task.title, task.description);
        
        await supabase
          .from('tasks')
          .update({ ai_suggestion: aiSuggestion })
          .eq('id', task.id);
        
        return { id: task.id, ai_suggestion: aiSuggestion };
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: `Generated AI suggestions for ${updates.length} tasks`,
      count: updates.length,
      updates
    });
  } catch (error) {
    console.error('Error batch generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to batch generate AI suggestions' },
      { status: 500 }
    );
  }
}
