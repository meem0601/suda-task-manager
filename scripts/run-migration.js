const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数を手動で読み込み
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('📦 Running notifications migration...\n');

  const sqlPath = path.join(__dirname, '..', 'supabase', 'notifications-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // SQLを個別のステートメントに分割
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 80).replace(/\n/g, ' ');
    
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      // Supabaseで直接SQLを実行（RPC経由）
      const { data, error } = await supabase.rpc('exec', {
        sql: statement + ';'
      });

      if (error) {
        // RPCが使えない場合は警告のみ
        console.warn(`⚠️  Could not execute via RPC:`, error.message);
        console.log('    Please run this SQL manually in Supabase Dashboard > SQL Editor');
      } else {
        console.log('    ✅ Success');
      }
    } catch (err) {
      console.error('    ❌ Error:', err.message);
    }
  }

  console.log('\n📋 Migration Summary:');
  console.log('   If you see RPC errors above, please run the SQL manually:');
  console.log('   1. Open: https://supabase.com/dashboard/project/dqrnjluulchmuukfczib/sql/new');
  console.log('   2. Copy: supabase/notifications-schema.sql');
  console.log('   3. Paste and execute in SQL Editor');
  console.log('\n✅ Phase 1: Notification feature code is ready!');
}

runMigration();
