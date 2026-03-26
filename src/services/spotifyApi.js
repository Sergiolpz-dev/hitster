import { getValidToken } from '../auth/spotify'

const BASE_URL = 'https://api.spotify.com/v1'

async function authHeaders() {
    const token = await getValidToken()
    return { Authorization: `Bearer ${token}` }
}

const SEARCH_QUERIES = [
    'pop hits', 'rock clasico', 'reggaeton', 'flamenco', 'hip hop',
    'baladas españolas', 'disco 70s', 'punk rock', 'soul', 'latin pop',
    'indie español', 'heavy metal', 'bachata', 'cumbia', 'folk rock',
    'pop 1980', 'rock 1970', 'pop 1990', 'electronica 2000', 'trap 2010',
    'pop 2020', 'rumba', 'dance hits', 'rock alternativo', 'pop internacional'
]

const usedTrackIds = new Set()

export function resetUsedTracks() {
    usedTrackIds.clear()
}

export async function getNextTrack() {
    // Evita crecimiento ilimitado: limpia cuando supera 100 IDs
    if (usedTrackIds.size > 100) usedTrackIds.clear()

    for (let attempt = 0; attempt < 5; attempt++) {
        const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

        const params = new URLSearchParams({
            q: query,
            type: 'track',
            limit: 10,
        })

        const res = await fetch(`${BASE_URL}/search?${params}`, {
            headers: await authHeaders()
        })

        if (!res.ok) {
            if (res.status === 401) {
                // Token expirado — getValidToken lo refrescará en el próximo intento
                continue
            }
            throw new Error(`Spotify API error: ${res.status}`)
        }

        const data = await res.json()

        if (!data.tracks?.items?.length) continue

        const available = data.tracks.items.filter(
            t => t && t.id && !usedTrackIds.has(t.id)
        )

        if (available.length === 0) continue

        const track = available[Math.floor(Math.random() * available.length)]
        usedTrackIds.add(track.id)

        return {
            id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            year: parseInt(track.album.release_date.split('-')[0]),
            albumCover: track.album.images[0]?.url,
            embedUrl: `https://open.spotify.com/embed/track/${track.id}`,
        }
    }

    throw new Error('No se pudo obtener una canción')
}
