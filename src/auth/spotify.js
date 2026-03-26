const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI
const SCOPES = 'user-read-private streaming user-read-email user-modify-playback-state'

// Cache en memoria para sessionStorage (js-cache-storage)
const storageCache = new Map()

function getStorage(key) {
    if (!storageCache.has(key)) {
        storageCache.set(key, sessionStorage.getItem(key))
    }
    return storageCache.get(key)
}

function setStorage(key, value) {
    sessionStorage.setItem(key, value)
    storageCache.set(key, value)
}

function removeStorage(key) {
    sessionStorage.removeItem(key)
    storageCache.delete(key)
}

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

function generateState() {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function loginWithSpotify() {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    const state = generateState()
    setStorage('spotify_verifier', verifier)
    setStorage('spotify_oauth_state', state)

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        state,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeToken(code) {
    const verifier = getStorage('spotify_verifier')
    removeStorage('spotify_verifier')
    removeStorage('spotify_oauth_state')

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

    if (!response.ok) throw new Error(`Token exchange failed: ${response.status}`)

    const data = await response.json()
    setStorage('spotify_token', data.access_token)
    setStorage('spotify_refresh_token', data.refresh_token)
    // Guardamos cuando expira (1 hora desde ahora)
    setStorage('spotify_token_expiry', String(Date.now() + 3600 * 1000))
    return data.access_token
}

// Promise en vuelo para evitar race condition en refresco simultáneo
let refreshPromise = null

async function _doRefresh() {
    const refresh = getStorage('spotify_refresh_token')
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

    if (!response.ok) {
        window.location.href = '/'
        return null
    }

    const data = await response.json()
    setStorage('spotify_token', data.access_token)
    setStorage('spotify_token_expiry', String(Date.now() + 3600 * 1000))
    if (data.refresh_token) {
        setStorage('spotify_refresh_token', data.refresh_token)
    }
    return data.access_token
}

async function refreshToken() {
    if (!refreshPromise) {
        refreshPromise = _doRefresh().finally(() => { refreshPromise = null })
    }
    return refreshPromise
}

// Siempre usar esta función en vez de getToken directamente
export async function getValidToken() {
    const expiry = getStorage('spotify_token_expiry')
    const isExpired = !expiry || Date.now() > parseInt(expiry) - 60000 // refresca 1 min antes

    if (isExpired) {
        return await refreshToken()
    }

    return getStorage('spotify_token')
}

// Mantener getToken para compatibilidad con el SDK (síncrono)
export function getToken() {
    return getStorage('spotify_token')
}
