import React, { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Calendar, Music, 
  LogOut, Flame, Menu, X, Bot, Activity 
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'

const MembersArea = ({ onBackToHome }) => {
  const { user, signOut, checkPaidAccess } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // --- ESTADO GLOBAL (Fica aqui para não resetar ao trocar de página) ---
  const [tasks, setTasks] = useState({ audio: false, write: false, check: false, meditation: false })
  const [emotionalScore, setEmotionalScore] = useState(50)
  const [isSaving, setIsSaving] = useState(false)
  const [practiceCompleted, setPracticeCompleted] = useState(false)
  const [logId, setLogId] = useState(null)

  useEffect(() => {
    const init = async () => {
      const access = await checkPaidAccess()
      setHasAccess(access)
      if (access && user) await checkDailyProgress()
      setLoading(false)
      if (window.innerWidth > 768) setSidebarOpen(true)
    }
    init()
  }, [user])

  const checkDailyProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('date', today).maybeSingle()
      if (data) {
        setLogId(data.id)
        setTasks(data.tasks)
        setEmotionalScore(data.emotional_score)
        if (data.is_completed) setPracticeCompleted(true)
      }
    } catch (error) { console.error(error) }
  }

  const saveProgressToDb = async (newTasks, newScore, markCompleted = false) => {
    const today = new Date().toISOString().split('T')[0]
    const isDone = markCompleted ? true : practiceCompleted 
    const payload = { user_id: user.id, date: today, emotional_score: newScore, tasks: newTasks, is_completed: isDone }
    try {
      if (logId) { await supabase.from('daily_logs').update(payload).eq('id', logId) } 
      else { const { data } = await supabase.from('daily_logs').insert(payload).select().single(); if (data) setLogId(data.id) }
      if (markCompleted) { setPracticeCompleted(true); alert("✨ Prática salva!") }
    } catch (error) { console.error("Erro auto-save:", error) }
  }

  const toggleTask = (key) => {
    const newTasks = { ...tasks, [key]: !tasks[key] }
    setTasks(newTasks)
    saveProgressToDb(newTasks, emotionalScore, false)
  }
  const handleScoreChange = (e) => setEmotionalScore(e.target.value)
  const handleScoreCommit = () => saveProgressToDb(tasks, emotionalScore, false)
  const handleCompletePractice = async () => {
    if (isSaving) return; setIsSaving(true); await saveProgressToDb(tasks, emotionalScore, true); setIsSaving(false)
  }
  const handleLogout = async () => { await signOut(); onBackToHome ? onBackToHome() : navigate('/') }

  // Tudo que queremos passar para o Dashboard ou para a Mina
  const contextValues = {
    user, emotionalScore, handleScoreChange, handleScoreCommit,
    practiceCompleted, tasks, toggleTask, handleCompletePractice, isSaving
  }

  if (loading) return <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center text-white"><div className="animate-spin mr-2 h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>
  if (!hasAccess) return <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center px-4"><div className="max-w-md w-full bg-[#1A1A23] border border-white/10 rounded-3xl p-8 text-center"><h2 className="text-2xl font-bold text-white mb-4">Acesso Restrito 🔒</h2><button onClick={handleLogout} className="text-purple-400">Sair</button></div></div>

  return (
    <div className="flex h-screen bg-[#0B0B0F] text-white font-sans overflow-hidden relative">
      <div className={`fixed inset-0 bg-black/80 z-40 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen && window.innerWidth < 768 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`} onClick={() => setSidebarOpen(false)}/>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#121216] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">V</div>
            <span className="font-bold text-xl tracking-tight text-white">Vibracional</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"><X size={20} /></button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          <SidebarItem 
            icon={<LayoutDashboard size={20}/>} text="Dashboard" 
            active={location.pathname === '/sucesso' || location.pathname === '/sucesso/dashboard'}
            onClick={() => { navigate('/sucesso'); if(window.innerWidth < 768) setSidebarOpen(false) }}
          />
          <SidebarItem 
            icon={<Bot size={20}/>} text="Mina (Assistente IA)" 
            active={location.pathname === '/sucesso/mina'}
            onClick={() => { navigate('/sucesso/mina'); if(window.innerWidth < 768) setSidebarOpen(false) }}
          />
          <SidebarItem 
            icon={<Music size={20}/>} text="Áudios" 
            active={location.pathname === '/sucesso/audios'}
            onClick={() => { navigate('/sucesso/audios'); if(window.innerWidth < 768) setSidebarOpen(false) }}
          />
          <SidebarItem 
            icon={<Activity size={20}/>} text="Diagnóstico" 
            active={location.pathname === '/sucesso/diagnostico'}
            onClick={() => { navigate('/sucesso/diagnostico'); if(window.innerWidth < 768) setSidebarOpen(false) }}
          />
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#121216] shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"><LogOut size={20} /> Sair</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#0B0B0F] w-full">
        <header className="sticky top-0 z-30 bg-[#0B0B0F]/90 backdrop-blur-md px-4 md:px-8 py-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-lg text-gray-200 active:scale-95 transition-transform"><Menu size={24} /></button>
            <h1 className="text-lg font-semibold hidden md:block">Olá, {user?.email?.split('@')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1A1A23] border border-white/10 px-3 py-1.5 rounded-full">
              <Flame className="text-orange-500 fill-orange-500" size={16} />
              <span className="text-sm font-bold">0</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-[#0B0B0F]"></div>
          </div>
        </header>

        {/* --- É AQUI QUE O DASHBOARD VAI APARECER --- */}
        <Outlet context={contextValues} />

      </main>
    </div>
  )
}

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-gradient-to-r from-purple-500/20 to-transparent text-purple-400 border-l-2 border-purple-500' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
    <div className={`${active ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'}`}>{icon}</div>
    <span className="font-medium text-sm">{text}</span>
  </button>
)

export default MembersArea