import { useGameStore } from '../store/gameStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Finished() {
    const { players, resetGame } = useGameStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (players.length === 0) navigate('/')
    }, [players.length, navigate])

    const hasPlayed = players.some(p => p.score > 0 || p.timeline.length > 0)
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const winner = sorted[0]
    const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score

    const handlePlayAgain = () => {
        resetGame()
        navigate('/setup')
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden animate-page-enter">

            {/* Fondo decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-125 h-125 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #facc15, transparent)' }} />
                <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
            </div>

            <div className="relative z-10 w-full max-w-md">

                {/* Título */}
                <div className="text-center mb-10">
                    {hasPlayed ? (
                        <>
                            <p className="text-zinc-500 tracking-[6px] text-xs uppercase mb-2 font-body">
                                🏆 Fin de la partida
                            </p>
                            <h1 className="text-7xl font-black text-white leading-none font-display">
                                {isTie ? 'EMPATE' : `GANA\n${winner.name}`}
                            </h1>
                            {!isTie && (
                                <p className="text-yellow-400 text-6xl mt-2 font-display">{winner.score} pts</p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-zinc-500 tracking-[6px] text-xs uppercase mb-4 font-body">
                                Partida cancelada
                            </p>
                            <h1 className="text-7xl font-black text-white font-display">HASTA<br />PRONTO</h1>
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
                                    animate-fade-up
                                    ${i === 0 && !isTie
                                        ? 'border-yellow-400 bg-yellow-400/10'
                                        : 'border-zinc-800 bg-zinc-900'
                                    }`}
                                style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">
                                        {i === 0 && !isTie ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                    </span>
                                    <div>
                                        <p className={`text-xl tracking-widest font-display
                                            ${i === 0 && !isTie ? 'text-yellow-400' : 'text-white'}`}>
                                            {p.name}
                                        </p>
                                        <p className="text-zinc-500 text-xs font-body">
                                            {p.timeline.length} cartas en línea temporal
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-3xl font-display
                                    ${i === 0 && !isTie ? 'text-yellow-400' : 'text-white'}`}>
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
                        className="w-full py-4 text-xl tracking-[4px] uppercase font-black font-display
                            bg-yellow-400 text-zinc-950">
                        Jugar de nuevo
                    </button>
                    <button
                        onClick={() => { resetGame(); navigate('/') }}
                        className="w-full py-3 text-sm tracking-widest uppercase border border-zinc-700
                            text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all font-body">
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    )
}
