const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI
const SCOPES = 'user-read-private streaming user-read-email user-modify-playback-state'

function generateCodeVerifier() {
    const array = new Uint8Array(64)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function loginWithSpotify() {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    localStorage.setItem('spotify_verifier', verifier)

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        code_challenge_method: 'S256',
        code_challenge: challenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeToken(code) {
    const verifier = localStorage.getItem('spotify_verifier')

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
        }),
    })

    const data = await response.json()
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
    // Guardamos cuando expira (1 hora desde ahora)
    localStorage.setItem('spotify_token_expiry', Date.now() + 3600 * 1000)
    return data.access_token
}

async function refreshToken() {
    const refresh = localStorage.getItem('spotify_refresh_token')
    if (!refresh) {
        window.location.href = '/'
        return null
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'refresh_token',
            refresh_token: refresh,
        }),
    })

    const data = await response.json()
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_token_expiry', Date.now() + 3600 * 1000)
    if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
    }
    return data.access_token
}

// Siempre usar esta función en vez de getToken directamente
export async function getValidToken() {
    const expiry = localStorage.getItem('spotify_token_expiry')
    const isExpired = !expiry || Date.now() > parseInt(expiry) - 60000 // refresca 1 min antes

    if (isExpired) {
        return await refreshToken()
    }

    return localStorage.getItem('spotify_token')
}

// Mantener getToken para compatibilidad con el SDK (síncrono)
export function getToken() {
    return localStorage.getItem('spotify_token')
}