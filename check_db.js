
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking connection to:', supabaseUrl);
  
  // Try to list tables by querying pg_catalog if we have enough permissions (unlikely for anon key, but we can try common tables)
  // Let's try to query 'profiles' as it's common in this app (I'll check the source for table names)
  const commonTables = ['users', 'profiles', 'courses', 'lessons', 'modules'];
  
  for (const table of commonTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Successfully reached table: "${table}"`);
      if (data && data.length > 0) {
        console.log(`  Sample data found in "${table}".`);
      } else {
        console.log(`  Table "${table}" is empty.`);
      }
    } else if (error.code !== 'PGRST116' && error.code !== '42P01') {
       // PGRST116 is not found, 42P01 is undefined table
       console.log(`  Table "${table}": Error ${error.code} - ${error.message}`);
    }
  }
}

checkDatabase();
