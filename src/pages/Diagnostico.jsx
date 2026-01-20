import React, { useState, useEffect } from 'react'
import { Brain, RefreshCw, AlertTriangle, Activity, Lock, Target, Eye, Zap, ShieldAlert } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { saveDiagnosis, getDiagnosis, resetDiagnosis } from '../services/diagnosisService'

// --- ARQUÉTIPOS E RESULTADOS ---
const PROFILES = {
  FISCAL: {
    title: "O Fiscal do Universo",
    subtitle: "Aquele que planta a semente e cava a terra a cada 10 minutos.",
    description: "Você trata a Lei da Atração como um serviço de delivery atrasado. Sua vibração dominante é a 'Espera Ativa' carregada de ansiedade. Você acredita que precisa monitorar o processo para que ele aconteça, mas essa vigilância constante apenas confirma para o Universo que você *ainda não tem* o que deseja. Você vibra na falta.",
    trap: "Achar que 'conferir se funcionou' é parte do processo. Não é. Conferir é duvidar.",
    symptoms: [
      "Verifica aplicativos de banco ou redes sociais compulsivamente esperando mudanças.",
      "Sente um aperto físico no peito quando o prazo que você estipulou está chegando.",
      "Interpreta o silêncio do universo como 'algo deu errado' ou 'não sou merecedor'.",
      "Não consegue relaxar e 'soltar' porque acha que se soltar, perde."
    ],
    protocol: [
      "O Jejum de Métricas: Fique 48h sem checar nenhum número relacionado ao seu desejo.",
      "Técnica da Entrega: Quando a ansiedade bater, diga 'O pedido foi feito, a cozinha está preparando'.",
      "Foco no Agora: Sua mente vive no futuro. Traga ela para o corpo presente (respiração)."
    ],
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    icon: Eye
  },
  ARQUITETO: {
    title: "O Arquiteto Rígido",
    subtitle: "Aquele que quer ensinar Deus a trabalhar.",
    description: "Você aceita o milagre, desde que ele siga o SEU roteiro. Você planeja não apenas o destino, mas cada curva do caminho. Se a solução não for 'lógica' ou não vier da fonte que você esperava (ex: trabalho duro), você a rejeita. Sua necessidade de controle bloqueia as vias mais fáceis e rápidas que o Universo poderia usar.",
    trap: "A maldição do 'Como'. Você é viciado em entender a mecânica antes de receber o benefício.",
    symptoms: [
      "Irrita-se profundamente quando imprevistos alteram sua agenda.",
      "Tem dificuldade em delegar tarefas ou confiar que outros farão certo.",
      "Diz frequentemente: 'Não vejo jeito disso acontecer agora'.",
      "Analisa excessivamente os riscos e mata a inspiração com a lógica."
    ],
    protocol: [
      "O Dia do Caos: Permita-se um dia na semana sem roteiro algum. Treine a fluidez.",
      "Afirmação Lógica: 'Existem caminhos que minha mente racional desconhece e eu me abro a eles'.",
      "Foque no Sentimento Final, ignore deliberadamente o meio de transporte."
    ],
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: Lock
  },
  TURISTA: {
    title: "O Turista da Imaginação",
    subtitle: "Visualiza mansões, mas não levanta do sofá.",
    description: "Sua mente é um cinema 8K, mas sua vida física está estagnada. Você usa a espiritualidade como refúgio para não lidar com a realidade material. Você espera o 'momento perfeito' ou a 'inspiração divina' para fazer coisas básicas. Você esqueceu que a Lei da Atração exige co-criação, e a sua parte é o movimento físico.",
    trap: "A Ilusão da Produtividade Mental. Achar que ler sobre o assunto conta como fazer.",
    symptoms: [
      "Coleciona cursos, livros e métodos, mas raramente aplica até o fim.",
      "Sente uma exaustão repentina sempre que precisa executar uma tarefa prática.",
      "Inveja secretamente quem tem resultados rápidos, achando que eles têm 'sorte'.",
      "Vive no mundo dos sonhos para fugir de um presente que não gosta."
    ],
    protocol: [
      "A Regra dos 5 Minutos: Comprometa-se a fazer apenas 5 minutos da tarefa chata.",
      "Corte o consumo de conteúdo: Pare de estudar e comece a executar.",
      "Aterrarem: Faça exercícios físicos pesados para conectar com a terra/realidade."
    ],
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    icon: Target
  },
  MONTANHA: {
    title: "A Montanha-Russa",
    subtitle: "De manhã Buda, de tarde Hulk.",
    description: "Seu poder de manifestação é real, mas você o cancela a cada 3 horas. Você constrói castelos vibracionais pela manhã com sua meditação, e os chuta à tarde ao brigar no trânsito. Essa oscilação violenta de humor confunde o campo quântico. O Universo não sabe se te manda a benção ou a lição, porque você muda de endereço energético o tempo todo.",
    trap: "A Reatividade. Você é um escravo emocional do que acontece do lado de fora.",
    symptoms: [
      "Seu humor depende inteiramente de como as pessoas te tratam.",
      "Começa projetos com euforia total e desiste na primeira dificuldade.",
      "Sente-se vítima das circunstâncias ou de 'energias negativas' dos outros.",
      "Tem picos de fé seguidos por vales profundos de desesperança."
    ],
    protocol: [
      "Blindagem Emocional: Não atenda o telefone ou veja notícias na primeira hora do dia.",
      "A Técnica do Observador: Quando a raiva vier, diga 'Eu estou sentindo raiva', não 'Eu sou raiva'.",
      "Constância > Intensidade: É melhor vibrar 'ok' o dia todo do que 'incrível' por 10 minutos."
    ],
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: Activity
  }
}

// --- PERGUNTAS SITUACIONAIS (SEM GENERICIDADE) ---
const QUESTIONS = [
  {
    question: "1. Terça-feira à tarde. Um boleto inesperado e alto chega no seu e-mail. Qual é o primeiro movimento do seu corpo/mente?",
    options: [
      { id: 'A', text: "Pânico imediato. Coração dispara, começo a fazer contas e checar saldo desesperadamente." }, // Fiscal
      { id: 'D', text: "Raiva. 'Eu não acredito! Por que nada dá certo pra mim? Que universo injusto!'." }, // Montanha
      { id: 'C', text: "Negação. Fecho o e-mail, finjo que não vi e vou ver uma série pra não pensar nisso." }, // Turista
      { id: 'B', text: "Análise fria. 'Ok, de onde vou tirar esse dinheiro? Preciso criar um plano A, B e C agora'." } // Arquiteto
    ]
  },
  {
    question: "2. Você vê no Instagram que uma pessoa 'menos qualificada' que você conseguiu exatamente o que você queria. O que você sente?",
    options: [
      { id: 'B', text: "Julgamento. 'Com certeza foi sorte ou ela conhece alguém. Não faz sentido lógico'." },
      { id: 'D', text: "Inveja dolorosa seguida de culpa. Sinto meu valor diminuir na hora." },
      { id: 'A', text: "Ansiedade. 'Estou ficando para trás. Preciso correr, meu tempo está acabando'." },
      { id: 'C', text: "Distanciamento. 'Ah, legal pra ela'. (Mas no fundo sinto que aquilo é inalcançável pra mim)." }
    ]
  },
  {
    question: "3. Você decide manifestar um relacionamento. Como você age na prática?",
    options: [
      { id: 'C', text: "Visualizo a pessoa perfeita antes de dormir, mas não saio de casa nem baixo apps." },
      { id: 'A', text: "Fico checando se a pessoa visualizou meus stories e analisando cada vírgula das mensagens." },
      { id: 'D', text: "Um dia me sinto a pessoa mais atraente do mundo, no outro me sinto invisível e carente." },
      { id: 'B', text: "Faço uma lista com 50 características obrigatórias. Se faltar uma, eu descarto." }
    ]
  },
  {
    question: "4. Qual é a 'voz' predominante na sua cabeça quando você está tentando dormir?",
    options: [
      { id: 'B', text: "A Voz do Planejador: Repassando o checklist do dia seguinte para garantir que nada dê errado." },
      { id: 'C', text: "A Voz do Sonhador: Criando cenários de fantasia onde sou rico/famoso (enquanto minha vida real está parada)." },
      { id: 'A', text: "A Voz do Cobrador: 'Será que vai dar certo? E se não der? Quanto tempo falta?'." },
      { id: 'D', text: "A Voz do Caos: Relembrando uma briga de 3 anos atrás ou se preocupando com uma catástrofe futura." }
    ]
  },
  {
    question: "5. Sobre 'Ação Inspirada'. O Universo te dá uma ideia de negócio no banho. O que você faz?",
    options: [
      { id: 'D', text: "Fico eufórico, conto pra todo mundo, mas desanimo quando vejo a primeira dificuldade burocrática." },
      { id: 'B', text: "Não faço nada até ter o plano de negócios perfeito, o logo e o site prontos (nunca lanço)." },
      { id: 'A', text: "Faço tudo atropelado e com pressa, querendo resultado na primeira semana." },
      { id: 'C', text: "Acho a ideia genial, anoto no bloco de notas e nunca mais olho." }
    ]
  },
  {
    question: "6. Se eu pudesse te dar uma pílula mágica para resolver um problema seu, qual você tomaria?",
    options: [
      { id: 'C', text: "Pílula da Motivação: Para finalmente conseguir levantar e fazer o que precisa ser feito." },
      { id: 'B', text: "Pílula da Certeza: Para ter garantia escrita de que meu esforço vai valer a pena." },
      { id: 'D', text: "Pílula da Paz: Para parar de oscilar tanto e ter estabilidade emocional." },
      { id: 'A', text: "Pílula da Aceleração: Para que as coisas parem de demorar tanto e aconteçam AGORA." }
    ]
  },
  {
    question: "7. Como você lida com o 'Silêncio' (quando nada parece estar acontecendo)?",
    options: [
      { id: 'A', text: "Entro em colapso. Começo a mudar de técnica a cada 2 dias achando que estou fazendo errado." },
      { id: 'B', text: "Trabalho o triplo. Se não está vindo, é porque não estou me esforçando o bastante." },
      { id: 'D', text: "Acho que o Universo me esqueceu ou está me punindo por algo que fiz." },
      { id: 'C', text: "Acomodo-me. 'Uma hora acontece', e uso isso como desculpa para não mudar nada." }
    ]
  },
  {
    question: "8. Qual frase machuca mais se alguém disser sobre você?",
    options: [
      { id: 'B', text: "'Você é muito rígido/controlador, precisa relaxar'." },
      { id: 'C', text: "'Você tem muito potencial, mas não sai do lugar (fogo de palha)'." },
      { id: 'D', text: "'Você é instável demais, nunca sei com que humor você vai estar'." },
      { id: 'A', text: "'Você é desesperado/carente, isso afasta as pessoas'." }
    ]
  }
]

export default function Diagnostico() {
  const [loading, setLoading] = useState(true)
  const [diagnosis, setDiagnosis] = useState(null)
  
  // Estado do Quiz
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0 })
  const [selectedOption, setSelectedOption] = useState(null) // Para efeito visual do clique
  
  // Efeito de "Flash" ao carregar resultado
  const [showResultAnim, setShowResultAnim] = useState(false)

  useEffect(() => {
    loadUserDiagnosis()
  }, [])

  const loadUserDiagnosis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const data = await getDiagnosis(user.id)
        if (data) {
          setDiagnosis(data.archetype)
          setShowResultAnim(true)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (optionId) => {
    // 1. Feedback Visual (Seleciona o botão)
    setSelectedOption(optionId)

    // 2. Pequeno delay para o usuário ver o clique acontecendo
    setTimeout(() => {
      const newScores = { ...scores, [optionId]: scores[optionId] + 1 }
      setScores(newScores)

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(curr => curr + 1)
        setSelectedOption(null) // Reseta seleção para a próxima
      } else {
        finishQuiz(newScores)
      }
    }, 450) // Delay de 450ms (rápido, mas perceptível)
  }

  const finishQuiz = async (finalScores) => {
    setLoading(true)
    
    // Lógica de Desempate (Prioridade: A > D > B > C)
    let winner = 'A';
    let maxScore = finalScores.A;

    // Se houver empate, a ordem abaixo define quem ganha (baseado na gravidade do bloqueio)
    if (finalScores.D > maxScore) { winner = 'D'; maxScore = finalScores.D; }
    if (finalScores.B > maxScore) { winner = 'B'; maxScore = finalScores.B; }
    if (finalScores.C > maxScore) { winner = 'C'; maxScore = finalScores.C; }
    
    const map = { A: 'FISCAL', B: 'ARQUITETO', C: 'TURISTA', D: 'MONTANHA' }
    const result = map[winner]

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await saveDiagnosis(user.id, result)
      setDiagnosis(result)
      setShowResultAnim(true)
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if(!window.confirm("Isso apagará seu histórico e resultado. Deseja refazer o teste?")) return;
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await resetDiagnosis(user.id)
      setDiagnosis(null)
      setCurrentQuestion(0)
      setScores({ A: 0, B: 0, C: 0, D: 0 })
      setSelectedOption(null)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-400 text-sm animate-pulse">Calibrando frequências...</span>
    </div>
  )

  // --- TELA DE RESULTADO (RELATÓRIO PREMIUM) ---
  if (diagnosis) {
    const profile = PROFILES[diagnosis]
    const Icon = profile.icon

    return (
      <div className={`p-4 md:p-8 max-w-5xl mx-auto pb-24 transition-opacity duration-1000 ${showResultAnim ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* CABEÇALHO DO RESULTADO */}
        <div className="bg-[#16161D] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-8 shadow-2xl">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${profile.color.split('-')[1]}-500 to-transparent opacity-70`}></div>
          
          <div className="relative z-10 text-center">
            <div className={`inline-flex items-center gap-2 mb-6 ${profile.bg} px-4 py-1.5 rounded-full border ${profile.border}`}>
              <Icon size={18} className={profile.color} />
              <span className={`text-xs font-bold tracking-widest uppercase ${profile.color}`}>Seu Arquétipo Vibracional</span>
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${profile.color} drop-shadow-lg`}>
              {profile.title}
            </h1>
            <h2 className="text-xl text-gray-400 font-light italic mb-8">
              "{profile.subtitle}"
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto border-l-2 border-white/10 pl-6">
              {profile.description}
            </p>
          </div>
        </div>

        {/* GRID DE DETALHES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* CARD: A ARMADILHA */}
          <div className="bg-[#16161D] border border-red-500/20 rounded-3xl p-8 relative overflow-hidden hover:border-red-500/40 transition-colors">
             <div className="absolute top-4 right-4 text-red-500 opacity-10"><ShieldAlert size={64}/></div>
             <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle size={20}/> O Grande Bloqueio
             </h3>
             <p className="text-gray-300 leading-relaxed font-medium">
               {profile.trap}
             </p>
          </div>

          {/* CARD: SINTOMAS */}
          <div className="bg-[#16161D] border border-white/5 rounded-3xl p-8 hover:border-purple-500/30 transition-colors">
             <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Activity size={20} className="text-purple-400"/> Sintomas Comuns
             </h3>
             <ul className="space-y-3">
               {profile.symptoms.map((sym, i) => (
                 <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                   <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]"></div>
                   {sym}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* CARD: O PROTOCOLO DE CURA */}
        <div className={`rounded-3xl p-8 md:p-10 border ${profile.border} ${profile.bg} relative overflow-hidden shadow-lg`}>
           <div className="relative z-10">
              <h3 className={`font-bold text-2xl mb-8 flex items-center gap-3 ${profile.color}`}>
                <Zap size={24} className="fill-current" />
                Seu Protocolo de Ativação
              </h3>
              
              <div className="grid gap-4">
                {profile.protocol.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 bg-[#16161D]/90 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                     <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${profile.bg} ${profile.color} border ${profile.border}`}>
                       {i + 1}
                     </span>
                     <p className="text-gray-200 font-medium pt-1">{step}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* BOTÃO REFAZER */}
        <div className="mt-12 text-center">
            <button 
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors group px-6 py-3 rounded-full hover:bg-white/5"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Recalibrar e Refazer Diagnóstico
            </button>
        </div>

      </div>
    )
  }

  // --- TELA DO QUIZ ---
  const question = QUESTIONS[currentQuestion]

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 min-h-[80vh] flex items-center justify-center">
      
      {/* Container Principal com KEY para forçar re-render limpo a cada pergunta */}
      <div key={currentQuestion} className="w-full bg-gradient-to-br from-[#23232E] to-[#1A1A23] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl animate-fade-in-up">
        
        {/* Cabeçalho do Quiz */}
        <div className="flex justify-between items-end mb-6">
           <div className="flex items-center gap-2 text-purple-400">
             <Brain size={16} />
             <span className="font-bold text-xs tracking-wider uppercase">
               Análise Psico-Vibracional
             </span>
           </div>
           <span className="text-gray-500 text-xs font-mono bg-black/20 px-2 py-1 rounded">
             {currentQuestion + 1} / {QUESTIONS.length}
           </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-snug">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.id
            
            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={selectedOption !== null} // Bloqueia cliques múltiplos
                className={`w-full text-left p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden
                  ${isSelected 
                    ? 'bg-purple-600 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                    : 'bg-[#1A1A23] border-white/5 hover:border-purple-500/50 hover:bg-[#20202B]'
                  }
                `}
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                    ${isSelected ? 'border-white' : 'border-gray-600 group-hover:border-purple-500'}
                  `}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 
                      ${isSelected ? 'scale-100' : 'scale-0'}
                    `}></div>
                  </div>
                  <span className={`font-medium text-sm md:text-base transition-colors
                    ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  `}>
                    {opt.text}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}