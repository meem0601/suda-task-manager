import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// タスク追加API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, business_type, priority, ai_priority_score, ai_suggestion } = body;

    // バリデーション
    if (!title || !category) {
      return NextResponse.json(
        { error: 'タイトルとカテゴリは必須です' },
        { status: 400 }
      );
    }

    // タスク作成
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          category,
          business_type,
          priority,
          ai_priority_score: ai_priority_score || 50,
          ai_suggestion,
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

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスク取得API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = supabase
      .from('tasks')
      .select('*')
      .order('ai_priority_score', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'タスクの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: data });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
