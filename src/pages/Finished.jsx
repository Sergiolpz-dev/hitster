import { useGameStore } from '../store/gameStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Finished() {
    const { players, resetGame } = useGameStore()
    const navigate = useNavigate()

    // Si nadie ha jugado, redirige al menú
    useEffect(() => {
        if (players.length === 0) navigate('/')
    }, [])

    const hasPlayed = players.some(p => p.score > 0 || p.timeline.length > 0)
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const winner = sorted[0]
    const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score

    const handlePlayAgain = () => {
        resetGame()
        navigate('/setup')
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

            {/* Fondo decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #facc15, transparent)' }} />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
            </div>

            <div className="relative z-10 w-full max-w-md">

                {/* Título */}
                <div className="text-center mb-10">
                    {hasPlayed ? (
                        <>
                            <p className="text-zinc-500 tracking-[6px] text-xs uppercase mb-2"
                                style={{ fontFamily: 'system-ui' }}>🏆 Fin de la partida</p>
                            <h1 className="text-7xl font-black text-white leading-none">
                                {isTie ? 'EMPATE' : `GANA\n${winner.name}`}
                            </h1>
                            {!isTie && (
                                <p className="text-yellow-400 text-6xl mt-2">{winner.score} pts</p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-zinc-500 tracking-[6px] text-xs uppercase mb-4"
                                style={{ fontFamily: 'system-ui' }}>Partida cancelada</p>
                            <h1 className="text-7xl font-black text-white">HASTA<br />PRONTO</h1>
                        </>
                    )}
                    <div className="w-24 h-1 bg-yellow-400 mx-auto mt-6" />
                </div>

                {/* Marcador — solo si se jugó */}
                {hasPlayed && (
                    <div className="space-y-3 mb-10">
                        {sorted.map((p, i) => (
                            <div key={i}
                                className={`flex items-center justify-between px-6 py-4 border transition-all
                  ${i === 0 && !isTie
                                        ? 'border-yellow-400 bg-yellow-400/10'
                                        : 'border-zinc-800 bg-zinc-900'
                                    }`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">
                                        {i === 0 && !isTie ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                    </span>
                                    <div>
                                        <p className={`text-xl tracking-widest ${i === 0 && !isTie ? 'text-yellow-400' : 'text-white'}`}>
                                            {p.name}
                                        </p>
                                        <p className="text-zinc-500 text-xs" style={{ fontFamily: 'system-ui' }}>
                                            {p.timeline.length} cartas en línea temporal
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-3xl ${i === 0 && !isTie ? 'text-yellow-400' : 'text-white'}`}>
                                    {p.score}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Botones */}
                <div className="space-y-3">
                    <button
                        onClick={handlePlayAgain}
                        className="w-full py-4 text-xl tracking-widest uppercase font-black"
                        style={{ background: '#facc15', color: '#09090b', letterSpacing: '4px' }}>
                        Jugar de nuevo
                    </button>
                    <button
                        onClick={() => { resetGame(); navigate('/') }}
                        className="w-full py-3 text-sm tracking-widest uppercase border border-zinc-700
              text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all"
                        style={{ fontFamily: 'system-ui' }}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    )
}