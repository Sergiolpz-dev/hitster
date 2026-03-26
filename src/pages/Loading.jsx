export default function Loading({ message = 'Cargando...' }) {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center animate-page-enter">
            <div className="text-center">
                {/* Logo */}
                <h1 className="text-6xl font-black text-white mb-8 font-display tracking-[-2px]">
                    HIT<span className="text-yellow-400">STER</span>
                </h1>

                {/* Animación de puntos */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-yellow-400 animate-bounce-dot"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>

                <p className="text-zinc-500 text-sm tracking-widest uppercase font-body">
                    {message}
                </p>
            </div>
        </div>
    )
}
