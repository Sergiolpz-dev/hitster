# 🎵 Hitster App

Versión web del juego de cartas musical **Hitster**. Adivina el artista, el título y el año de cada canción y colócala en tu línea temporal cronológica.

---

## ¿Cómo se juega?

Cada turno, un jugador escucha una canción y tiene que:

1. **Adivinar el artista** → +1 punto
2. **Adivinar el título** → +1 punto
3. **Colocarla en el lugar correcto de su línea temporal** → +2 puntos

Gana quien antes consiga colocar 10 cartas correctamente en su línea temporal.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Estilos | Tailwind CSS |
| Estado | Zustand |
| Routing | React Router |
| Auth | Spotify OAuth 2.0 PKCE |
| Audio | Spotify Web Playback SDK |
| Datos | Spotify Web API |
| PWA | vite-plugin-pwa |

---

## Requisitos

- Cuenta de **Spotify Premium** para reproducir canciones
- Node.js 18+
- App creada en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

---

## Instalación y desarrollo

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/hitster-app.git
cd hitster-app
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SPOTIFY_CLIENT_ID=tu_client_id_aqui
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
```

> Puedes obtener el `Client ID` desde tu app en el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

### 4. Configura el Redirect URI en Spotify

En tu app del dashboard añade este Redirect URI:

```
http://127.0.0.1:5173/callback
```

### 5. Añade tu cuenta como usuario autorizado

Mientras la app esté en modo desarrollo, solo pueden usarla cuentas añadidas manualmente en:

**Dashboard → tu app → Settings → User Management**

### 6. Arranca el servidor de desarrollo

```bash
npm run dev
```

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173) en tu navegador.

---

## Build de producción

### 1. Crea `.env.production`

```env
VITE_SPOTIFY_CLIENT_ID=tu_client_id_aqui
VITE_REDIRECT_URI=https://tudominio.com/callback
```

### 2. Añade la URL de producción en Spotify Dashboard

```
https://tudominio.com/callback
```

### 3. Genera el build

```bash
npm run build
npm run preview
```

---

## Estructura del proyecto

```
src/
├── auth/
│   └── spotify.js          # Auth PKCE + refresh token automático
├── hooks/
│   └── useSpotifyPlayer.js # Web Playback SDK
├── pages/
│   ├── Login.jsx           # Pantalla de inicio
│   ├── Callback.jsx        # Callback OAuth
│   ├── Setup.jsx           # Configuración de jugadores
│   ├── Game.jsx            # Pantalla principal del juego
│   ├── Finished.jsx        # Resultados finales
│   └── Loading.jsx         # Pantalla de carga
├── services/
│   └── spotifyApi.js       # Llamadas a la Spotify Web API
└── store/
    └── gameStore.js        # Estado global con Zustand
```

---

## Decisiones técnicas destacadas

**Auth PKCE sin backend**
Se usa el flujo PKCE (Proof Key for Code Exchange) de OAuth 2.0, diseñado para apps públicas sin servidor. No se expone ningún Client Secret en el código.

**Refresh token automático**
El token de Spotify dura 1 hora. La app lo refresca automáticamente antes de que expire para que la partida no se interrumpa.

**Canciones infinitas bajo demanda**
En lugar de cargar un deck fijo al inicio, cada turno se solicita una nueva canción aleatoria a la API buscando por géneros y décadas. Esto evita repeticiones y hace el juego prácticamente ilimitado.

**Comparación flexible de respuestas**
Las respuestas se normalizan antes de comparar: se eliminan acentos, mayúsculas y caracteres especiales. Así "AC/DC", "ac dc" y "ACDC" cuentan como correcto.

**Multi-stage build con Docker**
El `Dockerfile` usa dos fases: una para buildear con Node y otra para servir con Nginx. La imagen final pesa ~20MB.

---

## PWA

La app es instalable como Progressive Web App en dispositivos móviles y escritorio. Incluye manifest con iconos y soporte offline básico.

---

## Notas

- La app requiere **Spotify Premium** tanto para el desarrollador como para los jugadores, debido a las restricciones actuales de la Spotify Web API (2025).
- Mientras la app esté en modo desarrollo en el dashboard de Spotify, solo pueden acceder hasta 25 usuarios añadidos manualmente.

---

## Licencia

MIT