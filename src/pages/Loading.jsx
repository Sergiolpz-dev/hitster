export default function Loading({ message = 'Cargando...' }) {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

            <div className="text-center">
                {/* Logo */}
                <h1 className="text-6xl font-black text-white mb-8"
                    style={{ letterSpacing: '-2px' }}>
                    HIT<span className="text-yellow-400">STER</span>
                </h1>

                {/* Animación de puntos */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-yellow-400"
                            style={{
                                animation: 'bounce 1.2s infinite',
                                animationDelay: `${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>

                <p className="text-zinc-500 text-sm tracking-widest uppercase"
                    style={{ fontFamily: 'system-ui' }}>
                    {message}
                </p>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    )
}