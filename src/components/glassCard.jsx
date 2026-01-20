import React from 'react';

// Esse componente aceita qualquer coisa dentro (children) e aplica o efeito de vidro
export const GlassCard = ({ children, className = "", hoverEffect = false }) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-[#1A1A23]/60            /* Fundo escuro semi-transparente */
      backdrop-blur-xl           /* O desfoque poderoso (vidro fosco) */
      border border-white/10     /* Borda sutil */
      shadow-xl                  /* Sombra para profundidade */
      rounded-3xl                /* Bordas bem redondas como na imagem */
      transition-all duration-300
      ${hoverEffect ? 'hover:bg-[#1A1A23]/80 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]' : ''}
      ${className}
    `}>
      {/* Um brilho sutil no topo do cartão para dar volume 3D */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* O conteúdo real */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};