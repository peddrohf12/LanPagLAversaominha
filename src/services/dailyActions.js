import { createClient } from '@supabase/supabase-js'

// Use suas variáveis de ambiente ou coloque as chaves aqui temporariamente para testar
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const getDailyActions = async (userId) => {
  const today = new Date().toISOString().split('T')[0]

  // 1. Tenta buscar as ações de hoje
 // 1. Tenta buscar as ações de hoje
  const { data: existingActions } = await supabase
    .from('user_daily_actions')
    .select(`*, action_library ( title, icon_type, duration )`)
    .eq('user_id', userId)
    .eq('assigned_date', today)
    // ADICIONE ESTA LINHA ABAIXO PARA GARANTIR SÓ 4 NO VISUAL:
    .limit(4)

  if (existingActions && existingActions.length > 0) {
    return existingActions.map(formatAction)
  }

  // 2. Se não tem, sorteia 4 novas do estoque
  const { data: library } = await supabase.from('action_library').select('*')
  
  // Embaralha e pega 4
  const randomActions = library.sort(() => 0.5 - Math.random()).slice(0, 4)

  // Salva no banco para não mudar mais hoje
  const toInsert = randomActions.map(act => ({
    user_id: userId,
    action_id: act.id,
    assigned_date: today,
    is_completed: false
  }))

  const { data: newActions } = await supabase
    .from('user_daily_actions')
    .insert(toInsert)
    .select(`*, action_library ( title, icon_type, duration )`)

  return newActions ? newActions.map(formatAction) : []
}

export const toggleDailyAction = async (id, currentStatus) => {
  await supabase
    .from('user_daily_actions')
    .update({ is_completed: !currentStatus })
    .eq('id', id)
}

// Formata para ficar fácil de ler no front
const formatAction = (row) => ({
  id: row.id,
  title: row.action_library.title,
  type: row.action_library.icon_type, // audio, write, check
  done: row.is_completed,
  duration: row.action_library.duration
})

// ... (mantenha os imports e a função getDailyActions como estão)

// ATUALIZADA: Agora retorna o ID da linha, o Texto e a Contagem
export const getDailyAffirmation = async (userId) => {
  const today = new Date().toISOString().split('T')[0]

  // 1. Tenta buscar existente
  const { data: existing } = await supabase
    .from('user_daily_affirmations')
    .select(`id, affirmation_count, affirmation_library ( text )`)
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .single()

  if (existing) {
    return {
      id: existing.id, // ID da linha na tabela diária (importante pra dar update)
      text: existing.affirmation_library.text,
      count: existing.affirmation_count || 0
    }
  }

  // 2. Sorteio (Se não existir)
  const { data: library } = await supabase.from('affirmation_library').select('*')
  if (!library || library.length === 0) return { id: null, text: "Eu crio minha realidade.", count: 0 }

  const randomAffirmation = library[Math.floor(Math.random() * library.length)]

  const { data: newEntry } = await supabase
    .from('user_daily_affirmations')
    .insert({
      user_id: userId,
      affirmation_id: randomAffirmation.id,
      assigned_date: today,
      affirmation_count: 0
    })
    .select()
    .single()

  return {
    id: newEntry.id,
    text: randomAffirmation.text,
    count: 0
  }
}

// NOVA: Incrementa o contador no banco
export const incrementAffirmation = async (dailyAffirmationId, currentCount) => {
  await supabase
    .from('user_daily_affirmations')
    .update({ affirmation_count: currentCount + 1 })
    .eq('id', dailyAffirmationId)
}
// ... (mantenha os imports e funções anteriores)

// --- SISTEMA DE CHECK-IN (CALENDÁRIO) ---

export const getMonthlyCheckins = async (userId) => {
  // Pega todos os check-ins do usuário (pode filtrar por mês se quiser otimizar depois)
  const { data } = await supabase
    .from('user_checkins')
    .select('checkin_date')
    .eq('user_id', userId)

  // Retorna apenas um array de strings: ['2023-10-01', '2023-10-02']
  return data ? data.map(row => row.checkin_date) : []
}

export const toggleCheckinToday = async (userId) => {
  const today = new Date().toISOString().split('T')[0]

  // 1. Verifica se já fez hoje
  const { data: existing } = await supabase
    .from('user_checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .single()

  if (existing) {
    // Se já fez, remove (toggle off)
    await supabase.from('user_checkins').delete().eq('id', existing.id)
    return false // Retorna estado atual: não feito
  } else {
    // Se não fez, cria
    await supabase.from('user_checkins').insert({ user_id: userId, checkin_date: today })
    return true // Retorna estado atual: feito
  }
}