import { loginWithSpotify } from '../auth/spotify'

export default function Login() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden animate-page-enter">

      {/* Fondos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-125 h-125 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #facc15, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.02) 60px, rgba(255,255,255,0.02) 61px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">

        {/* Logo */}
        <div className="mb-12">
          <p className="text-zinc-500 tracking-[6px] text-xs uppercase mb-4 font-body">
            ♪ El juego musical
          </p>
          <h1 className="text-[100px] leading-none font-black text-white font-display tracking-[-3px]">
            HIT<span className="text-yellow-400">STER</span>
          </h1>
          <div className="flex items-center gap-3 justify-center mt-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <p className="text-zinc-600 text-xs tracking-widest uppercase font-body">
              ¿Conoces la canción?
            </p>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-12 space-y-2">
          {['🎵 Escucha la canción', '🎤 Adivina artista y título', '📅 Colócala en el tiempo'].map((text, i) => (
            <p key={i} className="text-zinc-500 text-sm tracking-wide font-body">
              {text}
            </p>
          ))}
        </div>

        {/* Botón */}
        <button
          onClick={loginWithSpotify}
          className="w-full py-5 text-xl tracking-[4px] uppercase font-black font-display
            bg-yellow-400 text-zinc-950
            transition-all duration-200 hover:scale-105 active:scale-95">
          Conectar con Spotify
        </button>

        <p className="text-zinc-700 text-xs mt-6 tracking-wide font-body">
          Necesitas cuenta Spotify Premium
        </p>
      </div>
    </div>
  )
}
