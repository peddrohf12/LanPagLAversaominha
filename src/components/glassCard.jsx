import React from 'react';

export const GlassCard = ({ children, className = "", hoverEffect = false }) => {
  return (
    <div className={`
      relative overflow-hidden
      
      /* MUDANÇA AQUI: Fundo mais "rico" e menos "cinza morto" */
      bg-gradient-to-br from-purple-900/30 via-[#1A1A23]/40 to-black/40
      
      /* Blur mais forte para o efeito etéreo */
      backdrop-blur-2xl
      
      /* Borda mais brilhante e colorida (mistura roxo com ciano sutil) */
      border border-white/10
      border-t-white/20 border-l-white/15
      
      shadow-xl
      rounded-3xl
      transition-all duration-500
      
      /* Hover: Acende o card levemente */
      ${hoverEffect ? 'hover:bg-purple-900/40 hover:border-purple-400/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]' : ''}
      
      ${className}
    `}>
      {/* Brilho Superior (Luz de cima) */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Brilho Inferior (Luz de baixo - oposto, ciano para contraste etéreo) */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Linha de brilho na borda superior */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};