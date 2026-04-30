// Cliente para Supabase externo (banco do Comissionamento / PIX)
import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://bkcnolpwteeqgipweiqs.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_RS7I1UeroffLB55nGixy_w_cIkelFUu';

// Este client também é usado para autenticação do módulo.
// A sessão precisa ficar persistida, senão qualquer refresh/HMR/volta de aba
// perde o usuário e o ProtectedRoute manda para /login.
export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'technet-pix-auth',
    },
  }
);
