import React from 'react'

// ═══════════════════════════════════════════════════════
// TIC TAC TOE — fully functional with minimax AI
// ═══════════════════════════════════════════════════════
export function TicTacToeGame() {
  const [board, setBoard] = React.useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = React.useState(true)
  const [gameOver, setGameOver] = React.useState(false)
  const [result, setResult] = React.useState(null)

  const checkWinner = (b) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (const [a,bb,c] of lines) {
      if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a]
    }
    return null
  }

  const minimax = (b, isMax) => {
    const winner = checkWinner(b)
    if (winner === 'O') return 10
    if (winner === 'X') return -10
    if (b.every(c => c !== null)) return 0
    if (isMax) {
      let best = -Infinity
      for (let i = 0; i < 9; i++) {
        if (!b[i]) { b[i] = 'O'; best = Math.max(best, minimax(b, false)); b[i] = null }
      }
      return best
    } else {
      let best = Infinity
      for (let i = 0; i < 9; i++) {
        if (!b[i]) { b[i] = 'X'; best = Math.min(best, minimax(b, true)); b[i] = null }
      }
      return best
    }
  }

  const aiMove = React.useCallback((currentBoard) => {
    let bestVal = -Infinity, bestMove = -1
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O'
        const val = minimax(currentBoard, false)
        currentBoard[i] = null
        if (val > bestVal) { bestVal = val; bestMove = i }
      }
    }
    if (bestMove !== -1) {
      const newBoard = [...currentBoard]
      newBoard[bestMove] = 'O'
      setBoard(newBoard)
      const w = checkWinner(newBoard)
      if (w === 'O') { setGameOver(true); setResult('lose') }
      else if (newBoard.every(c => c !== null)) { setGameOver(true); setResult('draw') }
      else { setIsPlayerTurn(true) }
    }
  }, [])

  const handleClick = (i) => {
    if (board[i] || gameOver || !isPlayerTurn) return
    const newBoard = [...board]
    newBoard[i] = 'X'
    setBoard(newBoard)
    const w = checkWinner(newBoard)
    if (w === 'X') { setGameOver(true); setResult('win'); return }
    if (newBoard.every(c => c !== null)) { setGameOver(true); setResult('draw'); return }
    setIsPlayerTurn(false)
    setTimeout(() => aiMove(newBoard), 400)
  }

  const resetGame = () => { setBoard(Array(9).fill(null)); setIsPlayerTurn(true); setGameOver(false); setResult(null) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ fontSize: '14px', fontWeight: '700', color: gameOver ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', minHeight: '20px' }}>
        {gameOver ? (result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😞 Computer Wins!' : "🤝 It's a Draw!") : (isPlayerTurn ? 'Your turn (X)' : 'Computer thinking...')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '240px' }}>
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)} style={{ width: '76px', height: '76px', borderRadius: '14px', border: '2px solid var(--border)', background: cell ? (cell === 'X' ? 'rgba(30,95,209,0.1)' : 'rgba(239,68,68,0.1)') : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', cursor: cell || gameOver ? 'default' : 'pointer', color: cell === 'X' ? 'var(--accent)' : '#ef4444', transition: 'all 0.15s ease' }}>
            {cell}
          </button>
        ))}
      </div>
      {gameOver && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '12px 24px', borderRadius: '12px', background: result === 'win' ? 'rgba(16,185,129,0.1)' : result === 'lose' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${result === 'win' ? '#10b981' : result === 'lose' ? '#ef4444' : '#f59e0b'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{result === 'win' ? '🏆' : result === 'lose' ? '💻' : '🤝'}</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: result === 'win' ? '#10b981' : result === 'lose' ? '#ef4444' : '#f59e0b' }}>{result === 'win' ? 'VICTORY!' : result === 'lose' ? 'DEFEATED' : 'DRAW'}</div>
          </div>
          <button onClick={resetGame} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>Play Again</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CONNECT FOUR — fully functional with AI
// ═══════════════════════════════════════════════════════
export function ConnectFourGame() {
  const ROWS = 6, COLS = 7
  const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  const [board, setBoard] = React.useState(createEmptyBoard())
  const [isPlayerTurn, setIsPlayerTurn] = React.useState(true)
  const [gameOver, setGameOver] = React.useState(false)
  const [result, setResult] = React.useState(null)

  const checkWin = (b, player) => {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS && b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return true
      if (r + 3 < ROWS && b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return true
      if (r + 3 < ROWS && c + 3 < COLS && b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return true
      if (r + 3 < ROWS && c - 3 >= 0 && b[r][c] === player && b[r+1][c-1] === player && b[r+2][c-2] === player && b[r+3][c-3] === player) return true
    }
    return false
  }

  const getAvailableRow = (b, col) => { for (let r = ROWS - 1; r >= 0; r--) { if (!b[r][col]) return r } return -1 }

  const dropPiece = (b, col, player) => {
    const row = getAvailableRow(b, col)
    if (row === -1) return null
    const newBoard = b.map(r => [...r])
    newBoard[row][col] = player
    return newBoard
  }

  const aiMove = React.useCallback((currentBoard) => {
    for (let c = 0; c < COLS; c++) {
      const nb = dropPiece(currentBoard, c, 'Y')
      if (nb && checkWin(nb, 'Y')) {
        setBoard(nb); setGameOver(true); setResult('lose'); return
      }
    }
    for (let c = 0; c < COLS; c++) {
      const nb = dropPiece(currentBoard, c, 'R')
      if (nb && checkWin(nb, 'R')) {
        const aiBoard = dropPiece(currentBoard, c, 'Y')
        if (aiBoard) { setBoard(aiBoard); setIsPlayerTurn(true); return }
      }
    }
    const preferred = [3, 2, 4, 1, 5, 0, 6]
    for (const c of preferred) {
      const nb = dropPiece(currentBoard, c, 'Y')
      if (nb) { setBoard(nb); if (checkWin(nb, 'Y')) { setGameOver(true); setResult('lose') } else if (nb.every(row => row.every(cell => cell !== null))) { setGameOver(true); setResult('draw') } else { setIsPlayerTurn(true) } return }
    }
  }, [])

  const handleClick = (col) => {
    if (gameOver || !isPlayerTurn) return
    const newBoard = dropPiece(board, col, 'R')
    if (!newBoard) return
    setBoard(newBoard)
    if (checkWin(newBoard, 'R')) { setGameOver(true); setResult('win'); return }
    if (newBoard.every(row => row.every(cell => cell !== null))) { setGameOver(true); setResult('draw'); return }
    setIsPlayerTurn(false)
    setTimeout(() => aiMove(newBoard), 500)
  }

  const resetGame = () => { setBoard(createEmptyBoard()); setIsPlayerTurn(true); setGameOver(false); setResult(null) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: '700', color: gameOver ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', minHeight: '20px' }}>
        {gameOver ? (result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😞 Computer Wins!' : '🤝 Draw!') : (isPlayerTurn ? 'Your turn (🔴)' : 'Computer thinking...')}
      </div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {Array(COLS).fill(null).map((_, c) => (
          <button key={c} onClick={() => handleClick(c)} style={{ width: '42px', height: '24px', borderRadius: '8px 8px 0 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottom: 'none', cursor: gameOver ? 'default' : 'pointer', fontSize: '10px', color: 'var(--accent)', fontWeight: '700' }}>▼</button>
        ))}
      </div>
      <div style={{ background: 'var(--accent)', borderRadius: '12px', padding: '8px', display: 'inline-block' }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: '4px', marginBottom: r < ROWS - 1 ? '4px' : 0 }}>
            {row.map((cell, c) => (
              <div key={c} style={{ width: '38px', height: '38px', borderRadius: '50%', background: cell === 'R' ? '#ef4444' : cell === 'Y' ? '#facc15' : '#fff', border: cell ? 'none' : '2px solid rgba(255,255,255,0.3)', transition: 'background 0.2s ease', boxShadow: cell ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none' }}></div>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <div style={{ padding: '12px 24px', borderRadius: '12px', background: result === 'win' ? 'rgba(16,185,129,0.1)' : result === 'lose' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${result === 'win' ? '#10b981' : result === 'lose' ? '#ef4444' : '#f59e0b'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{result === 'win' ? '🏆' : result === 'lose' ? '💻' : '🤝'}</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: result === 'win' ? '#10b981' : result === 'lose' ? '#ef4444' : '#f59e0b' }}>{result === 'win' ? 'VICTORY!' : result === 'lose' ? 'DEFEATED' : 'DRAW'}</div>
          </div>
          <button onClick={resetGame} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>Play Again</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MEMORY MATCH — flip cards and find pairs
// ═══════════════════════════════════════════════════════
export function MemoryMatchGame() {
  const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🥝', '🍑']
  const [cards, setCards] = React.useState([])
  const [flipped, setFlipped] = React.useState([])
  const [matched, setMatched] = React.useState([])
  const [moves, setMoves] = React.useState(0)
  const [gameOver, setGameOver] = React.useState(false)
  const [locked, setLocked] = React.useState(false)

  React.useEffect(() => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }))
    setCards(shuffled)
  }, [])

  const handleFlip = (index) => {
    if (locked || flipped.includes(index) || matched.includes(index)) return
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setLocked(true)
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        const newMatched = [...matched, newFlipped[0], newFlipped[1]]
        setMatched(newMatched)
        setFlipped([])
        setLocked(false)
        if (newMatched.length === cards.length) { setGameOver(true) }
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false) }, 800)
      }
    }
  }

  const resetGame = () => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }))
    setCards(shuffled); setFlipped([]); setMatched([]); setMoves(0); setGameOver(false); setLocked(false)
  }

  const getRating = () => {
    if (moves <= 10) return { text: 'Perfect! 🌟', color: '#10b981' }
    if (moves <= 16) return { text: 'Great! ⭐', color: '#3b82f6' }
    if (moves <= 22) return { text: 'Good! 👍', color: '#f59e0b' }
    return { text: 'Keep Practicing! 💪', color: '#ef4444' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '700', color: 'var(--ink-muted)' }}>
        <span>Moves: {moves}</span>
        <span>Pairs: {matched.length / 2}/{emojis.length}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '280px' }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i)
          return (
            <button key={i} onClick={() => handleFlip(i)} style={{ width: '64px', height: '64px', borderRadius: '12px', border: `2px solid ${matched.includes(i) ? '#10b981' : 'var(--border)'}`, background: isFlipped ? (matched.includes(i) ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)') : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', cursor: isFlipped ? 'default' : 'pointer', transition: 'all 0.3s ease', transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
              {isFlipped ? card.emoji : '?'}
            </button>
          )
        })}
      </div>
      {gameOver && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <div style={{ padding: '16px 28px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '4px' }}>ALL PAIRS FOUND!</div>
            <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Completed in {moves} moves</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: getRating().color, marginTop: '4px' }}>{getRating().text}</div>
          </div>
          <button onClick={resetGame} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>Play Again</button>
        </div>
      )}
    </div>
  )
}
