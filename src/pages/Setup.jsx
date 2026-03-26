import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useNavigate } from 'react-router-dom'

export default function Setup() {
    const [playerNames, setPlayerNames] = useState(['', ''])
    const setupGame = useGameStore(s => s.setupGame)
    const navigate = useNavigate()

    const addPlayer = () => {
        if (playerNames.length < 6) setPlayerNames([...playerNames, ''])
    }

    const removePlayer = (i) => {
        if (playerNames.length <= 2) return
        setPlayerNames(playerNames.filter((_, idx) => idx !== i))
    }

    const updateName = (i, value) => {
        const updated = [...playerNames]
        updated[i] = value
        setPlayerNames(updated)
    }

    const hasDuplicates = playerNames.some(
        (name, i) => name.trim().length > 0 && playerNames.findIndex(
            (n, j) => j !== i && n.trim().toLowerCase() === name.trim().toLowerCase()
        ) !== -1
    )

    const canStart = playerNames.every(n => n.trim().length > 0) && !hasDuplicates

    const handleStart = () => {
        if (!canStart) return
        setupGame(playerNames.map(n => n.trim()))
        navigate('/game')
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}>

            {/* Fondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #facc15, transparent)' }} />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
            </div>

            <div className="relative z-10 w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-zinc-500 tracking-widest text-sm mb-2">🎵 EL JUEGO MUSICAL</p>
                    <h1 className="text-8xl font-black text-white leading-none tracking-tight"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '-2px' }}>
                        HIT
                        <span className="text-yellow-400">STER</span>
                    </h1>
                    <div className="w-24 h-1 bg-yellow-400 mx-auto mt-4" />
                </div>

                {/* Jugadores */}
                <div className="space-y-3 mb-8">
                    <p className="text-zinc-400 tracking-widest text-xs uppercase mb-4">
                        ¿Quién juega?
                    </p>
                    {playerNames.map((name, i) => {
                        const isDuplicate = name.trim().length > 0 && playerNames.some(
                            (n, j) => j !== i && n.trim().toLowerCase() === name.trim().toLowerCase()
                        )
                        return (
                            <div key={i} className="flex items-center gap-3 group">
                                <span className="text-yellow-400 text-xl w-6 text-center">{i + 1}</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => updateName(i, e.target.value)}
                                    placeholder={`Equipo ${i + 1}`}
                                    maxLength={20}
                                    className={`flex-1 bg-zinc-900 border px-4 py-3 outline-none
                                        transition-all text-lg tracking-wide text-white
                                        placeholder-zinc-600 rounded-none
                                        ${isDuplicate
                                            ? 'border-red-500 focus:border-red-400'
                                            : 'border-zinc-800 focus:border-yellow-400'
                                        }`}
                                    style={{ fontFamily: 'system-ui' }}
                                />
                                {playerNames.length > 2 && (
                                    <button onClick={() => removePlayer(i)}
                                        className="text-zinc-600 hover:text-red-400 transition-colors text-xl w-6">
                                        ×
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Aviso duplicados */}
                {hasDuplicates && (
                    <p className="text-red-400 text-xs tracking-widest text-center mb-6"
                        style={{ fontFamily: 'system-ui' }}>
                        ⚠️ Dos equipos no pueden tener el mismo nombre
                    </p>
                )}

                {/* Añadir equipo */}
                {playerNames.length < 6 && (
                    <button onClick={addPlayer}
                        className="w-full border border-dashed border-zinc-700 hover:border-yellow-400
                            text-zinc-500 hover:text-yellow-400 py-3 transition-all text-sm tracking-widest
                            uppercase mb-8">
                        + Añadir Equipo
                    </button>
                )}

                {/* Botón empezar */}
                <button
                    onClick={handleStart}
                    disabled={!canStart}
                    className="w-full py-5 text-2xl tracking-widest uppercase font-black transition-all
                        disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                        background: canStart ? '#facc15' : '#3f3f46',
                        color: canStart ? '#09090b' : '#71717a',
                        fontFamily: "'Bebas Neue', sans-serif",
                        letterSpacing: '4px'
                    }}>
                    Empezar
                </button>
            </div>

            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        </div>
    )
}