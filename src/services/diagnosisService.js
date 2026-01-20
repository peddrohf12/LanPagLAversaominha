import { supabase } from './supabaseClient'

// Salva o resultado
export const saveDiagnosis = async (userId, archetype) => {
  const { data, error } = await supabase
    .from('user_diagnosis')
    .insert({ user_id: userId, archetype: archetype })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Busca se já tem
export const getDiagnosis = async (userId) => {
  const { data, error } = await supabase
    .from('user_diagnosis')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Se não achar (erro PGRST116), retorna null sem quebrar
  if (error && error.code !== 'PGRST116') throw error
  return data // Retorna o objeto ou null
}

// Reseta (para refazer o teste)
export const resetDiagnosis = async (userId) => {
  const { error } = await supabase
    .from('user_diagnosis')
    .delete()
    .eq('user_id', userId)
  
  if (error) throw error
}