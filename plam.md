Ready for review
Select text to add comments on the plan
Security Review: Hitster App
Context
Hitster is a pure frontend React PWA that uses Spotify's OAuth 2.0 PKCE flow to authenticate users and play music via the Spotify Web Playback SDK. There is no backend — all logic runs in the browser and communicates directly with Spotify's official APIs.

This review covers the entire codebase with focus on authentication, token handling, external script loading, and user input.

Findings
[VULN-001] Missing OAuth State Parameter — CSRF on OAuth Flow (Medium)
Location: src/auth/spotify.js:25-32, src/pages/Callback.jsx:14-19
Confidence: High
Issue: loginWithSpotify() does not include a state parameter in the authorization URL, and Callback.jsx does not verify any state on return. OAuth 2.0 spec (RFC 6749) requires state to prevent CSRF during the authorization flow.
Impact: An attacker can initiate a login flow using their own Spotify account, capture the resulting ?code=... URL, and trick a victim into visiting that callback URL. The victim's session would then be linked to the attacker's Spotify account (account linkage attack).
Evidence:
// src/auth/spotify.js:25-32 — no `state` param included
const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
})

// src/pages/Callback.jsx:14-19 — no `state` verification
const params = new URLSearchParams(window.location.search)
const code = params.get('code')
if (code) {
    exchangeToken(code).then(() => navigate('/setup'))
}
Fix:
Generate a random state value (e.g., crypto.getRandomValues) in loginWithSpotify(), store in sessionStorage, and include as a URL param.
In Callback.jsx, read state from URL and compare to stored value before calling exchangeToken(). Reject if they don't match.
[VULN-002] Spotify Tokens Stored in localStorage (High)
Location: src/auth/spotify.js:53-56, src/auth/spotify.js:78-81
Confidence: High
Issue: access_token, refresh_token, and spotify_verifier are stored in localStorage. Any JavaScript running on the page — including browser extensions, third-party SDKs (like the Spotify player), or an injected XSS payload — can read localStorage synchronously.
Impact: If any XSS vector is exploited (including a compromised CDN script — see VULN-003), the refresh token can be exfiltrated, giving an attacker indefinite access to the user's Spotify account until the user manually revokes it.
Evidence:
localStorage.setItem('spotify_token', data.access_token)        // line 53
localStorage.setItem('spotify_refresh_token', data.refresh_token) // line 54
localStorage.setItem('spotify_token_expiry', Date.now() + 3600 * 1000) // line 56
Fix:
Best option: Move tokens to sessionStorage — limits persistence to the current tab, reducing the window for theft. Refresh tokens should never be in browser storage; require re-auth on new sessions.
Alternative: For a pure SPA without a backend, consider keeping only the access token in memory (React state / Zustand store) and not persisting the refresh token at all. The PKCE flow already handles re-authorization gracefully.
[VULN-003] External Spotify SDK Loaded Without Subresource Integrity (SRI) (High)
Location: src/hooks/useSpotifyPlayer.js:15-18
Confidence: High
Issue: The Spotify Web Playback SDK is loaded dynamically without an integrity attribute. If Spotify's CDN (sdk.scdn.co) is compromised or a network-level attacker performs a MitM, malicious JavaScript would run in the page's origin and have full access to localStorage, including all stored tokens.
Evidence:
const script = document.createElement('script')
script.src = 'https://sdk.scdn.co/spotify-player.js'  // no integrity check
script.async = true
document.body.appendChild(script)
Note: SRI is not trivially applicable to dynamically changing CDN resources. The real mitigation here is a strict Content-Security-Policy (see VULN-004) combined with moving tokens out of localStorage.
Fix: Add a Content-Security-Policy that restricts script-src to known sources, and store tokens in memory instead of localStorage to reduce the impact of a compromised third-party script.
[VULN-004] No Content-Security-Policy Header (Medium)
Location: index.html (confirmed — no CSP meta tag present)
Confidence: High
Issue: There is no Content-Security-Policy defined anywhere. Without CSP, any injected script (via XSS or CDN compromise) can freely exfiltrate data, make network requests, and access all storage.
Impact: Amplifies the severity of VULN-002 and VULN-003. Without CSP, there are no browser-level restrictions on what a malicious script can do.
Fix: Add a CSP meta tag to index.html (or configure it as an HTTP response header if deployed with a server):
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://sdk.scdn.co;
  connect-src 'self' https://api.spotify.com https://accounts.spotify.com;
  img-src 'self' https://i.scdn.co data:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
">
Needs Verification
[VERIFY-001] console.log with device_id in production builds
Location: src/hooks/useSpotifyPlayer.js:30
Question: console.log('Player listo, device_id:', device_id) will appear in browser DevTools in production. Not a major vulnerability, but it exposes device IDs to anyone with DevTools open. Should be removed or gated behind a dev flag.
Positive Security Findings
PKCE implemented correctly: cryptographically secure code verifier (crypto.getRandomValues), SHA-256 challenge, proper code_verifier included in token exchange.
No dangerouslySetInnerHTML, eval(), exec(), or other dangerous DOM sinks found.
All fetch calls target hardcoded Spotify domains — no user input used to construct URLs.
React JSX auto-escaping protects all rendered user input (player names, guess text).
Input normalization in gameStore.js is clean and uses Unicode normalization correctly.
.env files are in .gitignore.
Critical Files
File	Issue
src/auth/spotify.js	VULN-001 (state param), VULN-002 (localStorage tokens)
src/pages/Callback.jsx	VULN-001 (no state verification)
src/hooks/useSpotifyPlayer.js	VULN-003 (no SRI), VERIFY-001 (console.log)
index.html	VULN-004 (no CSP)
Priority Order for Fixes
VULN-001 — Add OAuth state parameter (low effort, high impact, 30-min fix)
VULN-002 — Move tokens to sessionStorage or memory (medium effort, high impact)
VULN-004 — Add CSP header (low effort, reduces blast radius of all other issues)
VULN-003 — Addressed by fixing VULN-002 + VULN-004 together
VERIFY-001 — Remove console.log in production (trivial)