import React, { useEffect, useState } from 'react'
import { LayoutDashboard, CheckCircle, PlayCircle, FileText, Circle, Zap, Edit3 } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { getDailyActions, toggleDailyAction, getDailyAffirmation, getMonthlyCheckins, toggleCheckinToday, incrementAffirmation } from '../services/dailyActions'
import { supabase } from '../services/supabaseClient'

const Dashboard = () => {
  const { emotionalScore, handleScoreChange, handleScoreCommit, refreshSession } = useOutletContext()

  const [dailyActions, setDailyActions] = useState([])
  const [affirmationData, setAffirmationData] = useState({ id: null, text: "Sintonizando...", count: 0 })
  
  // --- NOVO ESTADO PARA A AFIRMAÇÃO PERSONALIZADA ---
  const [customAffirmation, setCustomAffirmation] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const MAX_CHARS = 100 // Limite para não quebrar o layout

  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const actions = await getDailyActions(user.id)
        setDailyActions(actions)
        
        const affData = await getDailyAffirmation(user.id)
        setAffirmationData(affData)
        // Inicializa o texto editável com o que veio do banco
        setCustomAffirmation(affData.text || "Eu sou o criador da minha realidade.")
        
        const history = await getMonthlyCheckins(user.id)
        setCheckins(history)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Atualiza o texto local se o banco trouxer algo novo (apenas no carregamento inicial)
  useEffect(() => {
    if (affirmationData.text && !isEditing) {
      setCustomAffirmation(affirmationData.text)
    }
  }, [affirmationData.text])

  const handleAffirmationChange = (e) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setCustomAffirmation(text)
      setIsEditing(true) // Marca que o usuário mexeu, para não sobrescrevermos com dados do banco
    }
  }

  const handleAffirm = async (e) => {
    // Lógica das partículas
    const rect = e.currentTarget.getBoundingClientRect()
    const randomX = (Math.random() - 0.5) * 80 
    const randomY = -60 - (Math.random() * 40) 

    const newParticle = {
      id: Date.now(),
      x: randomX,
      y: randomY
    }
    setParticles(prev => [...prev, newParticle])

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id))
    }, 1000)

    const newCount = affirmationData.count + 1
    setAffirmationData(prev => ({ ...prev, count: newCount }))

    if (affirmationData.id) {
      await incrementAffirmation(affirmationData.id, affirmationData.count)
    }
  }

  const handleLocalActionToggle = async (id, currentStatus) => {
    setDailyActions(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    await toggleDailyAction(id, currentStatus)
  }

  const handleCheckin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    
    const isNowDone = await toggleCheckinToday(user.id)
    
    if (isNowDone) {
      setCheckins(prev => [...prev, today])
      if (refreshSession) await refreshSession()
    } else {
      setCheckins(prev => prev.filter(date => date !== today))
      if (refreshSession) await refreshSession()
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* CSS das Partículas */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; }
        }
        .particle-anim {
          position: absolute;
          left: 50%;
          top: 50%;
          pointer-events: none;
          color: #FFFFFF; 
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.8);
          font-weight: 900;
          font-size: 1.4rem;
          z-index: 50;
          animation: floatUp 0.8s cubic-bezier(0, 0.9, 0.57, 1) forwards;
        }
      `}</style>

      {/* Hero Section */}
      <div className="w-full bg-[#1A1A23]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-purple-300 font-medium text-xs tracking-wider uppercase mb-2 block drop-shadow-sm">Hero Section</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">Seu Foco para Hoje</h2>
          <p className="text-gray-300 text-sm md:text-lg drop-shadow-sm">A consistência molda sua realidade.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-2 bg-[#1A1A23]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col gap-8 shadow-lg">
          
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-white drop-shadow-md">Cartão Diário</h3>
              <span className="text-[10px] font-mono text-gray-300 bg-white/10 border border-white/5 px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">Hoje</span>
            </div>
            
            {/* --- ÁREA DE AFIRMAÇÃO EDITÁVEL --- */}
            <div className="mb-8 relative group">
              <div className="flex justify-between items-center mb-2">
                 <p className="text-purple-300/80 text-xs uppercase tracking-wide font-bold flex items-center gap-2">
                   Afirmação Atual <Edit3 size={10} className="opacity-50 group-hover:opacity-100 transition-opacity"/>
                 </p>
                 <span className={`text-[10px] font-mono transition-colors ${customAffirmation.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-500'}`}>
                    {customAffirmation.length}/{MAX_CHARS}
                 </span>
              </div>
              
              <div className="relative">
                {/* Aspas decorativas */}
                <span className="absolute -top-2 -left-2 text-4xl text-white/10 font-serif">“</span>
                
                <textarea
                  value={customAffirmation}
                  onChange={handleAffirmationChange}
                  rows={2}
                  placeholder="Digite sua afirmação aqui..."
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-transparent focus:border-purple-500/30 rounded-xl p-3 text-xl md:text-2xl font-medium text-white leading-relaxed text-center resize-none placeholder-gray-600 focus:outline-none transition-all drop-shadow-sm"
                  style={{ minHeight: '100px' }}
                />
                
                <span className="absolute -bottom-4 -right-1 text-4xl text-white/10 font-serif leading-[0]">”</span>
              </div>
            </div>
            {/* ---------------------------------- */}
            
            {/* BOTÃO DE DOPAMINA */}
            <div className="flex flex-col items-center justify-center py-6 relative bg-black/10 rounded-2xl border border-white/5 backdrop-blur-sm">
               
               <div className="mb-4 text-center">
                  <span className="text-4xl font-bold text-white tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {affirmationData.count}
                  </span>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Vezes Afirmadas</p>
               </div>

               <div className="relative group">
                  <button 
                    onClick={handleAffirm}
                    className="relative z-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all active:scale-95 flex items-center gap-2 border border-white/10"
                  >
                    <Zap size={20} className="fill-white" />
                    AFIRMAR COM FORÇA
                  </button>

                  {/* Renderização das Partículas */}
                  {particles.map(p => (
                    <span 
                      key={p.id} 
                      className="particle-anim"
                      style={{ 
                        '--tx': `${p.x}px`, 
                        '--ty': `${p.y}px` 
                      }}
                    >
                      +1
                    </span>
                  ))}
               </div>
               
               <p className="text-[10px] text-gray-500 mt-4 text-center max-w-xs">
                 Clique repetidamente para internalizar a frase no seu subconsciente.
               </p>
            </div>

          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-300">Sua Consistência</h4>
                <span className="text-xs text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{checkins.length} dias concluídos</span>
             </div>
             <MiniCalendar checkins={checkins} onToggleToday={handleCheckin} />
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div className="bg-[#1A1A23]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-lg h-full">
          <h3 className="font-semibold text-lg mb-6 text-white drop-shadow-md">Ações Guiadas</h3>
          {loading ? (
             <div className="text-gray-400 text-sm animate-pulse flex justify-center py-4">Sintonizando...</div>
          ) : (
            <div className="space-y-3">
              {dailyActions.map((action) => (
                <TaskItem 
                  key={action.id} 
                  text={action.title}
                  type={action.type}
                  done={action.done}
                  onClick={() => handleLocalActionToggle(action.id, action.done)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const MiniCalendar = ({ checkins, onToggleToday }) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const todayDateStr = now.toISOString().split('T')[0]
    const isTodayDone = checkins.includes(todayDateStr)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const days = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` })
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
    return (
      <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 px-1">
           <span className="text-white font-medium capitalize text-sm">{monthNames[month]} {year}</span>
           {!isTodayDone && <button onClick={onToggleToday} className="text-[10px] bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors font-bold animate-pulse shadow-lg shadow-purple-900/50">Fazer Check-in</button>}
           {isTodayDone && <span className="text-[10px] text-green-300 font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Check-in Feito ✓</span>}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d, index) => ( <div key={index} className="text-[10px] text-gray-500 font-bold py-1">{d}</div> ))}
          {days.map((d, index) => {
            if (!d) return <div key={`empty-${index}`} />
            const isDone = checkins.includes(d.date); const isToday = d.date === todayDateStr
            return (
              <div key={d.date} onClick={isToday ? onToggleToday : undefined} 
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all relative 
                  ${!isToday ? 'cursor-default' : 'cursor-pointer hover:bg-white/10'} 
                  ${isDone 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                    : isToday 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50' 
                      : 'text-gray-500 bg-white/5'
                  }
                `}>
                {d.day}
                {isToday && !isDone && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-ping shadow-[0_0_5px_#A855F7]"></span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  const TaskItem = ({ text, done, type, onClick }) => (
    <div onClick={onClick} 
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer select-none relative overflow-hidden group
        ${done 
          ? 'bg-black/20 border-white/5 opacity-60' 
          : 'bg-white/5 border-transparent hover:border-purple-500/30 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.05)]'
        }
      `}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${done ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>
        {done ? <CheckCircle size={12} className="text-white" /> : <Circle size={12} className="text-transparent" />}
      </div>
      <span className={`flex-1 text-sm font-medium transition-colors ${done ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`}>{text}</span>
      <div className={`p-1.5 rounded-lg transition-colors ${done ? 'text-gray-600 opacity-30' : 'text-gray-400 bg-white/5 group-hover:text-purple-300 group-hover:bg-purple-500/10'}`}>
        {type === 'audio' && <PlayCircle size={14} />}
        {type === 'write' && <FileText size={14} />}
        {type === 'check' && <LayoutDashboard size={14} />}
        {!['audio', 'write', 'check'].includes(type) && <LayoutDashboard size={14} />}
      </div>
    </div>
  )

export default Dashboard