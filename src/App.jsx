import SnakeGame from './components/SnakeGame'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent_55%)]" />

      <div className="relative max-w-3xl mx-auto px-6 py-12">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/flame-icon.svg"
              alt="Flames"
              className="w-16 h-16 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Arcade</h1>
          <p className="text-blue-200 mt-2">A tiny browser game to pass the time</p>
        </header>

        <div className="bg-slate-800/40 border border-blue-500/20 rounded-2xl p-5 shadow-xl">
          <SnakeGame />
        </div>

        <footer className="text-center mt-8 text-blue-300/70 text-sm">
          Built live by your AI. Want a different game? Say "pong" or "tetris" and I’ll swap it.
        </footer>
      </div>
    </div>
  )
}

export default App
