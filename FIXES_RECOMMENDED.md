# 推奨修正コード

このドキュメントには、QAレポートで指摘された問題の修正コードが含まれています。

## H-2: 入力バリデーション不足の修正

### 1. バリデーションライブラリを追加（完了）
`lib/validation.ts` に以下の関数を実装：
- `validateTaskTitle()`: タイトルの検証
- `validateTaskDescription()`: 説明の検証
- `validateSubtaskTitle()`: サブタスクの検証
- `validateTask()`: タスク全体の検証

### 2. フロントエンドでの使用例

```tsx
// app/page.tsx
import { validateTask, validateSubtaskTitle } from '@/lib/validation';

const handleAddTask = async () => {
  // バリデーション追加
  const validation = validateTask(newTask);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .insert([
      {
        ...newTask,
        status: '未着手',
        ai_priority_score: 50
      }
    ]);

  if (error) {
    console.error('Error adding task:', error);
    alert('タスクの追加に失敗しました');
  } else {
    setShowAddModal(false);
    setNewTask({
      title: '',
      description: '',
      category: '個人',
      business_type: undefined,
      priority: undefined,
      due_date: undefined
    });
    fetchTasks();
  }
};

const handleAddSubtask = async () => {
  if (!selectedTask) return;

  // バリデーション追加
  const validation = validateSubtaskTitle(newSubtaskTitle);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  const { error } = await supabase
    .from('subtasks')
    .insert([
      {
        task_id: selectedTask.id,
        title: newSubtaskTitle,
        completed: false
      }
    ]);

  if (error) {
    console.error('Error adding subtask:', error);
    alert('サブタスクの追加に失敗しました');
  } else {
    setNewSubtaskTitle('');
    fetchSubtasks(selectedTask.id);
  }
};
```

### 3. API側のバリデーション強化

```typescript
// app/api/tasks/route.ts
import { validateTask } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, business_type, priority, ai_priority_score, ai_suggestion } = body;

    // バリデーション追加
    const validation = validateTask({ title, description, category, business_type, priority });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
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
```

---

## H-3: エラーハンドリング改善

### 修正版 fetchTasks

```tsx
// app/page.tsx
const [error, setError] = useState<string | null>(null);

const fetchTasks = async () => {
  setLoading(true);
  setError(null);  // エラー状態をリセット
  
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('category', filter);
  }

  const { data, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error fetching tasks:', fetchError);
    setError('タスクの読み込みに失敗しました。ネットワーク接続を確認してください。');
    setTasks([]);
  } else {
    setTasks(data || []);
  }
  setLoading(false);
};

// UIにエラー表示を追加
{error && (
  <div className="mx-4 mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <span className="text-2xl">⚠️</span>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm text-red-700 font-medium">{error}</p>
        <button 
          onClick={fetchTasks}
          className="mt-2 text-sm text-red-700 underline active:text-red-900"
        >
          再試行
        </button>
      </div>
    </div>
  </div>
)}
```

---

## M-3: パフォーマンス改善 - 楽観的UI更新

```tsx
// app/page.tsx
const handleUpdateField = async (taskId: string, field: string, value: any) => {
  // 1. 楽観的UI更新（即座にUIを更新）
  setTasks(prev => prev.map(t => 
    t.id === taskId ? { ...t, [field]: value } : t
  ));
  
  if (selectedTask?.id === taskId) {
    const updatedTask = { ...selectedTask, [field]: value };
    setSelectedTask(updatedTask);
  }

  // 2. 完了時のタイムスタンプ追加
  const updateData: any = { [field]: value };
  if (field === 'status' && value === '完了') {
    updateData.completed_at = new Date().toISOString();
  }

  // 3. バックグラウンドでDBに保存
  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId);

  if (error) {
    console.error('Error updating field:', error);
    // エラー時のみ再フェッチ（整合性を保つため）
    setError('更新に失敗しました。再読み込みします。');
    setTimeout(() => {
      fetchTasks();
      if (selectedTask?.id === taskId) {
        fetchSubtasks(taskId);
      }
    }, 1000);
  }
};
```

---

## 新機能: タスク削除（未実装だったため追加）

```tsx
// app/page.tsx
const handleDeleteTask = async (taskId: string) => {
  if (!confirm('このタスクを削除してもよろしいですか？\n※サブタスクも削除されます')) {
    return;
  }

  try {
    // サブタスクを先に削除
    const { error: subtaskError } = await supabase
      .from('subtasks')
      .delete()
      .eq('task_id', taskId);

    if (subtaskError) {
      throw new Error('サブタスクの削除に失敗しました');
    }

    // タスクを削除
    const { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (taskError) {
      throw new Error('タスクの削除に失敗しました');
    }

    // UIから削除（楽観的更新）
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // 詳細画面を閉じる
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }

    alert('タスクを削除しました');
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('タスクの削除に失敗しました');
    // 失敗したら再読み込み
    fetchTasks();
  }
};

// UIに削除ボタンを追加（詳細画面の下部）
<div className="mt-6 pt-6 border-t border-gray-200">
  <button
    onClick={() => handleDeleteTask(selectedTask.id)}
    className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium active:bg-red-700"
  >
    🗑️ タスクを削除
  </button>
</div>
```

---

## スケルトンローディングの追加

```tsx
// app/page.tsx
{loading && tasks.length === 0 ? (
  <div className="px-4 py-4 space-y-3">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse border-l-4 border-gray-200">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex gap-2 mb-2">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
) : (
  // 通常のタスクリスト
  <div className="px-4 py-4 space-y-6 pb-20">
    {/* ... */}
  </div>
)}
```

---

## API削除エンドポイント追加

```typescript
// app/api/tasks/route.ts に追加
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'タスクIDが必要です' },
        { status: 400 }
      );
    }

    // サブタスクを先に削除
    const { error: subtaskError } = await supabase
      .from('subtasks')
      .delete()
      .eq('task_id', taskId);

    if (subtaskError) {
      console.error('Supabase error (subtasks):', subtaskError);
      return NextResponse.json(
        { error: 'サブタスクの削除に失敗しました' },
        { status: 500 }
      );
    }

    // タスクを削除
    const { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (taskError) {
      console.error('Supabase error (task):', taskError);
      return NextResponse.json(
        { error: 'タスクの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'タスクを削除しました' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

---

## まとめ

### 実装済み
- ✅ バリデーションライブラリ (`lib/validation.ts`)
- ✅ 修正コード例の文書化

### 要実装（須田様の確認後）
1. フロントエンドにバリデーション追加
2. API側にバリデーション追加
3. エラーハンドリング改善
4. 楽観的UI更新
5. タスク削除機能
6. スケルトンローディング
7. 削除APIエンドポイント

### 優先順位
1. **今すぐ:** バリデーション + エラーハンドリング
2. **今週中:** タスク削除機能
3. **今月中:** パフォーマンス最適化

これらの修正により、セキュリティとUXが大幅に向上します。
