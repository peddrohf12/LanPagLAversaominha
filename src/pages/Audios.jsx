import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Music, Headphones, Heart } from 'lucide-react'
import { GlassCard } from '../components/glassCard'

// --- IMPORTAÇÃO DOS ARQUIVOS DE ÁUDIO (Do src/assets/audios) ---
// Certifique-se de que os arquivos existem nestes caminhos exatos:
import audioAbundancia from '../assets/audios/abundancia.mp3'
import audioIdentidade from '../assets/audios/identidade.mp3'
import audioRelacionamento from '../assets/audios/relacionamentos.mp3'
import audioEstima from '../assets/audios/autoestimaReconhecimneto.mp3'

// --- CONFIGURAÇÃO DA PLAYLIST ---
const TRACKS = [
  { 
    id: 1, 
    title: "Afirmações de Abundância", 
    category: "Afirmações", 
    src: audioAbundancia // Usa a variável importada
  },
  { 
    id: 2, 
    title: "Afirmações de Identidade", 
    category: "Afirmações", 
    src: audioIdentidade  
  },
  { 
    id: 3, 
    title: "Afirmações de Relacionamento", 
    category: "Afirmações", 
    src: audioRelacionamento 
  },
  { 
    id: 4, 
    title: "Afirmações para Autoestima", 
    category: "Afirmações", 
    src: audioEstima 
  },
]

const Audios = () => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Referência ao elemento de áudio
  const audioRef = useRef(null)

  const formatTime = (seconds) => {
    if (!seconds) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Interação necessária:", e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  const togglePlay = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleTrackEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 space-y-8">
      
      {/* Elemento de áudio invisível */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnded}
          autoPlay
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Headphones className="text-cyan-400" size={32} />
            Templo de Áudio
          </h2>
          <p className="text-gray-400 mt-1">Frequências para alinhar sua vibração.</p>
        </div>
      </div>

      {/* PLAYER EM DESTAQUE */}
      <div className={`transition-all duration-500 ${currentTrack ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 hidden'}`}>
        {currentTrack && (
          <GlassCard className="p-8 border-cyan-500/20 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-32 h-32 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl relative group">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Music size={40} className="text-cyan-200" />
              </div>

              <div className="flex-1 text-center md:text-left space-y-4 w-full">
                <div>
                  <h3 className="text-2xl font-bold text-white">{currentTrack.title}</h3>
                  <p className="text-cyan-300/70 text-sm font-medium tracking-wide uppercase">{currentTrack.category}</p>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                  </button>
                  
                  <div className="text-xs font-mono text-cyan-200/80">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 relative w-full h-2 group">
               <div className="absolute w-full h-full bg-white/10 rounded-full"></div>
               <div 
                 className="absolute h-full bg-cyan-400 rounded-full pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.8)]" 
                 style={{ width: `${(currentTime / duration) * 100}%` }}
               ></div>
               <input 
                 type="range" 
                 min={0} 
                 max={duration || 100} 
                 value={currentTime} 
                 onChange={handleSeek}
                 className="absolute w-full h-full opacity-0 cursor-pointer z-10"
               />
            </div>
          </GlassCard>
        )}
      </div>

      {/* LISTA DE MÚSICAS */}
      <GlassCard className="p-2">
        {TRACKS.map((track) => {
          const isActive = currentTrack?.id === track.id
          return (
            <div 
              key={track.id}
              onClick={() => togglePlay(track)}
              className={`
                group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border
                ${isActive 
                  ? 'bg-white/10 border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' 
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                }
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                {isActive && isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill={isActive ? "black" : "currentColor"} className={isActive ? "ml-0" : "ml-0.5"} />}
              </div>

              <div className="flex-1">
                <h4 className={`font-medium ${isActive ? 'text-cyan-300' : 'text-gray-200 group-hover:text-white'}`}>{track.title}</h4>
                <span className="text-xs text-gray-500">{track.category}</span>
              </div>
              
              <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100">
                <Heart size={16} />
              </button>
            </div>
          )
        })}
      </GlassCard>
    </div>
  )
}

export default Audios