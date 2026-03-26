import { create } from 'zustand'

// Normaliza texto para comparación flexible
// "AC/DC", "ac dc", "AC DC" → "acdc"
function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD')                          // descompone acentos
        .replace(/[\u0300-\u036f]/g, '')           // elimina acentos
        .replace(/[^a-z0-9]/g, '')                 // elimina caracteres especiales
        .trim()
}

function isPositionCorrect(timeline, card, position) {
    if (timeline.length === 0) return true
    const before = timeline[position - 1]
    const after = timeline[position]
    const okBefore = !before || before.year <= card.year
    const okAfter = !after || after.year >= card.year
    return okBefore && okAfter
}

export const useGameStore = create((set, get) => ({
    players: [],
    currentPlayerIndex: 0,
    currentCard: null,
    phase: 'setup',
    lastResult: null,

    setupGame: (playerNames) => set({
        players: playerNames.map(name => ({
            name,
            score: 0,
            timeline: [],
        })),
        phase: 'playing',
        currentPlayerIndex: 0,
        currentCard: null,
        lastResult: null,
    }),

    setCurrentCard: (card) => set({ currentCard: card }),

    submitGuess: (guessedArtist, guessedTitle, timelinePosition) => {
        const { currentCard, players, currentPlayerIndex } = get()
        const player = players[currentPlayerIndex]
        let pointsEarned = 0

        const artistCorrect = normalize(guessedArtist) === normalize(currentCard.artist)
        const titleCorrect = normalize(guessedTitle) === normalize(currentCard.title)

        if (artistCorrect) pointsEarned += 1
        if (titleCorrect) pointsEarned += 1

        const sortedTimeline = [...player.timeline].sort((a, b) => a.year - b.year)
        const timelineCorrect = isPositionCorrect(sortedTimeline, currentCard, timelinePosition)
        if (timelineCorrect) pointsEarned += 2

        const updatedPlayers = players.map((p, i) => {
            if (i !== currentPlayerIndex) return p
            return {
                ...p,
                score: p.score + pointsEarned,
                timeline: timelineCorrect
                    ? [...p.timeline, currentCard].sort((a, b) => a.year - b.year)
                    : p.timeline,
            }
        })

        const result = { artistCorrect, titleCorrect, timelineCorrect, pointsEarned }
        set({ players: updatedPlayers, phase: 'result', lastResult: result })
        return result
    },

    nextTurn: () => {
        const { players, currentPlayerIndex } = get()
        const nextPlayer = (currentPlayerIndex + 1) % players.length
        set({
            currentCard: null,
            currentPlayerIndex: nextPlayer,
            phase: 'playing',
            lastResult: null,
        })
    },

    endGame: () => set({ phase: 'finished' }),

    resetGame: () => set({
        players: [],
        currentPlayerIndex: 0,
        currentCard: null,
        phase: 'setup',
        lastResult: null,
    }),
}))