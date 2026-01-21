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

  // --- ESTADO GLOBAL ---
  const [tasks, setTasks] = useState({ audio: false, write: false, check: false, meditation: false })
  const [emotionalScore, setEmotionalScore] = useState(50)
  const [isSaving, setIsSaving] = useState(false)
  const [practiceCompleted, setPracticeCompleted] = useState(false)
  const [logId, setLogId] = useState(null)
  
  // --- STREAK / OFENSIVA ---
  const [streak, setStreak] = useState(0)
  const [animateStreak, setAnimateStreak] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  // 1. Carrega dados iniciais
  useEffect(() => {
    const init = async () => {
      const access = await checkPaidAccess()
      setHasAccess(access)
      if (access && user) {
        await checkDailyProgress() 
        await updateStreak()       
      }
      setLoading(false)
    }
    init()
  }, [user])

  // 2. EFEITO REATIVO: Dispara animação SEMPRE que o streak aumentar
  useEffect(() => {
    if (streak > 0) {
      const saved = parseInt(localStorage.getItem('saved_streak') || '0', 10)
      
      // Se o streak atual é maior que o salvo, é hora do show!
      if (streak > saved) {
        triggerAnimation()
        localStorage.setItem('saved_streak', streak.toString())
      }
    }
  }, [streak])

  const triggerAnimation = () => {
    setAnimateStreak(true)
    setShowBurst(true)
    
    // Desliga a animação depois de 1.5s (tempo do CSS)
    setTimeout(() => {
      setAnimateStreak(false)
      setShowBurst(false)
    }, 1500)
  }

  // --- LÓGICA DE CÁLCULO DE STREAK ---
  const updateStreak = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error || !data) return

      const dates = new Set(data.map(d => d.date)) 
      let count = 0
      let d = new Date() 
      
      // Ajuste de fuso horário simples (pega data local YYYY-MM-DD)
      const toLocalISO = (date) => {
        const offset = date.getTimezoneOffset() * 60000
        return new Date(date.getTime() - offset).toISOString().split('T')[0]
      }

      // Se hoje não está feito, começamos a checar de ontem
      if (!dates.has(toLocalISO(d))) {
         d.setDate(d.getDate() - 1)
      }

      while (true) {
        if (dates.has(toLocalISO(d))) {
          count++
          d.setDate(d.getDate() - 1) 
        } else {
          break 
        }
      }
      
      setStreak(count)

    } catch (err) {
      console.error("Erro streak:", err)
    }
  }

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

  const refreshSession = async () => {
    await checkDailyProgress()
    await updateStreak()
  }

  const saveProgressToDb = async (newTasks, newScore, markCompleted = false) => {
    const today = new Date().toISOString().split('T')[0]
    const isDone = markCompleted ? true : practiceCompleted 
    const payload = { user_id: user.id, date: today, emotional_score: newScore, tasks: newTasks, is_completed: isDone }
    try {
      if (logId) { await supabase.from('daily_logs').update(payload).eq('id', logId) } 
      else { const { data } = await supabase.from('daily_logs').insert(payload).select().single(); if (data) setLogId(data.id) }
      if (markCompleted) { 
        setPracticeCompleted(true); 
        await updateStreak()
        alert("✨ Prática salva!") 
      }
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

  const contextValues = {
    user, emotionalScore, handleScoreChange, handleScoreCommit,
    practiceCompleted, tasks, toggleTask, handleCompletePractice, isSaving,
    refreshSession
  }

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center text-white"><div className="animate-spin mr-2 h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>
  if (!hasAccess) return <div className="min-h-screen bg-transparent flex items-center justify-center px-4"><div className="max-w-md w-full bg-[#1A1A23]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center"><h2 className="text-2xl font-bold text-white mb-4">Acesso Restrito 🔒</h2><button onClick={handleLogout} className="text-purple-400">Sair</button></div></div>

  return (
    <div className="min-h-screen bg-transparent text-white font-sans relative">
      
      {/* CSS das Animações - AGORA MAIS POTENTE */}
      <style>{`
        @keyframes slideDownEnter {
          0% { transform: translateY(-150%) scale(0.5); opacity: 0; }
          60% { transform: translateY(10%) scale(1.2); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        @keyframes fireBurst {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.8); transform: scale(1); background-color: rgba(249, 115, 22, 0.5); }
          30% { transform: scale(1.3); background-color: rgba(249, 115, 22, 0.8); }
          100% { box-shadow: 0 0 0 25px rgba(249, 115, 22, 0); transform: scale(1); background-color: rgba(0,0,0,0.2); }
        }

        .animate-slide-down { 
          animation: slideDownEnter 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards; 
        }
        
        .animate-fire-burst { 
          animation: fireBurst 0.6s ease-out forwards; 
          z-index: 0;
        }
      `}</style>

      {/* OVERLAY MOBILE */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR FIXA */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        bg-[#121216]/80 backdrop-blur-xl border-r border-white/5 
        flex flex-col transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/30">V</div>
            <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">Vibracional</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"><X size={20} /></button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
          <SidebarItem 
            icon={<LayoutDashboard size={20}/>} text="Dashboard" 
            active={location.pathname === '/sucesso' || location.pathname === '/sucesso/dashboard'}
            onClick={() => { navigate('/sucesso'); setSidebarOpen(false) }}
          />
          <SidebarItem 
            icon={<Bot size={20}/>} text="Mina (Assistente IA)" 
            active={location.pathname === '/sucesso/mina'}
            onClick={() => { navigate('/sucesso/mina'); setSidebarOpen(false) }}
          />
          <SidebarItem 
            icon={<Music size={20}/>} text="Áudios" 
            active={location.pathname === '/sucesso/audios'}
            onClick={() => { navigate('/sucesso/audios'); setSidebarOpen(false) }}
          />
          <SidebarItem 
            icon={<Activity size={20}/>} text="Diagnóstico" 
            active={location.pathname === '/sucesso/diagnostico'}
            onClick={() => { navigate('/sucesso/diagnostico'); setSidebarOpen(false) }}
          />
        </nav>

        <div className="p-4 border-t border-white/5 bg-transparent shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"><LogOut size={20} /> Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 relative md:ml-72 transition-all duration-300">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-[#0B0B0F]/60 backdrop-blur-xl px-4 md:px-8 py-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-lg text-gray-200 active:scale-95 transition-transform"><Menu size={24} /></button>
            <h1 className="text-lg font-semibold hidden md:block drop-shadow-md">Olá, {user?.email?.split('@')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-4">
            
            {/* --- COMPONENTE DE STREAK (FOGO) --- */}
            <div className={`
              relative flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-500 z-10
              ${animateStreak ? 'border-orange-500/50' : 'bg-black/20 border border-white/10'}
            `}>
              {/* O elemento que explode fica atrás (absolute) */}
              <div className={`absolute inset-0 rounded-full ${showBurst ? 'animate-fire-burst' : ''}`}></div>

              <div className="relative z-10">
                 <Flame 
                   className={`transition-all duration-300 ${animateStreak ? 'text-orange-300 fill-orange-500 scale-125' : 'text-orange-500/80 fill-orange-500/50'}`} 
                   size={16} 
                 />
              </div>
              
              <div className="relative h-6 w-5 overflow-hidden flex items-center justify-center z-10">
                 {/* USO DO KEY={streak}: 
                    Isso força o React a destruir o span antigo e criar um novo.
                    Isso garante que a animação CSS 'animate-slide-down' rode toda vez que o número mudar.
                 */}
                 <span 
                    key={streak} 
                    className={`text-sm font-bold ${animateStreak ? 'text-orange-100 animate-slide-down' : 'text-gray-200'}`}
                  >
                    {streak}
                 </span>
              </div>
            </div>
            {/* ----------------------------------- */}

            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-white/10 shadow-lg"></div>
          </div>
        </header>

        <div className="min-h-[calc(100vh-80px)]"> 
          <Outlet context={contextValues} />
        </div>

      </main>
    </div>
  )
}

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-gradient-to-r from-purple-500/20 to-transparent text-purple-300 border-l-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
    <div className={`${active ? 'text-purple-300 drop-shadow-sm' : 'text-gray-500 group-hover:text-white'}`}>{icon}</div>
    <span className="font-medium text-sm">{text}</span>
  </button>
)

export default MembersArea