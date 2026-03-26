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
    }, [players.length, navigate])

    useEffect(() => {
        if (phase === 'finished') navigate('/finished')
    }, [phase, navigate])

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
        <div className="min-h-screen bg-zinc-950 text-white animate-page-enter">

            {/* Header */}
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <h1 className="text-3xl tracking-widest font-display">
                    HIT<span className="text-yellow-400">STER</span>
                </h1>

                <div className="flex items-center gap-6">
                    <div className="flex gap-6">
                        {players.map((p, i) => (
                            <div key={i} className={`text-center transition-all ${i === currentPlayerIndex ? 'opacity-100' : 'opacity-40'}`}>
                                <p className="text-xs tracking-widest text-zinc-400 uppercase font-body">{p.name}</p>
                                <p className="text-2xl text-yellow-400 font-display">{p.score}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleEndGame}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-xs
                            tracking-widest uppercase border border-zinc-800 hover:border-red-400 px-3 py-2 font-body">
                        Terminar
                    </button>
                </div>
            </div>

            {/* Turno actual */}
            <div className="px-6 py-3 bg-zinc-900 border-b border-zinc-800">
                <p className="text-sm tracking-widest text-zinc-400 uppercase font-body">
                    Turno de <span className="text-yellow-400 text-base font-display">{currentPlayer?.name}</span>
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
                                                className="w-3 h-3 rounded-full bg-yellow-400 animate-bounce-dot"
                                                style={{ animationDelay: `${i * 0.2}s` }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-zinc-500 text-sm tracking-widest uppercase font-body">
                                        Cargando canción...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <p className="text-zinc-500 text-sm tracking-widest uppercase mb-6 font-body">
                                        Escucha y adivina 🎵
                                    </p>

                                    {/* Reproductor */}
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8
                                        flex flex-col items-center gap-4">
                                        <p className="text-zinc-500 text-xs tracking-widest uppercase font-body">
                                            {isReady ? '¡Listo!' : 'Conectando reproductor...'}
                                        </p>

                                        {/* Botón de play con anillo de pulso */}
                                        <div className="relative flex items-center justify-center">
                                            {isPlaying && (
                                                <span className="absolute inset-0 rounded-full bg-yellow-400 animate-pulse-ring" />
                                            )}
                                            <button
                                                onClick={() => isPlaying ? togglePlay() : playTrack(currentCard.id)}
                                                disabled={!isReady}
                                                className="relative w-24 h-24 rounded-full flex items-center justify-center text-5xl
                                                    bg-yellow-400 transition-all duration-200 hover:scale-110 active:scale-95
                                                    disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-yellow-400/20">
                                                {isPlaying ? '⏸' : '▶'}
                                            </button>
                                        </div>

                                        <p className="text-zinc-600 text-xs font-body">
                                            {isPlaying ? 'Reproduciendo...' : 'Pulsa para escuchar'}
                                        </p>
                                    </div>
                                </div>

                                {/* Respuestas */}
                                <div className="space-y-4">
                                    <p className="text-zinc-500 text-xs tracking-widest uppercase font-body">
                                        Tus respuestas (+1 punto cada una)
                                    </p>
                                    <input
                                        type="text"
                                        value={guessArtist}
                                        onChange={e => setGuessArtist(e.target.value)}
                                        placeholder="Artista..."
                                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400
                                            text-white placeholder-zinc-600 px-4 py-3 outline-none transition-all font-body"
                                    />
                                    <input
                                        type="text"
                                        value={guessTitle}
                                        onChange={e => setGuessTitle(e.target.value)}
                                        placeholder="Título de la canción..."
                                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400
                                            text-white placeholder-zinc-600 px-4 py-3 outline-none transition-all font-body"
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
                                    className={`w-full py-4 text-xl tracking-[4px] uppercase font-black font-display
                                        transition-all disabled:opacity-30 disabled:cursor-not-allowed
                                        ${selectedPosition !== null ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-700 text-zinc-500'}`}>
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
                        <div className="flex gap-6 items-center bg-zinc-900 border border-zinc-800 rounded-lg p-6 animate-fade-up">
                            {currentCard.albumCover && (
                                <img src={currentCard.albumCover} alt="cover"
                                    className="w-24 h-24 object-cover shadow-xl rounded" />
                            )}
                            <div>
                                <p className="text-yellow-400 text-2xl font-display">{currentCard.artist}</p>
                                <p className="text-white text-lg font-body">{currentCard.title}</p>
                                <p className="text-zinc-400 text-sm mt-1 font-body">📅 {currentCard.year}</p>
                            </div>
                        </div>

                        {/* Resultados con stagger */}
                        <div className="space-y-3">
                            <ResultRow label="Artista" correct={lastResult.artistCorrect} points={1} index={0} />
                            <ResultRow label="Título" correct={lastResult.titleCorrect} points={1} index={1} />
                            <ResultRow label="Línea temporal" correct={lastResult.timelineCorrect} points={2} index={2} />
                        </div>

                        {/* Total puntos */}
                        <div className="border-t border-zinc-800 pt-6 flex items-center justify-between animate-fade-up"
                            style={{ animationDelay: '450ms' }}>
                            <p className="text-zinc-400 tracking-widest text-sm uppercase font-body">Puntos ganados</p>
                            <p className="text-5xl text-yellow-400 font-display">+{lastResult.pointsEarned}</p>
                        </div>

                        <button
                            onClick={handleNextTurn}
                            className="w-full py-4 text-xl tracking-[4px] uppercase font-black font-display
                                bg-yellow-400 text-zinc-950 animate-fade-up"
                            style={{ animationDelay: '550ms' }}>
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
            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-4 font-body">
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
                                <p className="text-yellow-400 text-xs font-display">{sorted[i].year}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function ResultRow({ label, correct, points, index = 0 }) {
    return (
        <div
            className="flex items-center justify-between py-3 border-b border-zinc-900 animate-fade-up"
            style={{ animationDelay: `${index * 150}ms` }}>
            <div className="flex items-center gap-3">
                <span className={`text-xl ${correct ? 'text-green-400' : 'text-red-500'}`}>
                    {correct ? '✓' : '✗'}
                </span>
                <span className="text-zinc-300 tracking-widest text-sm uppercase font-body">{label}</span>
            </div>
            <span className={`text-lg font-display ${correct ? 'text-green-400' : 'text-zinc-600'}`}>
                {correct ? `+${points}` : '+0'}
            </span>
        </div>
    )
}
