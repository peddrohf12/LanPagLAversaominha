import React, { useState, useEffect, useRef } from 'react'
import { Send, User, Sparkles, WifiOff, Trash2 } from 'lucide-react'
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
  <div className="flex items-center gap-1 h-4 px-2 py-3 bg-[#1F1F29] rounded-2xl rounded-tl-none border border-white/5 w-fit">
    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
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
          ...apiHistory.slice(0, -1) // Envia histórico anterior (exceto a última msg que vai no sendMessage)
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
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
      {/* CABEÇALHO */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-purple-600 shadow-lg shadow-purple-500/20">
            <img 
              src={MINA_PFP} 
              alt="Mina AI" 
              className="w-full h-full rounded-full object-cover border-2 border-[#16161D]"
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Mina AI <Sparkles size={16} className="text-yellow-400"/>
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm">Mentora de Frequência 24/7</p>
              {usingBackup && (
                <span className="text-[10px] bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <WifiOff size={10} /> Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTÃO LIMPAR HISTÓRICO */}
        <button 
          onClick={clearHistory}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
          title="Limpar memória da conversa"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* ÁREA DE CHAT */}
      <div className="flex-1 bg-[#16161D] border border-white/5 rounded-3xl p-6 overflow-y-auto space-y-6 mb-4 relative scroll-smooth custom-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.type === 'bot' && (
              <div className="flex flex-col justify-end">
                <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 via-purple-500 to-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)] relative z-10">
                  <img src={MINA_PFP} alt="Mina" className="w-full h-full rounded-full object-cover bg-[#16161D]" />
                </div>
              </div>
            )}
            
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
              msg.type === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-[#1F1F29] text-gray-200 border border-white/5 rounded-tl-none'
            }`}>
              {/* Só anima se for BOT e for a ÚLTIMA mensagem recebida AGORA (não do histórico antigo ao recarregar) */}
              {msg.type === 'bot' && index === messages.length - 1 && loading === false ? (
                <Typewriter text={msg.text} onTyping={scrollToBottom} shouldAnimate={true} />
              ) : (
                msg.text
              )}
            </div>

            {msg.type === 'user' && (
               <div className="flex flex-col justify-end">
                 <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                   <User size={16} className="text-purple-400" />
                 </div>
               </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start">
             <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 via-purple-500 to-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)] relative z-10 animate-pulse">
                <img src={MINA_PFP} alt="Mina" className="w-full h-full rounded-full object-cover bg-[#16161D]" />
              </div>
              <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Conte para a Mina o que está sentindo..."
          disabled={loading}
          className="w-full bg-[#16161D] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-[#1A1A23] transition-all disabled:opacity-50 shadow-inner"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 p-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}

export default Mina