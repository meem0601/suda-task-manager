import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Applying notifications migration...');

  const sqlPath = path.join(__dirname, '..', 'supabase', 'notifications-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // SQLを実行
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Migration failed:', error);
    
    // RPCが使えない場合は、手動で各ステートメントを実行
    console.log('⚠️  RPC not available, trying manual execution...');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        const result = await supabase.rpc('exec', { statement });
        console.log('✅', statement.substring(0, 50) + '...');
      } catch (err) {
        console.error('❌', statement.substring(0, 50), err);
      }
    }
  } else {
    console.log('✅ Migration applied successfully!');
    console.log(data);
  }
}

applyMigration();
