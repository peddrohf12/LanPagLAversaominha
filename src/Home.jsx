import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, ShieldCheck, Star, Zap, User, Mail, Lock, Heart, Radio, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentPage from './PaymentPage';

// --- Utilitários ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- EFEITOS VISUAIS OTIMIZADOS (CSS PURO) ---
const OptimizedBackgroundStyles = () => (
  <style>{`
    @keyframes blob-pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.1); opacity: 0.5; }
    }
    @keyframes blob-float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    @keyframes ember-rise {
      0% { transform: translateY(0) scale(1); opacity: 0; }
      20% { opacity: 0.6; }
      100% { transform: translateY(-100vh) scale(0); opacity: 0; }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    .animate-blob-pulse { animation: blob-pulse 8s infinite ease-in-out; }
    .animate-blob-float { animation: blob-float 20s infinite ease-in-out; }
    .animate-ember-rise { animation: ember-rise var(--duration) infinite linear; animation-delay: var(--delay); }
    .animate-twinkle { animation: twinkle 3s infinite ease-in-out; }
  `}</style>
);

const RisingEmbers = React.memo(() => {
    // Reduzi levemente a quantidade para mobile (40 -> 25) imperceptível visualmente, mas melhor performance
    const embers = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 4 + 2}px`,
        duration: `${Math.random() * 15 + 10}s`,
        delay: `-${Math.random() * 20}s`,
        color: Math.random() > 0.5 ? 'bg-pink-500' : 'bg-purple-600' // Cores hardcoded para evitar dependência do tailwind config
    })), []);
    
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
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
                        bottom: '-10px' 
                    }} 
                />
            ))}
        </div>
    );
});

const StarDust = React.memo(() => {
     const stars = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, delay: `${Math.random() * 4}s`,
    })), []);
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
             {stars.map((star) => (
                <div key={star.id} className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle" style={{ top: star.top, left: star.left, animationDelay: star.delay }} />
            ))}
        </div>
    )
});

const MagicalBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0D0221]">
    <OptimizedBackgroundStyles />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(88,28,135,0.4),_transparent_70%)]" />
    
    {/* Substituído Framer Motion por CSS Animation para liberar a thread principal do JS */}
    <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-purple-600/20 blur-[80px] mix-blend-screen animate-blob-pulse" />
    <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-pink-600/15 blur-[80px] mix-blend-screen animate-blob-float" />
    
    <RisingEmbers />
    <StarDust />
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
  </div>
);

// --- COMPONENTES DE UI ---
const MagicBadge = ({ text, icon: Icon }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/5 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.3)] relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-shine transition-all" />
    <Icon size={14} className="text-pink-400 animate-pulse z-10" />
    <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-300 to-white z-10">
      {text}
    </span>
  </div>
);

const AnimatedButton = ({ children, primary = false, className, onClick, fullWidth = false, disabled = false }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300",
      fullWidth ? "w-full" : "w-auto",
      disabled ? "opacity-50 cursor-not-allowed" : "",
      primary 
        ? "bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-shine text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] border border-white/20" 
        : "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-pink-500/30",
      className
    )}
  >
    <span className="relative z-10 flex items-center gap-2 text-shadow-sm">{children}</span>
  </motion.button>
);

const FadeIn = ({ children, delay = 0, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }} // Reduzi o Y para suavizar no mobile
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const InputField = ({ icon: Icon, onChange, value, ...props }) => (
    <div className="relative group">
        <Icon className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-pink-400 transition-colors" size={18}/>
        <input 
          {...props} 
          value={value}
          onChange={onChange}
          className="w-full bg-[#1A1A23] border border-white/10 rounded-xl py-3 pl-10 text-white focus:border-pink-500/50 focus:bg-[#20202B] focus:outline-none transition-all duration-300 placeholder:text-gray-500" 
        />
    </div>
)

// --- AUTH MODAL (MANTIDO EXATAMENTE IGUAL NA LÓGICA) ---
const AuthModal = ({ isOpen, onClose, initialView }) => {
  const [view, setView] = useState(initialView || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      if (view === 'signup') {
        if (!name || !email || !password) { setError('Preencha todos os campos'); setLoading(false); return; }
        if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); setLoading(false); return; }

        const { error: signUpError } = await signUp(email, password, name);
        if (signUpError) setError(signUpError);
        else { setSuccess('Conta criada! Verifique seu e-mail.'); setTimeout(() => { setView('login'); setSuccess(''); }, 3000); }
      } else {
        if (!email || !password) { setError('Preencha todos os campos'); setLoading(false); return; }
        const { error: signInError } = await signIn(email, password);
        if (signInError) setError(signInError);
        else { setSuccess('Login realizado!'); setTimeout(onClose, 1000); }
      }
    } catch (err) { setError('Ocorreu um erro. Tente novamente.'); } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0a0a0e]/90 backdrop-blur-sm" />
          <motion.div 
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0f0518] border-t md:border border-pink-500/20 rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-[0_0_50px_rgba(124,58,237,0.2)] z-10 overflow-hidden"
          >
            {/* Background Effects no Modal */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none" />
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"><X size={20}/></button>

            <div className="text-center mb-8 mt-2 relative">
               <Sparkles className="text-pink-500 mx-auto mb-2 animate-pulse" size={24} />
               <h3 className="font-serif text-2xl text-white drop-shadow-lg">Acesse o Portal</h3>
               <p className="text-gray-400 text-sm">Sua nova realidade começa aqui.</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl mb-6 relative z-10">
              {['login', 'signup'].map((tab) => (
                <button key={tab} onClick={() => { setView(tab); setError(''); setSuccess(''); }} className={cn("flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative overflow-hidden", view === tab ? "text-white shadow-lg" : "text-gray-400 hover:text-white")}>
                  {view === tab && <motion.div layoutId="tabBg" className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 -z-10" />}
                  <span className="relative z-10">{tab === 'login' ? 'Entrar' : 'Criar Conta'}</span>
                </button>
              ))}
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm relative z-10"><AlertCircle size={16} /><span>{error}</span></div>}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm relative z-10"><CheckCircle size={16} /><span>{success}</span></div>}

            <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
               {view === 'signup' && <InputField icon={User} type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />}
               <InputField icon={Mail} type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}/>
               <InputField icon={Lock} type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
               
               <AnimatedButton primary fullWidth className="py-3 mt-4 shadow-lg" disabled={loading}>
                 {loading ? 'Processando...' : (view === 'login' ? 'Acessar Agora' : 'Finalizar Cadastro')}
               </AnimatedButton>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- SEÇÕES DA LANDING PAGE ---
const Header = ({ onAuth }) => (
  <header className="fixed top-0 w-full z-50 px-4 py-4 md:px-8 bg-[#0D0221]/70 backdrop-blur-md border-b border-white/5 flex justify-between items-center transition-all duration-300">
    <div className="flex items-center gap-2 font-serif text-xl font-bold text-white tracking-tighter group cursor-pointer">
      <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-shadow">
        <Sparkles size={16} className="text-white fill-white/20 group-hover:rotate-12 transition-transform" />
      </div>
      Percepção<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Social</span>
    </div>
    <AnimatedButton onClick={() => onAuth('login')} className="text-xs md:text-sm px-5 py-2">Área de Membros</AnimatedButton>
  </header>
);

const Hero = ({ onAuth }) => (
  <section className="relative min-h-[100dvh] flex flex-col justify-center items-center px-4 pt-24 pb-10 overflow-hidden text-center z-10">
    <FadeIn delay={0.1}><MagicBadge text="Frequência de Alta Vibração" icon={Zap} /></FadeIn>
    <FadeIn delay={0.2} className="mt-8 mb-6 relative z-20">
      <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.1] tracking-tight drop-shadow-lg">Eleve sua</h1>
      <div className="relative inline-block mt-2">
        <span className="font-serif text-5xl md:text-7xl lg:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#ff66c4] via-white to-[#a855f7] animate-shine bg-[length:200%_auto] drop-shadow-[0_0_30px_rgba(236,72,153,0.3)] relative z-10">frequência vibracional</span>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-pink-500/20 blur-[80px] -z-10 opacity-60 mix-blend-screen" />
      </div>
    </FadeIn>
    <FadeIn delay={0.4} className="max-w-xl mx-auto mt-6 relative z-20">
      <p className="text-gray-200 text-base md:text-xl leading-relaxed font-light drop-shadow">Descubra qual energia você está emitindo e por que atrai situações que não te valorizam. <span className="text-pink-300 font-bold block mt-2">Mude sua vibração. O universo responde.</span></p>
    </FadeIn>
    <FadeIn delay={0.6} className="w-full max-w-sm mt-10 relative z-20 group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-[#13062E] border border-white/10 rounded-2xl p-6 overflow-hidden hover:border-pink-500/30 transition-colors">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-600 to-purple-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg text-white uppercase tracking-wider shadow-lg">Oferta Relâmpago</div>
        <div className="flex flex-col gap-1 mb-5">
          <span className="text-gray-400 text-sm line-through">De R$ 42,00</span>
          <div className="flex items-center justify-center gap-2"><span className="text-4xl font-bold text-white drop-shadow">R$ 17,50</span><span className="bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-bold px-2 py-0.5 rounded">HOJE</span></div>
        </div>
        <AnimatedButton primary fullWidth onClick={() => onAuth('signup')} className="shadow-[0_0_20px_rgba(236,72,153,0.3)] py-4 text-lg">Quero Alinhar Minha Energia <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></AnimatedButton>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-3"><ShieldCheck size={12} className="text-pink-400"/> Acesso Imediato e Garantido</p>
      </div>
    </FadeIn>
  </section>
);

const Benefits = () => {
  const items = [
    { icon: Radio, title: "Raio-X Vibracional", desc: "Identifique sua frequência exata e o que ela está atraindo." },
    { icon: Heart, title: "Ímã de Relacionamentos", desc: "Sintonize a vibração que atrai pessoas de alto valor." },
    { icon: Zap, title: "Quebra de Bloqueios", desc: "Destrua as crenças ocultas que repelem a abundância." },
    { icon: Sparkles, title: "Reprogramação Quântica", desc: "Técnicas para mudar seu estado vibracional em segundos." },
  ];
  return (
    <section className="py-24 px-4 md:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <FadeIn><h2 className="font-serif text-3xl md:text-5xl text-white mb-4 drop-shadow-lg">O que acontece quando você <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 italic">alinha sua energia?</span></h2></FadeIn>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <motion.div whileHover={{ y: -5 }} className="relative h-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl overflow-hidden group transition-all duration-300 hover:border-pink-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-all relative z-10"><item.icon size={28} /></div>
                <h3 className="text-xl font-bold text-white mb-3 font-serif relative z-10 group-hover:text-pink-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-24 px-4 relative z-10 bg-[#0A0510]/50">
    <div className="max-w-4xl mx-auto text-center">
      <FadeIn><MagicBadge text="Histórias Reais" icon={Star} /><h2 className="font-serif text-3xl md:text-4xl text-white mt-6 mb-12 drop-shadow-lg">Quem mudou de frequência, <br/> <span className="italic text-pink-400">mudou de vida.</span></h2></FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { name: "Mariana Carvalho", text: "Eu tentei por muito tempo e não conseguia atrair oq eu queria. Mas essa função de achar um perfil me ajudou muito a ter uma direção." },
           { name: "Carlos Henrique", text: "Vou ser sincero pessoal, achei que era papo furado, mas a precisão sobre minhas dificuldades foi insana, como se me conhecessem." },
           { name: "Antônio992.", text: "A sensação de paz depois de entender minha própria energia não tem preço. Parei de forçar e comecei a fluir." }
         ].map((t, i) => (
           <FadeIn key={i} delay={i * 0.2}>
             <motion.div whileHover={{ y: -5 }} className="bg-[#120822] border border-white/5 p-8 rounded-3xl text-left relative group hover:border-pink-500/20 transition-colors">
               <div className="absolute top-4 left-6 text-pink-500/10 font-serif text-8xl leading-none select-none">"</div>
               <div className="flex gap-1 mb-4 relative z-10">{[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-orange-400 text-orange-400" />)}</div>
               <p className="text-gray-300 text-sm italic mb-6 relative z-10 leading-relaxed">"{t.text}"</p>
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">{t.name.charAt(0)}</div>
                 <div><span className="text-white font-bold text-sm block">{t.name}</span><span className="text-pink-400 text-[10px] flex items-center gap-1"><CheckCircle size={10}/> Compra Verificada</span></div>
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
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-pink-600/10 blur-[120px] -z-10 opacity-50 pointer-events-none mix-blend-screen" />
    <div className="max-w-lg mx-auto relative">
       <FadeIn delay={0.2}>
       <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-[3rem] blur opacity-40 animate-pulse" />
       <div className="relative bg-[#0D0221]/90 backdrop-blur-xl border border-pink-500/20 rounded-[2.5rem] p-8 md:p-12 text-center overflow-hidden group hover:border-pink-500/40 transition-colors">
         <Sparkles className="text-pink-500 mx-auto mb-4 animate-bounce-slow" size={32} />
         <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 relative z-10 drop-shadow-lg">Sua Oportunidade Final</h2>
         <p className="text-gray-300 text-base mb-8 relative z-10 leading-relaxed">O universo trouxe você até aqui. Não ignore este sinal. O preço vai subir em breve.</p>
         <div className="mb-8 relative z-10 inline-block">
             <span className="text-gray-500 text-lg line-through block mb-1">R$ 42,00</span>
             <div className="text-6xl font-bold text-white tracking-tight drop-shadow">R$17<span className="text-3xl text-gray-400">,50</span></div>
             <div className="bg-pink-500/10 text-pink-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mt-2 border border-pink-500/20">Acesso Vitalício</div>
         </div>
         <ul className="text-left space-y-4 mb-10 relative z-10 max-w-sm mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
            {["Diagnóstico Vibracional", "Mapa de Bloqueios", "Guia de Reprogramação", "Bônus: Áudios & IA"].map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-200 text-sm md:text-base"><div className="mt-1 bg-pink-500/20 p-1 rounded-full"><CheckCircle size={16} className="text-pink-400 flex-shrink-0" /></div><span>{feat}</span></li>
            ))}
         </ul>
         <AnimatedButton primary fullWidth onClick={() => onAuth('signup')} className="shadow-[0_0_30px_rgba(236,72,153,0.3)] py-5 text-lg group">SIM, QUERO MINHA TRANSFORMAÇÃO <ArrowRight className="group-hover:translate-x-2 transition-transform" /></AnimatedButton>
         <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 relative z-10 bg-[#0A0510]/50 p-3 rounded-xl border border-white/5"><ShieldCheck size={16} className="text-green-400 flex-shrink-0" /><span>Garantia incondicional de 7 dias.</span></div>
       </div>
       </FadeIn>
    </div>
  </section>
);

// --- COMPONENTE PRINCIPAL ---
function Home() { 
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const { user, loading, checkPaidAccess } = useAuth();
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  
  const navigate = useNavigate();

  const handleOpenAuth = (view) => {
    setAuthView(view);
    setAuthOpen(true);
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (user && !loading) {
        setAuthOpen(false);
        const hasAccess = await checkPaidAccess();
        if (hasAccess) {
          navigate('/sucesso'); 
        } else {
          setShowPaymentPage(true);
        }
      }
    };
    checkAccess();
  }, [user, loading, checkPaidAccess, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0221] flex items-center justify-center">
        <Sparkles className="text-pink-500 animate-spin" size={48} />
      </div>
    );
  }

  if (user && showPaymentPage) {
    return (
      <PaymentPage 
        onBack={() => setShowPaymentPage(false)}
        onSuccess={async () => {
          const hasAccess = await checkPaidAccess();
          if (hasAccess) navigate('/sucesso');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0221] text-white selection:bg-pink-500/30 selection:text-white font-sans overflow-x-hidden relative">
      <MagicalBackground />
      <Header onAuth={handleOpenAuth} />
      <main className="relative z-10">
        <Hero onAuth={handleOpenAuth} />
        <Benefits />
        <Testimonials />
        <PricingFooter onAuth={handleOpenAuth} />
      </main>

      <footer className="py-10 text-center text-gray-500 text-sm relative z-10 border-t border-white/5 bg-[#0D0221]/90 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-white mb-4 opacity-70 hover:opacity-100 transition-opacity">
            <Sparkles size={14} className="text-pink-500" /> Percepção<span className="text-pink-500">Social</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialView={authView} />
    </div>
  );
}

export default Home;