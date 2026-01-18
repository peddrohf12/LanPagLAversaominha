import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, LogOut, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from './AuthContext'

const MembersArea = ({ onBackToHome }) => {
  const { user, signOut, checkPaidAccess } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      const access = await checkPaidAccess()
      setHasAccess(access)
      setLoading(false)
    }
    
    verifyAccess()
  }, [])

  const handleLogout = async () => {
    await signOut()
    onBackToHome()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="text-brand-pink mx-auto mb-4 animate-spin" size={48} />
          <p className="text-white text-lg">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-brand-deepPurple/50 backdrop-blur-xl border border-brand-pink/30 rounded-3xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-pink/20 flex items-center justify-center">
            <Lock className="text-brand-orange" size={40} />
          </div>
          
          <h2 className="font-serif text-3xl text-white mb-4">Acesso Bloqueado</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Para acessar o conteúdo exclusivo, você precisa completar o pagamento da sua assinatura.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Usuário logado:</p>
            <p className="text-white font-semibold">{user?.email}</p>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-4 rounded-xl mb-3 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all"
          >
            Ir para Pagamento
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-white/5 text-gray-300 font-semibold py-3 rounded-xl hover:bg-white/10 transition-all"
          >
            Sair da Conta
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header da Área de Membros */}
      <header className="fixed top-0 w-full z-50 px-4 py-4 md:px-8 bg-brand-dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-serif text-xl font-bold text-white">
            <Sparkles className="text-brand-pink" size={20} />
            <span>Área de Membros</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <CheckCircle className="text-green-400" size={16} />
              <span className="text-gray-300">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-4">
              Bem-vindo(a) ao Portal! 🎉
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Você tem acesso completo a todos os recursos exclusivos. Sua jornada de transformação começa agora.
            </p>
          </motion.div>

          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Diagnóstico Vibracional', desc: 'Descubra sua frequência atual', icon: '🔮' },
              { title: 'Mapa de Bloqueios', desc: 'Identifique padrões limitantes', icon: '🗺️' },
              { title: 'Guia de Reprogramação', desc: 'Técnicas práticas de transformação', icon: '✨' },
              { title: 'Áudios Vibracionais', desc: 'Meditações guiadas exclusivas', icon: '🎵' },
              { title: 'Assistente IA', desc: 'Suporte personalizado 24/7', icon: '🤖' },
              { title: 'Comunidade', desc: 'Conecte-se com outros membros', icon: '👥' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-brand-pink/30 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Status de Acesso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
              <CheckCircle size={24} />
              <span className="font-bold text-lg">Acesso Vitalício Ativo</span>
            </div>
            <p className="text-gray-300 text-sm">
              Você tem acesso ilimitado a todo o conteúdo e futuras atualizações.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default MembersArea
