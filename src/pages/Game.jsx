import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getNextTrack } from '../services/spotifyApi'
import { useNavigate } from 'react-router-dom'
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer'

export default function Game() {
    const navigate = useNavigate()
    const {
        players, currentPlayerIndex, currentCard, phase,
        lastResult, setCurrentCard, submitGuess, nextTurn, endGame
    } = useGameStore()

    const { isReady, isPlaying, playTrack, togglePlay, stopTrack } = useSpotifyPlayer()

    const [loading, setLoading] = useState(false)
    const [guessArtist, setGuessArtist] = useState('')
    const [guessTitle, setGuessTitle] = useState('')
    const [selectedPosition, setSelectedPosition] = useState(null)

    const currentPlayer = players[currentPlayerIndex]

    useEffect(() => {
        if (players.length === 0) navigate('/setup')
    }, [])

    useEffect(() => {
        if (phase === 'finished') navigate('/finished')
    }, [phase])

    useEffect(() => {
        if (phase === 'playing' && !currentCard) {
            setLoading(true)
            getNextTrack()
                .then(track => {
                    setCurrentCard(track)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        }
    }, [phase, currentCard])

    const handleSubmitGuess = () => {
        if (selectedPosition === null) return
        submitGuess(guessArtist, guessTitle, selectedPosition)
        setGuessArtist('')
        setGuessTitle('')
        setSelectedPosition(null)
    }

    const handleNextTurn = () => {
        stopTrack()
        if (currentPlayer.timeline.length >= 10) {
            endGame()
            navigate('/finished')
            return
        }
        nextTurn()
    }

    const handleEndGame = () => {
        stopTrack()
        endGame()
        navigate('/finished')
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

            {/* Header */}
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <h1 className="text-3xl tracking-widest">
                    HIT<span className="text-yellow-400">STER</span>
                </h1>

                <div className="flex items-center gap-6">
                    <div className="flex gap-6">
                        {players.map((p, i) => (
                            <div key={i} className={`text-center transition-all ${i === currentPlayerIndex ? 'opacity-100' : 'opacity-40'}`}>
                                <p className="text-xs tracking-widest text-zinc-400 uppercase"
                                    style={{ fontFamily: 'system-ui' }}>{p.name}</p>
                                <p className="text-2xl text-yellow-400">{p.score}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleEndGame}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-xs
              tracking-widest uppercase border border-zinc-800 hover:border-red-400 px-3 py-2"
                        style={{ fontFamily: 'system-ui' }}>
                        Terminar
                    </button>
                </div>
            </div>

            {/* Turno actual */}
            <div className="px-6 py-3 bg-zinc-900 border-b border-zinc-800">
                <p className="text-sm tracking-widest text-zinc-400 uppercase"
                    style={{ fontFamily: 'system-ui' }}>
                    Turno de <span className="text-yellow-400 text-base">{currentPlayer?.name}</span>
                </p>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">

                {/* FASE: playing */}
                {phase === 'playing' && (
                    <div className="space-y-8">
                        {loading || !currentCard ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        {[0, 1, 2].map(i => (
                                            <div
                                                key={i}
                                                className="w-3 h-3 rounded-full bg-yellow-400"
                                                style={{
                                                    animation: 'bounce 1.2s infinite',
                                                    animationDelay: `${i * 0.2}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-zinc-500 text-sm tracking-widest uppercase"
                                        style={{ fontFamily: 'system-ui' }}>
                                        Cargando canción...
                                    </p>
                                </div>
                                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
                    40% { transform: scale(1); opacity: 1; }
                  }
                `}</style>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <p className="text-zinc-500 text-sm tracking-widest uppercase mb-6"
                                        style={{ fontFamily: 'system-ui' }}>
                                        Escucha y adivina 🎵
                                    </p>

                                    {/* Reproductor personalizado */}
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8
                    flex flex-col items-center gap-4">
                                        <p className="text-zinc-500 text-xs tracking-widest uppercase"
                                            style={{ fontFamily: 'system-ui' }}>
                                            {isReady ? '¡Listo!' : 'Conectando reproductor...'}
                                        </p>

                                        <button
                                            onClick={() => isPlaying ? togglePlay() : playTrack(currentCard.id)}
                                            disabled={!isReady}
                                            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl
                        transition-all duration-200 hover:scale-110 active:scale-95
                        disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-yellow-400/20"
                                            style={{ background: '#facc15' }}>
                                            {isPlaying ? '⏸' : '▶'}
                                        </button>

                                        <p className="text-zinc-600 text-xs" style={{ fontFamily: 'system-ui' }}>
                                            {isPlaying ? 'Reproduciendo...' : 'Pulsa para escuchar'}
                                        </p>
                                    </div>
                                </div>

                                {/* Respuestas */}
                                <div className="space-y-4">
                                    <p className="text-zinc-500 text-xs tracking-widest uppercase"
                                        style={{ fontFamily: 'system-ui' }}>
                                        Tus respuestas (+1 punto cada una)
                                    </p>
                                    <input
                                        type="text"
                                        value={guessArtist}
                                        onChange={e => setGuessArtist(e.target.value)}
                                        placeholder="Artista..."
                                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400
                      text-white placeholder-zinc-600 px-4 py-3 outline-none transition-all"
                                        style={{ fontFamily: 'system-ui' }}
                                    />
                                    <input
                                        type="text"
                                        value={guessTitle}
                                        onChange={e => setGuessTitle(e.target.value)}
                                        placeholder="Título de la canción..."
                                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400
                      text-white placeholder-zinc-600 px-4 py-3 outline-none transition-all"
                                        style={{ fontFamily: 'system-ui' }}
                                    />
                                </div>

                                {/* Línea temporal */}
                                <Timeline
                                    timeline={currentPlayer.timeline}
                                    selectedPosition={selectedPosition}
                                    onSelectPosition={setSelectedPosition}
                                />

                                <button
                                    onClick={handleSubmitGuess}
                                    disabled={selectedPosition === null}
                                    className="w-full py-4 text-xl tracking-widest uppercase font-black transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{
                                        background: selectedPosition !== null ? '#facc15' : '#3f3f46',
                                        color: selectedPosition !== null ? '#09090b' : '#71717a',
                                        letterSpacing: '4px'
                                    }}>
                                    Confirmar
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* FASE: result */}
                {phase === 'result' && lastResult && currentCard && (
                    <div className="space-y-8">

                        {/* Canción revelada */}
                        <div className="flex gap-6 items-center bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            {currentCard.albumCover && (
                                <img src={currentCard.albumCover} alt="cover"
                                    className="w-24 h-24 object-cover shadow-xl rounded" />
                            )}
                            <div>
                                <p className="text-yellow-400 text-2xl">{currentCard.artist}</p>
                                <p className="text-white text-lg" style={{ fontFamily: 'system-ui' }}>
                                    {currentCard.title}
                                </p>
                                <p className="text-zinc-400 text-sm mt-1" style={{ fontFamily: 'system-ui' }}>
                                    📅 {currentCard.year}
                                </p>
                            </div>
                        </div>

                        {/* Resultados */}
                        <div className="space-y-3">
                            <ResultRow label="Artista" correct={lastResult.artistCorrect} points={1} />
                            <ResultRow label="Título" correct={lastResult.titleCorrect} points={1} />
                            <ResultRow label="Línea temporal" correct={lastResult.timelineCorrect} points={2} />
                        </div>

                        {/* Total puntos */}
                        <div className="border-t border-zinc-800 pt-6 flex items-center justify-between">
                            <p className="text-zinc-400 tracking-widest text-sm uppercase"
                                style={{ fontFamily: 'system-ui' }}>Puntos ganados</p>
                            <p className="text-5xl text-yellow-400">+{lastResult.pointsEarned}</p>
                        </div>

                        <button
                            onClick={handleNextTurn}
                            className="w-full py-4 text-xl tracking-widest uppercase font-black"
                            style={{ background: '#facc15', color: '#09090b', letterSpacing: '4px' }}>
                            Siguiente turno →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function Timeline({ timeline, selectedPosition, onSelectPosition }) {
    const sorted = [...timeline].sort((a, b) => a.year - b.year)
    const slots = sorted.length + 1

    return (
        <div>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-4"
                style={{ fontFamily: 'system-ui' }}>
                ¿Dónde va en tu línea temporal? (+2 puntos)
            </p>
            <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: slots }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <button
                            onClick={() => onSelectPosition(i)}
                            className={`w-8 h-12 border-2 transition-all flex items-center justify-center text-xs
                ${selectedPosition === i
                                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                                    : 'border-zinc-700 hover:border-zinc-500 text-zinc-600'
                                }`}>
                            {selectedPosition === i ? '▼' : '+'}
                        </button>
                        {sorted[i] && (
                            <div className="bg-zinc-800 border border-zinc-700 px-2 py-1 text-center min-w-16">
                                {sorted[i].albumCover && (
                                    <img src={sorted[i].albumCover} alt=""
                                        className="w-8 h-8 object-cover mx-auto mb-1" />
                                )}
                                <p className="text-yellow-400 text-xs">{sorted[i].year}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function ResultRow({ label, correct, points }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-zinc-900">
            <div className="flex items-center gap-3">
                <span className={`text-xl ${correct ? 'text-green-400' : 'text-red-500'}`}>
                    {correct ? '✓' : '✗'}
                </span>
                <span className="text-zinc-300 tracking-widest text-sm uppercase"
                    style={{ fontFamily: 'system-ui' }}>{label}</span>
            </div>
            <span className={`text-lg ${correct ? 'text-green-400' : 'text-zinc-600'}`}>
                {correct ? `+${points}` : '+0'}
            </span>
        </div>
    )
}