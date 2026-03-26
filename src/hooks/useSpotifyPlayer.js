import { useEffect, useState, useRef } from 'react'
import { getToken, getValidToken } from '../auth/spotify'

export function useSpotifyPlayer() {
    const [player, setPlayer] = useState(null)
    const [deviceId, setDeviceId] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const hasInit = useRef(false)

    useEffect(() => {
        if (hasInit.current) return
        hasInit.current = true

        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Hitster App',
                getOAuthToken: cb => {
                    getValidToken().then(token => cb(token)) // ← refresco automático
                },
                volume: 0.8,
            })

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Player listo, device_id:', device_id)
                setDeviceId(device_id)
                setIsReady(true)
            })

            spotifyPlayer.addListener('not_ready', () => {
                setIsReady(false)
            })

            spotifyPlayer.addListener('player_state_changed', state => {
                if (!state) return
                setIsPlaying(!state.paused)
            })

            spotifyPlayer.connect()
            setPlayer(spotifyPlayer)
        }

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [])

    const playTrack = async (trackId) => {
        if (!deviceId) return
        const token = await getValidToken() // ← refresco automático
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`],
            }),
        })
        setIsPlaying(true)
    }

    const togglePlay = () => {
        if (!player) return
        player.togglePlay()
    }

    const stopTrack = () => {
        if (!player) return
        player.pause()
        setIsPlaying(false)
    }

    return { isReady, isPlaying, playTrack, togglePlay, stopTrack }
}