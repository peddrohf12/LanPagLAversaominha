import React, { useState, useEffect, useRef } from 'react'
import { Send, User, Sparkles, WifiOff, Trash2, Bot } from 'lucide-react'
import { GoogleGenerativeAI } from "@google/generative-ai"

// --- IMPORTAÇÃO DA IMAGEM LOCAL ---
import minaPfp from '../assets/mina.png'

const MINA_PFP = minaPfp

// --- PERSONALIDADE MENTORA ---
const MINA_PERSONA = `
Você é a IA Mentora oficial.
Seu papel é orientar com precisão técnica e acolhimento.

REGRAS VISUAIS:
1. USE ESPAÇAMENTO: Pule linhas para o texto respirar.
2. SEM PAREDÕES: Divida em parágrafos curtos.
3. SEM MARKDOWN: Não use asteriscos (**).
4. DESTAQUES: Use CAIXA ALTA ou Emojis para títulos.

REGRAS DE CONTEÚDO:
- Bate-papo: Breve (2-3 frases).
- Técnicas: Listas numeradas passo-a-passo.

OBJETIVO: Clarear, organizar e acalmar.
`

const ZEN_BACKUP_RESPONSES = [
  "Para relaxar agora, tente a RESPIRAÇÃO QUADRADA:\n\n1. Inspire em 4s\n2. Segure 4s\n3. Expire 4s\n4. Segure vazio 4s",
  "Observe esse pensamento.\n\nEle é um fato ou uma interpretação? Questione a validade dele agora.",
  "Consistência vence a intensidade.\n\nMantenha-se firme na sua assunção interna.",
  "Técnica rápida de foco:\nOlhe para um objeto próximo e descreva 3 detalhes dele mentalmente.",
  "Vamos simplificar.\nSilencie e ouça sua intuição."
]

// --- COMPONENTE DE DIGITAÇÃO ---
const Typewriter = ({ text, onTyping, shouldAnimate }) => {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? '' : text)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!shouldAnimate) return

    setDisplayedText('')
    indexRef.current = 0
    
    const intervalId = setInterval(() => {
      indexRef.current += 1
      setDisplayedText(text.slice(0, indexRef.current))
      
      if (onTyping) onTyping()

      if (indexRef.current >= text.length) {
        clearInterval(intervalId)
      }
    }, 15) 

    return () => clearInterval(intervalId)
  }, [text, shouldAnimate])

  return <span>{displayedText}</span>
}

// Indicador de Digitação
const TypingIndicator = () => (
  <div className="flex items-center gap-1 h-8 px-4 py-2 bg-[#272732] rounded-2xl rounded-tl-none border border-white/5 w-fit shadow-sm">
    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
  </div>
)

const Mina = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [usingBackup, setUsingBackup] = useState(false)
  
  // --- INICIALIZAÇÃO DO ESTADO COM LOCALSTORAGE ---
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mina_chat_history')
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'bot', text: 'Olá. Eu sou a Mina, sua mentora.\n\nEstou aqui para te ajudar a organizar seus pensamentos. O que está acontecendo agora?' }
    ]
  })
  
  const messagesEndRef = useRef(null)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  
  useEffect(() => scrollToBottom(), [messages])

  // --- SALVAR NO LOCALSTORAGE SEMPRE QUE MUDAR ---
  useEffect(() => {
    localStorage.setItem('mina_chat_history', JSON.stringify(messages))
  }, [messages])

  // --- FUNÇÃO PARA LIMPAR HISTÓRICO ---
  const clearHistory = () => {
    if (confirm("Deseja apagar toda a memória da conversa?")) {
      const initialMsg = [{ id: Date.now(), type: 'bot', text: 'Memória limpa. ✨\n\nPodemos recomeçar. O que você gostaria de focar hoje?' }]
      setMessages(initialMsg)
      localStorage.setItem('mina_chat_history', JSON.stringify(initialMsg))
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input
    setInput('')
    setLoading(true)

    // Adiciona msg do usuário
    const newHistory = [...messages, { id: Date.now(), type: 'user', text: userText }]
    setMessages(newHistory)

    try {
      if (!apiKey) throw new Error("Chave de API não encontrada no .env")

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      
      // Converte histórico para formato do Gemini
      const apiHistory = newHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: MINA_PERSONA }] },
          { role: "model", parts: [{ text: "Entendido. Usarei listas, espaçamento duplo e evitarei blocos de texto." }] },
          ...apiHistory.slice(0, -1) // Envia histórico anterior
        ],
      })

      const result = await chat.sendMessage(userText)
      const response = await result.response
      const text = response.text()

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: text }])
      setUsingBackup(false)

    } catch (error) {
      console.error("Erro na API (Ativando Backup):", error)
      setUsingBackup(true)

      setTimeout(() => {
        const randomResponse = ZEN_BACKUP_RESPONSES[Math.floor(Math.random() * ZEN_BACKUP_RESPONSES.length)]
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: randomResponse }])
        setLoading(false)
      }, 2000)
      return 
    }
    
    setLoading(false)
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto px-2 md:px-0">
      
      {/* 1. CONTAINER PRINCIPAL (ESTILO VIDRO ESCURO) */}
      <div className="flex-1 flex flex-col bg-[#13131A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative backdrop-blur-sm">
        
        {/* CABEÇALHO DO CHAT */}
        <div className="px-6 py-4 bg-[#1A1A23]/80 border-b border-white/5 backdrop-blur-md flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <img 
                  src={MINA_PFP} 
                  alt="Mina AI" 
                  className="w-full h-full rounded-full object-cover border-2 border-[#16161D]"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#16161D] rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-wide">
                Mina AI <Sparkles size={14} className="text-purple-400 animate-pulse"/>
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-xs font-medium">Mentora de Frequência</p>
                {usingBackup && (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <WifiOff size={10} /> Offline
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={clearHistory}
            className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all duration-300 group"
            title="Limpar memória"
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative scroll-smooth custom-scrollbar bg-[#0f0f13]">
          {/* Efeito de luz sutil no fundo */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 relative z-10 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar da Mina (CORREÇÃO AQUI: Imagem restaurada) */}
              {msg.type === 'bot' && (
                <div className="flex flex-col justify-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 border border-white/10 shadow-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={MINA_PFP} 
                      alt="Mina" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
              
              {/* Balão da Mensagem */}
              <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed shadow-md backdrop-blur-sm ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white rounded-tr-sm shadow-purple-900/20' 
                  : 'bg-[#272732]/90 border border-white/5 text-gray-100 rounded-tl-sm shadow-black/20'
              }`}>
                {msg.type === 'bot' && index === messages.length - 1 && loading === false ? (
                  <Typewriter text={msg.text} onTyping={scrollToBottom} shouldAnimate={true} />
                ) : (
                  msg.text
                )}
              </div>

              {/* Avatar do User */}
              {msg.type === 'user' && (
                <div className="flex flex-col justify-end">
                  <div className="w-8 h-8 rounded-full bg-[#1F1F29] border border-white/10 flex items-center justify-center">
                    <User size={16} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading State */}
          {loading && (
            <div className="flex gap-4 justify-start animate-fade-in">
               <div className="flex flex-col justify-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 border border-white/10 shadow-lg flex items-center justify-center overflow-hidden">
                     <img 
                      src={MINA_PFP} 
                      alt="Mina" 
                      className="w-full h-full object-cover opacity-80" 
                    />
                  </div>
                </div>
                <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* BARRA DE INPUT */}
        <div className="p-4 md:p-6 bg-[#1A1A23] border-t border-white/5 z-20">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Converse com a Mina..."
                disabled={loading}
                className="w-full bg-[#0F0F13] border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 focus:bg-[#15151A] focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all disabled:opacity-50"
              />
            </div>
            
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl text-white shadow-lg shadow-purple-900/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} className="ml-0.5" />
              )}
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-gray-600">A Mina pode cometer erros. Verifique as informações importantes.</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Mina