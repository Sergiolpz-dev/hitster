import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeToken } from '../auth/spotify'
import Loading from './Loading'

export default function Callback() {
    const navigate = useNavigate()
    const hasRun = useRef(false)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
            exchangeToken(code).then(() => navigate('/setup'))
        }
    }, [])

    return <Loading message="Conectando con Spotify..." />
}