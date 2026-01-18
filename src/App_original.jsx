import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, ShieldCheck, Star, Zap, User, Mail, Lock, Heart, Radio, X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilitários ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- NOVOS EFEITOS VISUAIS MÁGICOS ---

// Efeito 1: Brasas Roxas/Rosas subindo lentamente
const RisingEmbers = () => {
    // Cria 40 partículas com propriedades aleatórias (Memoizado para performance)
    const embers = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 4 + 2}px`, // Tamanho entre 2px e 6px
        duration: `${Math.random() * 15 + 10}s`, // Duração entre 10s e 25s
        delay: `-${Math.random() * 20}s`, // Começa em momentos diferentes
        color: Math.random() > 0.5 ? 'bg-brand-pink' : 'bg-brand-purple' // Alterna cores
    })), []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {embers.map((ember) => (
                <div
                    key={ember.id}
                    className={cn("absolute rounded-full blur-[1px] animate-ember-rise opacity-0", ember.color)}
                    style={{
                        left: ember.left,
                        width: ember.size,
                        height: ember.size,
                        '--duration': ember.duration,
                        '--delay': ember.delay,
                        bottom: '-5vh' // Começa um pouco abaixo da tela
                    }}
                />
            ))}
        </div>
    );
};

// Efeito 2: Poeira Estelar Cintilante (Stars)
const StarDust = () => {
     const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
    })), []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
             {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle"
                    style={{ top: star.top, left: star.left, animationDelay: star.delay }}
                />
            ))}
        </div>
    )
}


// O Fundo Mágico Completo
const MagicalBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-brand-dark">
    {/* Gradiente de Profundidade */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-brand-deepPurple/40 via-brand-dark to-brand-dark" />
    
    {/* Orbs de luz originais (mantidos para a "Aurora") */}
    <motion.div 
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 12, repeat: Infinity }}
      className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-brand-purple/20 blur-[100px] mix-blend-screen" 
    />
    <motion.div 
      animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
      transition={{ duration: 15, repeat: Infinity }}
      className="absolute top-[10%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-brand-pink/15 blur-[100px] mix-blend-screen" 
    />

    {/* Novos Efeitos Adicionados */}
    <RisingEmbers />
    <StarDust />
    
    {/* Textura de ruído para acabamento premium */}
    <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
  </div>
);

// --- Componentes de UI ---

const MagicBadge = ({ text, icon: Icon }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-pink/40 bg-brand-pink/10 backdrop-blur-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] animate-float relative overflow-hidden group">
    {/* Brilho passando pelo badge */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:animate-shine transition-all" />
    <Icon size={14} className="text-brand-pink animate-pulse z-10" />
    <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-pink to-white z-10">
      {text}
    </span>
  </div>
);

const AnimatedButton = ({ children, primary = false, className, onClick, fullWidth = false }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={cn(
      "relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-500",
      fullWidth ? "w-full" : "w-auto",
      primary 
        ? "bg-gradient-to-r from-brand-pink via-brand-purple to-brand-pink bg-[length:200%_auto] animate-shine text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] border border-white/20 hover:shadow-[0_0_50px_rgba(236,72,153,0.8)]" 
        : "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-brand-pink/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]",
      className
    )}
  >
    {primary && <div className="absolute inset-0 bg-white/30 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />}
    <span className="relative z-10 flex items-center gap-2 text-shadow">{children}</span>
  </motion.button>
);

const FadeIn = ({ children, delay = 0, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Modal de Autenticação (Mantido igual, mas se beneficia do fundo novo) ---
const AuthModal = ({ isOpen, onClose, initialView }) => {
  const [view, setView] = useState(initialView || 'login');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-brand-dark/90 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0f0518]/90 border-t md:border border-brand-pink/20 rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-[0_0_50px_rgba(124,58,237,0.3)] z-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-brand-pink/20 blur-[80px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-purple/30 blur-[60px] rounded-full pointer-events-none mix-blend-screen" />
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"><X size={20}/></button>

            <div className="text-center mb-8 mt-2 relative">
               <Sparkles className="text-brand-pink mx-auto mb-2 animate-pulse" size={24} />
               <h3 className="font-serif text-2xl text-white drop-shadow-lg">Acesse o Portal</h3>
               <p className="text-gray-400 text-sm">Sua nova realidade começa aqui.</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl mb-6 relative z-10">
              {['login', 'signup'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={cn("flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative overflow-hidden", view === tab ? "text-white shadow-lg" : "text-gray-400 hover:text-white")}
                >
                  {view === tab && <motion.div layoutId="tabBg" className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-pink -z-10" />}
                  <span className="relative z-10">{tab === 'login' ? 'Entrar' : 'Criar Conta'}</span>
                </button>
              ))}
            </div>

            <form className="space-y-4 relative z-10" onSubmit={(e) => e.preventDefault()}>
               {view === 'signup' && (
                 <InputField icon={User} type="text" placeholder="Seu nome" />
               )}
               <InputField icon={Mail} type="email" placeholder="Seu e-mail" />
               <InputField icon={Lock} type="password" placeholder="Sua senha" />
               
               <AnimatedButton primary fullWidth className="py-3 mt-4 shadow-lg">
                 {view === 'login' ? 'Acessar Agora' : 'Finalizar Cadastro'}
               </AnimatedButton>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group">
        <Icon className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-brand-pink transition-colors" size={18}/>
        <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-white focus:border-brand-pink/50 focus:bg-white/10 focus:outline-none transition-all duration-300 placeholder:text-gray-500 group-hover:border-white/20" />
        {/* Glow no focus */}
        <div className="absolute inset-0 rounded-xl bg-brand-pink/20 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none -z-10" />
    </div>
)


// --- Seções com Efeitos Potencializados ---

const Header = ({ onAuth }) => (
  <header className="fixed top-0 w-full z-50 px-4 py-4 md:px-8 bg-brand-dark/60 backdrop-blur-xl border-b border-white/5 flex justify-between items-center transition-all duration-300 supports-[backdrop-filter]:bg-brand-dark/40">
    <div className="flex items-center gap-2 font-serif text-xl font-bold text-white tracking-tighter group cursor-pointer">
      <div className="relative bg-gradient-to-br from-brand-pink to-brand-purple p-1.5 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition-shadow">
        <Sparkles size={16} className="text-white fill-white/20 group-hover:animate-spin-slow" />
        <div className="absolute inset-0 bg-white/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      </div>
      Percepção<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple animate-shine bg-[length:200%_auto]">Social</span>
    </div>
    <AnimatedButton onClick={() => onAuth('login')} className="text-xs md:text-sm px-5 py-2">
      Área de Membros
    </AnimatedButton>
  </header>
);

const Hero = ({ onAuth }) => (
  <section className="relative min-h-[100dvh] flex flex-col justify-center items-center px-4 pt-24 pb-10 overflow-hidden text-center z-10">
    
    <FadeIn delay={0.1}>
      <MagicBadge text="Frequência de Alta Vibração" icon={Zap} />
    </FadeIn>

    {/* TÍTULO PRINCIPAL COM GLOW EXTREMO */}
    <FadeIn delay={0.2} className="mt-8 mb-6 relative z-20">
      <h1 className="font-serif text-4xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.1] tracking-tight drop-shadow-lg">
        Eleve sua
      </h1>
      <div className="relative inline-block mt-2">
        {/* O Texto com Gradiente e o novo drop-shadow-magical */}
        <span className="font-serif text-5xl md:text-7xl lg:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#ff66c4] via-white to-[#a855f7] animate-shine bg-[length:200%_auto] drop-shadow-magical relative z-10">
          frequência vibracional
        </span>
        
        {/* Efeitos de Luz atrás do texto (Turbinados) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-brand-pink/40 blur-[100px] -z-10 opacity-60 animate-pulse-slow mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-brand-purple/40 blur-[60px] -z-10 opacity-50 mix-blend-screen" />
        
        {/* Partículas saindo do texto */}
        <Sparkles className="absolute -top-4 -right-8 text-brand-pink animate-bounce opacity-70" size={24} />
        <Sparkles className="absolute -bottom-4 -left-8 text-brand-purple animate-pulse opacity-70 delay-700" size={20} />
      </div>
    </FadeIn>

    <FadeIn delay={0.4} className="max-w-xl mx-auto mt-6 relative z-20">
      <p className="text-gray-200 text-base md:text-xl leading-relaxed font-light drop-shadow">
        Descubra qual energia você está emitindo e por que atrai situações que não te valorizam. 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-orange font-bold block mt-2 drop-shadow-sm">Mude sua vibração. O universo responde.</span>
      </p>
    </FadeIn>

    {/* Card de Oferta Hero (Com efeito de borda mágica no hover) */}
    <FadeIn delay={0.6} className="w-full max-w-sm mt-10 relative z-20 group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-pink rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-shine bg-[length:200%_auto]"></div>
      <div className="relative bg-brand-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden hover:border-brand-pink/30 transition-colors">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-pink to-brand-purple text-[10px] font-bold px-3 py-1 rounded-bl-lg text-white uppercase tracking-wider shadow-lg">
          Oferta Relâmpago
        </div>
        
        <div className="flex flex-col gap-1 mb-5">
          <span className="text-gray-400 text-sm line-through">De R$ 42,00</span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">R$ 17,50</span>
            <span className="bg-brand-pink/20 border border-brand-pink/30 text-brand-pink text-xs font-bold px-2 py-0.5 rounded animate-pulse">HOJE</span>
          </div>
        </div>

        <AnimatedButton primary fullWidth onClick={() => onAuth('signup')} className="shadow-[0_0_30px_rgba(236,72,153,0.4)] py-4 text-lg">
          Quero Alinhar Minha Energia <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
        </AnimatedButton>
        
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-3">
          <ShieldCheck size={12} className="text-brand-pink"/> Acesso Imediato e Garantido
        </p>
      </div>
    </FadeIn>
  </section>
);

// Cards com efeito de Hover Mágico
const Benefits = () => {
  const items = [
    { icon: Radio, title: "Raio-X Vibracional", desc: "Identifique sua frequência exata e o que ela está atraindo." },
    { icon: Heart, title: "Ímã de Relacionamentos", desc: "Sintonize a vibração que atrai pessoas de alto valor." },
    { icon: Zap, title: "Quebra de Bloqueios", desc: "Destrua as crenças ocultas que repelem a abundância." },
    { icon: Sparkles, title: "Reprogramação Quântica", desc: "Técnicas para mudar seu estado vibracional em segundos e adquirir suas manifestações." },
  ];

  return (
    <section className="py-24 px-4 md:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <FadeIn>
                <h2 className="font-serif text-3xl md:text-5xl text-white mb-4 drop-shadow-lg">
                O que acontece quando você <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple drop-shadow-magical italic">alinha sua energia?</span>
                </h2>
            </FadeIn>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              {/* Card Mágico */}
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative h-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl overflow-hidden group transition-all duration-500 hover:border-brand-pink/40 hover:shadow-card-hover"
              >
                {/* Luz interna no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-pink/30 group-hover:scale-110 group-hover:rotate-3 transition-all relative z-10">
                  <item.icon size={28} />
                  {/* Partículas no ícone */}
                  <Sparkles className="absolute -top-2 -right-2 text-white opacity-0 group-hover:opacity-100 animate-pulse" size={12}/>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif relative z-10 group-hover:text-brand-pink transition-colors">{item.title}</h3>
                <p className="text-base text-gray-300 leading-relaxed relative z-10 group-hover:text-white transition-colors">{item.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-24 px-4 relative z-10 bg-brand-dark/30">
    <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
            <MagicBadge text="Histórias Reais" icon={Star} />
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-6 mb-12 drop-shadow-lg">
                Quem mudou de frequência, <br/> <span className="italic text-brand-pink">mudou de vida.</span>
            </h2>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { name: "Mariana Carvalho", text: "Eu tentei por muito tempo e não conseguia atrair oq eu queria. Mas essa função de achar um perfil me ajudou muito a ter uma direção. Em 2 semanas consegui minha primeira manifestação!" },
           { name: "Carlos Henrique", text: "Vou ser sincero pessoal, achei que era papo furado, mas a precisão sobre minhas dificuldades foi insana, como se me conhecessem. E também as dicas que vem com cada perfil, muito bom pra quem tá estagnado e não sabe oq fazer." },
           { name: "Antônio992.", text: "A sensação de paz depois de entender minha própria energia não tem preço. Parei de forçar e comecei a fluir." }
         ].map((t, i) => (
           <FadeIn key={i} delay={i * 0.2}>
             <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-brand-deepPurple/80 to-brand-dark border border-brand-purple/20 p-8 rounded-3xl text-left relative group hover:border-brand-pink/30 transition-colors hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
               <div className="absolute top-4 left-6 text-brand-pink/20 font-serif text-8xl leading-none select-none">“</div>
               <div className="flex gap-1 mb-4 relative z-10">
                 {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-brand-orange text-brand-orange drop-shadow" />)}
               </div>
               <p className="text-gray-200 text-base italic mb-6 relative z-10 leading-relaxed">"{t.text}"</p>
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {t.name.charAt(0)}
                 </div>
                 <div>
                    <span className="text-white font-bold text-sm block">{t.name}</span>
                    <span className="text-brand-pink text-xs flex items-center gap-1"><CheckCircle size={10}/> Compra Verificada</span>
                 </div>
               </div>
             </motion.div>
           </FadeIn>
         ))}
      </div>
    </div>
  </section>
);

const PricingFooter = ({ onAuth }) => (
  <section className="py-24 px-4 relative z-10 overflow-hidden">
    {/* Luz de fundo final */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-brand-pink/20 blur-[120px] -z-10 opacity-50 pointer-events-none mix-blend-screen" />

    <div className="max-w-lg mx-auto relative">
       <FadeIn delay={0.2}>
       {/* Borda pulsante externa */}
       <div className="absolute -inset-1 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-orange rounded-[3rem] blur-md opacity-60 animate-pulse-slow" />
       
       <div className="relative bg-brand-dark/90 backdrop-blur-2xl border border-brand-pink/30 rounded-[2.5rem] p-8 md:p-12 text-center overflow-hidden group hover:border-brand-pink/50 transition-colors">
         {/* Efeitos internos do card */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(236,72,153,0.2),transparent_70%)] opacity-50 group-hover:opacity-80 transition-opacity" />
         
         <Sparkles className="text-brand-pink mx-auto mb-4 animate-bounce-slow" size={32} />
         <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 relative z-10 drop-shadow-lg">Sua Oportunidade Final</h2>
         <p className="text-gray-300 text-base mb-8 relative z-10 leading-relaxed">
            O universo trouxe você até aqui. Não ignore este sinal. O preço vai subir em breve.
         </p>

         <div className="mb-8 relative z-10 inline-block">
             <span className="text-gray-500 text-lg line-through block mb-1">R$ 42,00</span>
             <div className="text-6xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                R$17<span className="text-3xl text-gray-300">,50</span>
            </div>
             <div className="bg-brand-pink/20 text-brand-pink text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mt-2 border border-brand-pink/30 animate-pulse">Acesso Vitalício</div>
         </div>

         <ul className="text-left space-y-4 mb-10 relative z-10 max-w-sm mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
            {[
                "Diagnóstico Vibracional Completo", 
                "Mapa de Bloqueios Ocultos", 
                "Guia de Reprogramação Imediata", 
                "Bônus Incluídos: Áudios Vibracionais, Meditações guiadas para diferentes objetivos, Assistente de Afirmações, Assistente IA",
            
            ].map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-200 text-sm md:text-base">
                <div className="mt-1 bg-brand-pink/20 p-1 rounded-full">
                    <CheckCircle size={16} className="text-brand-pink flex-shrink-0" /> 
                </div>
                <span className={i > 2 ? "text-white font-semibold" : ""}>{feat}</span>
              </li>
            ))}
         </ul>

         <AnimatedButton primary fullWidth onClick={() => onAuth('signup')} className="shadow-[0_0_40px_rgba(236,72,153,0.5)] animate-pulse-slow py-5 text-lg group">
            SIM, QUERO MINHA TRANSFORMAÇÃO <ArrowRight className="group-hover:translate-x-2 transition-transform" />
         </AnimatedButton>
         
         <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 relative z-10 bg-brand-dark/50 p-3 rounded-xl border border-white/5">
           <ShieldCheck size={16} className="text-green-400 flex-shrink-0" /> 
           <span>Garantia incondicional de 7 dias. Risco zero para você.</span>
         </div>
       </div>
       </FadeIn>
    </div>
  </section>
);

// --- APP PRINCIPAL ---

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login');

  const handleOpenAuth = (view) => {
    setAuthView(view);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-pink/40 selection:text-white font-sans overflow-x-hidden relative">
      <MagicalBackground />
      
      <Header onAuth={handleOpenAuth} />
      
      <main className="relative z-10">
        <Hero onAuth={handleOpenAuth} />
        <Benefits />
        <Testimonials />
        <PricingFooter onAuth={handleOpenAuth} />
      </main>

      <footer className="py-10 text-center text-gray-500 text-sm relative z-10 border-t border-white/5 bg-brand-dark/80 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-white mb-4 opacity-70 hover:opacity-100 transition-opacity">
            <Sparkles size={14} className="text-brand-pink" /> Percepção<span className="text-brand-pink">Social</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
        <p className="mt-4 text-xs opacity-60 max-w-md mx-auto px-4 leading-relaxed">
            Os resultados podem variar. Este site não tem afiliação com o Facebook/Meta ou qualquer outra plataforma social.
        </p>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialView={authView} />
    </div>
  );
}

export default App;

