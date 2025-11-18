import { useEffect, useRef, useState } from 'react'

// Simple Snake game rendered on Canvas
// - Arrow/WASD to move
// - P to pause/resume
// - R to restart after game over
// - Stores best score in localStorage

const CELL_SIZE = 22
const COLS = 22
const ROWS = 22
const SPEED_START_MS = 140
const SPEED_MIN_MS = 70
const SPEED_STEP = 4

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
}

function randCell(exclude = []) {
  while (true) {
    const x = Math.floor(Math.random() * COLS)
    const y = Math.floor(Math.random() * ROWS)
    if (!exclude.some((c) => c.x === x && c.y === y)) return { x, y }
  }
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [snake, setSnake] = useState([{ x: 10, y: 11 }, { x: 9, y: 11 }])
  const [dir, setDir] = useState({ x: 1, y: 0 })
  const [nextDir, setNextDir] = useState({ x: 1, y: 0 })
  const [apple, setApple] = useState(randCell([{ x: 10, y: 11 }, { x: 9, y: 11 }]))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('snake-best') || 0))
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [speed, setSpeed] = useState(SPEED_START_MS)

  // Handle keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        setPaused((p) => !p)
        return
      }
      if ((e.key === 'r' || e.key === 'R') && gameOver) {
        restart()
        return
      }
      const nd = DIRS[e.key]
      if (!nd) return
      // Prevent reversing directly
      if (nd.x === -dir.x && nd.y === -dir.y) return
      setNextDir(nd)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dir, gameOver])

  // Game loop
  useEffect(() => {
    if (paused || gameOver) return
    const timer = setInterval(step, speed)
    return () => clearInterval(timer)
  }, [snake, nextDir, paused, gameOver, speed])

  function step() {
    setDir(nextDir)
    setSnake((prev) => {
      const head = prev[0]
      const newHead = { x: head.x + nextDir.x, y: head.y + nextDir.y }

      // Wall collision
      if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        endGame()
        return prev
      }
      // Self collision
      if (prev.some((c) => c.x === newHead.x && c.y === newHead.y)) {
        endGame()
        return prev
      }

      const ate = newHead.x === apple.x && newHead.y === apple.y
      const grown = [newHead, ...prev]
      if (!ate) grown.pop()

      if (ate) {
        setScore((s) => s + 1)
        setApple(randCell(grown))
        setSpeed((ms) => Math.max(SPEED_MIN_MS, ms - SPEED_STEP))
      }

      return grown
    })
  }

  function endGame() {
    setGameOver(true)
    setPaused(false)
    setBest((b) => {
      const newBest = Math.max(b, score)
      localStorage.setItem('snake-best', String(newBest))
      return newBest
    })
  }

  function restart() {
    const initSnake = [{ x: 10, y: 11 }, { x: 9, y: 11 }]
    setSnake(initSnake)
    setDir({ x: 1, y: 0 })
    setNextDir({ x: 1, y: 0 })
    setApple(randCell(initSnake))
    setScore(0)
    setSpeed(SPEED_START_MS)
    setPaused(false)
    setGameOver(false)
  }

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const width = COLS * CELL_SIZE
    const height = ROWS * CELL_SIZE

    // Background grid
    ctx.clearRect(0, 0, width, height)
    const g1 = '#0f172a'
    const g2 = '#0b1224'
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? g1 : g2
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    // Apple
    const appleGrad = ctx.createRadialGradient(
      apple.x * CELL_SIZE + CELL_SIZE / 2,
      apple.y * CELL_SIZE + CELL_SIZE / 2,
      2,
      apple.x * CELL_SIZE + CELL_SIZE / 2,
      apple.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 1.2
    )
    appleGrad.addColorStop(0, '#ef4444')
    appleGrad.addColorStop(1, '#7f1d1d')
    ctx.fillStyle = appleGrad
    ctx.beginPath()
    ctx.roundRect(
      apple.x * CELL_SIZE + 3,
      apple.y * CELL_SIZE + 3,
      CELL_SIZE - 6,
      CELL_SIZE - 6,
      4
    )
    ctx.fill()

    // Snake
    prevShadow(ctx)
    snake.forEach((seg, i) => {
      const isHead = i === 0
      const color = isHead ? '#60a5fa' : '#38bdf8'
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(
        seg.x * CELL_SIZE + 2,
        seg.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        6
      )
      ctx.fill()
      if (isHead) {
        // Eyes
        ctx.fillStyle = '#0ea5e9'
        const cx = seg.x * CELL_SIZE + CELL_SIZE / 2
        const cy = seg.y * CELL_SIZE + CELL_SIZE / 2
        ctx.beginPath()
        ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2)
        ctx.arc(cx + 4, cy - 2, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    function prevShadow(c) {
      c.shadowColor = 'rgba(59,130,246,0.35)'
      c.shadowBlur = 12
      c.shadowOffsetX = 0
      c.shadowOffsetY = 0
    }
  }, [snake, apple])

  const canvasWidth = COLS * CELL_SIZE
  const canvasHeight = ROWS * CELL_SIZE

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-blue-200/90">
          <div className="text-xs uppercase tracking-widest">Score</div>
          <div className="text-2xl font-bold text-white">{score}</div>
        </div>
        <div className="text-blue-200/90 text-center">
          <div className="text-xs uppercase tracking-widest">Best</div>
          <div className="text-xl font-semibold text-white">{best}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border border-blue-500/30 transition ${
              paused ? 'bg-blue-600 text-white' : 'bg-slate-800/60 text-blue-100 hover:bg-slate-800'
            }`}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={restart}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-blue-500/30 bg-slate-800/60 text-blue-100 hover:bg-slate-800 transition"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="relative mx-auto rounded-xl overflow-hidden ring-1 ring-blue-500/20 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block"
          style={{ imageRendering: 'pixelated' }}
        />

        {(paused || gameOver) && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
            <div className="text-white text-2xl font-semibold mb-2">
              {gameOver ? 'Game Over' : 'Paused'}
            </div>
            <div className="text-blue-200 text-sm mb-4">
              {gameOver ? 'Press R to restart' : 'Press P to resume'}
            </div>
            {gameOver && (
              <button
                onClick={restart}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Restart
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-blue-300/70 text-xs space-y-1">
        <p>Controls: Arrow keys / WASD to move • P to pause • R to restart</p>
        <p>Tip: The snake speeds up slightly with each apple you eat.</p>
      </div>
    </div>
  )
}
