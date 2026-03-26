import { useEffect, useState, useRef } from 'react'
import { getValidToken } from '../auth/spotify'

export function useSpotifyPlayer() {
    const [deviceId, setDeviceId] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const hasInit = useRef(false)
    const playerRef = useRef(null)

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
                    getValidToken().then(token => cb(token))
                },
                volume: 0.8,
            })

            spotifyPlayer.addListener('ready', ({ device_id }) => {
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
            playerRef.current = spotifyPlayer
        }

        return () => {
            window.onSpotifyWebPlaybackSDKReady = null
            if (playerRef.current) {
                playerRef.current.disconnect()
                playerRef.current = null
            }
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [])

    const playTrack = async (trackId) => {
        if (!deviceId) return
        const token = await getValidToken()
        const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`],
            }),
        })
        if (!res.ok && res.status !== 204) {
            throw new Error(`Playback error: ${res.status}`)
        }
        setIsPlaying(true)
    }

    const togglePlay = () => {
        if (!playerRef.current) return
        playerRef.current.togglePlay()
    }

    const stopTrack = () => {
        if (!playerRef.current) return
        playerRef.current.pause()
        setIsPlaying(false)
    }

    return { isReady, isPlaying, playTrack, togglePlay, stopTrack }
}
