import { createClient } from '@supabase/supabase-js'

// Estas variáveis devem estar no seu arquivo .env na raiz do projeto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)