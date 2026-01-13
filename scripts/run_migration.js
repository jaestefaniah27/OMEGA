const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Running migration...');
    const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
            ALTER TABLE public.exercises 
            ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;
        `
    });

    if (error) {
        // If RPC exec_sql is not available, we have a problem. 
        // We'll try another way or just assume the user runs it in the dashboard.
        console.error('❌ Error running migration via RPC:', error);
        console.log('Please run the migration manually in the Supabase SQL Editor:');
        console.log('ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;');
    } else {
        console.log('✅ Migration successful!');
    }
}

runMigration();
