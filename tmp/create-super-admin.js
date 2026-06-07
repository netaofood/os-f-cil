import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'netaosushibar@gmail.com',
    password: 'Net@o2024!',
    email_confirm: true,
    user_metadata: { nome: 'Super Admin' },
  });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('User created:', data.user?.id);
}

main();
