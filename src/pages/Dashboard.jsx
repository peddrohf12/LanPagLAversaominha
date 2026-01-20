import React, { useEffect, useState } from 'react'
import { LayoutDashboard, CheckCircle, PlayCircle, FileText, Circle, Zap } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { getDailyActions, toggleDailyAction, getDailyAffirmation, getMonthlyCheckins, toggleCheckinToday, incrementAffirmation } from '../services/dailyActions'
import { supabase } from '../services/supabaseClient'

const Dashboard = () => {
  const { emotionalScore, handleScoreChange, handleScoreCommit } = useOutletContext()

  const [dailyActions, setDailyActions] = useState([])
  const [affirmationData, setAffirmationData] = useState({ id: null, text: "Carregando...", count: 0 })
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
        
        const history = await getMonthlyCheckins(user.id)
        setCheckins(history)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleAffirm = async (e) => {
    // Lógica das partículas
    const rect = e.currentTarget.getBoundingClientRect()
    // Espalha um pouco mais horizontalmente
    const randomX = (Math.random() - 0.5) * 80 
    // Garante que suba bastante
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
    } else {
      setCheckins(prev => prev.filter(date => date !== today))
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* CSS ATUALIZADO: Cor Branca e Sombra */}
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
          /* MUDANÇA AQUI: Branco com sombra roxa */
          color: #FFFFFF; 
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.8);
          font-weight: 900;
          font-size: 1.4rem;
          z-index: 50; /* Garante que fique acima do botão */
          animation: floatUp 0.8s cubic-bezier(0, 0.9, 0.57, 1) forwards;
        }
      `}</style>

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-[#23232E] to-[#1A1A23] border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-purple-400 font-medium text-xs tracking-wider uppercase mb-2 block">Hero Section</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">Seu Foco para Hoje</h2>
          <p className="text-gray-400 text-sm md:text-lg">A consistência molda sua realidade.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-2 bg-[#16161D] border border-white/5 rounded-3xl p-6 flex flex-col gap-8">
          
          <div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-semibold text-lg text-white">Cartão Diário</h3>
              <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded uppercase tracking-wider">Hoje</span>
            </div>
            
            <div className="mb-8">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Afirmação Atual</p>
              <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                "{affirmationData.text}"
              </p>
            </div>
            
            {/* BOTÃO DE DOPAMINA */}
            <div className="flex flex-col items-center justify-center py-4 relative">
               
               <div className="mb-4 text-center">
                  <span className="text-4xl font-bold text-white tabular-nums tracking-tighter">
                    {affirmationData.count}
                  </span>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Vezes Afirmadas</p>
               </div>

               <div className="relative group">
                  <button 
                    onClick={handleAffirm}
                    className="relative z-10 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all active:scale-95 flex items-center gap-2"
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
               
               <p className="text-[10px] text-gray-600 mt-4 text-center max-w-xs">
                 Clique repetidamente para internalizar a frase no seu subconsciente.
               </p>
            </div>

          </div>

          <div className="h-px w-full bg-white/5"></div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-300">Sua Consistência</h4>
                <span className="text-xs text-purple-400">{checkins.length} dias concluídos</span>
             </div>
             <MiniCalendar checkins={checkins} onToggleToday={handleCheckin} />
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div className="bg-[#16161D] border border-white/5 rounded-3xl p-6">
          <h3 className="font-semibold text-lg mb-4 text-white">Ações Guiadas</h3>
          {loading ? (
             <div className="text-gray-500 text-sm animate-pulse">Carregando...</div>
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
      <div className="bg-[#1A1A23] rounded-2xl p-4 border border-white/5">
        <div className="flex justify-between items-center mb-4 px-1">
           <span className="text-white font-medium capitalize">{monthNames[month]} {year}</span>
           {!isTodayDone && <button onClick={onToggleToday} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors font-bold animate-pulse">Fazer Check-in</button>}
           {isTodayDone && <span className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded">Check-in Feito ✓</span>}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d, index) => ( <div key={index} className="text-[10px] text-gray-500 font-medium py-1">{d}</div> ))}
          {days.map((d, index) => {
            if (!d) return <div key={`empty-${index}`} />
            const isDone = checkins.includes(d.date); const isToday = d.date === todayDateStr
            return (
              <div key={d.date} onClick={isToday ? onToggleToday : undefined} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all relative ${!isToday ? 'cursor-default' : 'cursor-pointer hover:ring-1 hover:ring-purple-500'} ${isDone ? 'bg-green-500 text-black font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]' : isToday ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50' : 'text-gray-500 bg-white/5'}`}>
                {d.day}
                {isToday && !isDone && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  const TaskItem = ({ text, done, type, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer select-none ${done ? 'bg-[#1F1F29] border-purple-500/20' : 'bg-[#1A1A23] border-transparent hover:border-purple-500/30 active:bg-[#20202B]'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${done ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
        {done ? <CheckCircle size={12} className="text-white" /> : <Circle size={12} className="text-transparent" />}
      </div>
      <span className={`flex-1 text-sm font-medium ${done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{text}</span>
      <div className={`p-1.5 rounded-lg text-gray-400 ${done ? 'opacity-30' : 'bg-white/5'}`}>
        {type === 'audio' && <PlayCircle size={14} />}
        {type === 'write' && <FileText size={14} />}
        {type === 'check' && <LayoutDashboard size={14} />}
        {!['audio', 'write', 'check'].includes(type) && <LayoutDashboard size={14} />}
      </div>
    </div>
  )

export default Dashboard