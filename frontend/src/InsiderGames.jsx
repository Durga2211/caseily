import React from 'react'
import { useMultiplayerGame } from './useMultiplayerGame'

function MultiplayerMenu({ title, multi, children }) {
  if (multi.mode === 'menu') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', padding: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--ink-strong)' }}>{title}</h3>
        <button onClick={() => multi.setMode('local_ai')} style={{ width: '100%', maxWidth: '240px', padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>👤 Play vs Computer</button>
        <button onClick={() => multi.setMode('online')} style={{ width: '100%', maxWidth: '240px', padding: '12px', borderRadius: '12px', background: 'transparent', border: '2px solid var(--accent)', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer' }}>🌐 Play vs Friend</button>
      </div>
    )
  }

  if (multi.mode === 'online' && !multi.connected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', padding: '20px' }}>
        <button onClick={multi.createRoom} style={{ width: '100%', maxWidth: '240px', padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Create Room</button>
        <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '240px' }}>
          <input 
            placeholder="Room Code" 
            value={multi.roomCodeInput} 
            onChange={e => multi.setRoomCodeInput(e.target.value)} 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--ink-strong)', minWidth: '0' }} 
          />
          <button onClick={() => multi.joinRoom(multi.roomCodeInput)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--ink-strong)', color: '#fff', border: 'none', cursor: 'pointer' }}>Join</button>
        </div>
        {multi.error && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{multi.error}</div>}
        <button onClick={multi.leaveRoom} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}>Back</button>
      </div>
    )
  }

  if (multi.mode === 'online' && multi.connected && multi.playersCount < 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: 'var(--ink-strong)' }}>Room Code: <strong style={{ display: 'block', fontSize: '32px', letterSpacing: '4px', color: 'var(--accent)', margin: '8px 0' }}>{multi.roomCode}</strong></div>
        <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Share this code with your friend. Waiting for them to join...</div>
        <button onClick={multi.leaveRoom} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline', marginTop: '12px' }}>Cancel</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      {multi.mode === 'online' && (
         <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
             <span style={{ color: multi.playerNum === 1 ? 'var(--accent)' : 'var(--ink-muted)' }}>{multi.playerNum === 1 ? 'You (P1)' : 'P1'}</span>
             {' vs '}
             <span style={{ color: multi.playerNum === 2 ? '#ef4444' : 'var(--ink-muted)' }}>{multi.playerNum === 2 ? 'You (P2)' : 'P2'}</span>
           </div>
           <button onClick={multi.leaveRoom} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>LEAVE</button>
         </div>
      )}
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// TIC TAC TOE
// ═══════════════════════════════════════════════════════
export function TicTacToeGame() {
  const [board, setBoard] = React.useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = React.useState(true)
  const [gameOver, setGameOver] = React.useState(false)
  const [result, setResult] = React.useState(null)

  const stateRef = React.useRef({ board, isPlayerTurn, gameOver });
  React.useEffect(() => { stateRef.current = { board, isPlayerTurn, gameOver } }, [board, isPlayerTurn, gameOver]);

  const multi = useMultiplayerGame('ttt', (action) => {
    if (action.type === 'move') {
      applyMove(action.index, false);
    } else if (action.type === 'reset') {
      localReset();
    }
  });

  React.useEffect(() => {
    if (multi.mode === 'online' && multi.connected && multi.playersCount === 2 && multi.playerNum === 1) {
      localReset();
      multi.sendAction({ type: 'reset' });
    }
  }, [multi.mode, multi.connected, multi.playersCount]);

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
      applyMove(bestMove, false, currentBoard)
    }
  }, [])

  const applyMove = (i, isMyMove, customBoard = null) => {
    const curState = stateRef.current;
    if (curState.gameOver) return;
    
    const newBoard = [...(customBoard || curState.board)];
    
    let piece;
    if (multi.mode === 'online') {
      piece = isMyMove 
        ? (multi.playerNum === 1 ? 'X' : 'O') 
        : (multi.playerNum === 1 ? 'O' : 'X');
    } else {
      piece = isMyMove ? 'X' : 'O';
    }
    
    newBoard[i] = piece;
    
    stateRef.current.board = newBoard;
    
    setBoard(newBoard);

    const w = checkWinner(newBoard);
    if (w) {
      setGameOver(true);
      if (multi.mode === 'online') {
         setResult(w === (multi.playerNum === 1 ? 'X' : 'O') ? 'win' : 'lose');
      } else {
         setResult(w === 'X' ? 'win' : 'lose');
      }
      return;
    }
    if (newBoard.every(c => c !== null)) {
      setGameOver(true);
      setResult('draw');
      return;
    }

    if (multi.mode === 'online') {
       stateRef.current.isPlayerTurn = !curState.isPlayerTurn;
       setIsPlayerTurn(stateRef.current.isPlayerTurn);
    } else {
       if (isMyMove) {
          setIsPlayerTurn(false);
          setTimeout(() => aiMove(newBoard), 400);
       } else {
          setIsPlayerTurn(true);
       }
    }
  }

  const handleClick = (i) => {
    if (stateRef.current.board[i] || stateRef.current.gameOver) return;
    if (multi.mode === 'online') {
       const isMyTurn = (stateRef.current.isPlayerTurn && multi.playerNum === 1) || (!stateRef.current.isPlayerTurn && multi.playerNum === 2);
       if (!isMyTurn) return;
       multi.sendAction({ type: 'move', index: i });
       applyMove(i, true);
    } else {
       if (!stateRef.current.isPlayerTurn) return;
       applyMove(i, true);
    }
  }

  const localReset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult(null);
  }

  const resetGame = () => {
    localReset();
    if (multi.mode === 'online') {
      multi.sendAction({ type: 'reset' });
    }
  }

  const getStatusText = () => {
    if (gameOver) {
       return result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😞 You Lost!' : "🤝 It's a Draw!";
    }
    if (multi.mode === 'online') {
       const isMyTurn = (isPlayerTurn && multi.playerNum === 1) || (!isPlayerTurn && multi.playerNum === 2);
       return isMyTurn ? 'Your turn!' : "Opponent's turn...";
    } else {
       return isPlayerTurn ? 'Your turn (X)' : 'Computer thinking...';
    }
  }

  return (
    <MultiplayerMenu title="Tic Tac Toe" multi={multi}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: gameOver ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', minHeight: '20px' }}>
          {getStatusText()}
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
            <button onClick={resetGame} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>Play Again</button>
          </div>
        )}
      </div>
    </MultiplayerMenu>
  )
}

// ═══════════════════════════════════════════════════════
// CONNECT FOUR
// ═══════════════════════════════════════════════════════
export function ConnectFourGame() {
  const ROWS = 6, COLS = 7
  const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  const [board, setBoard] = React.useState(createEmptyBoard())
  const [isPlayerTurn, setIsPlayerTurn] = React.useState(true)
  const [gameOver, setGameOver] = React.useState(false)
  const [result, setResult] = React.useState(null)

  const stateRef = React.useRef({ board, isPlayerTurn, gameOver });
  React.useEffect(() => { stateRef.current = { board, isPlayerTurn, gameOver } }, [board, isPlayerTurn, gameOver]);

  const multi = useMultiplayerGame('c4', (action) => {
    if (action.type === 'move') {
      applyMove(action.col, false);
    } else if (action.type === 'reset') {
      localReset();
    }
  });

  React.useEffect(() => {
    if (multi.mode === 'online' && multi.connected && multi.playersCount === 2 && multi.playerNum === 1) {
      localReset();
      multi.sendAction({ type: 'reset' });
    }
  }, [multi.mode, multi.connected, multi.playersCount]);

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
        applyMove(c, false, currentBoard)
        return
      }
    }
    for (let c = 0; c < COLS; c++) {
      const nb = dropPiece(currentBoard, c, 'R')
      if (nb && checkWin(nb, 'R')) {
        applyMove(c, false, currentBoard)
        return
      }
    }
    const preferred = [3, 2, 4, 1, 5, 0, 6]
    for (const c of preferred) {
      const row = getAvailableRow(currentBoard, c)
      if (row !== -1) {
        applyMove(c, false, currentBoard)
        return
      }
    }
  }, [])

  const applyMove = (col, isMyMove, customBoard = null) => {
    const curState = stateRef.current;
    if (curState.gameOver) return;
    
    let piece;
    if (multi.mode === 'online') {
      piece = isMyMove 
        ? (multi.playerNum === 1 ? 'R' : 'Y') 
        : (multi.playerNum === 1 ? 'Y' : 'R');
    } else {
      piece = isMyMove ? 'R' : 'Y';
    }

    const newBoard = dropPiece(customBoard || curState.board, col, piece);
    if (!newBoard) return;
    
    stateRef.current.board = newBoard;
    
    setBoard(newBoard);

    if (checkWin(newBoard, piece)) {
      setGameOver(true);
      if (multi.mode === 'online') {
         setResult(isMyMove ? 'win' : 'lose');
      } else {
         setResult(isMyMove ? 'win' : 'lose');
      }
      return;
    }
    if (newBoard.every(row => row.every(cell => cell !== null))) {
      setGameOver(true);
      setResult('draw');
      return;
    }

    if (multi.mode === 'online') {
       stateRef.current.isPlayerTurn = !curState.isPlayerTurn;
       setIsPlayerTurn(stateRef.current.isPlayerTurn);
    } else {
       if (isMyMove) {
          setIsPlayerTurn(false);
          setTimeout(() => aiMove(newBoard), 500);
       } else {
          setIsPlayerTurn(true);
       }
    }
  }

  const handleClick = (col) => {
    if (stateRef.current.gameOver) return;
    if (multi.mode === 'online') {
       const isMyTurn = (stateRef.current.isPlayerTurn && multi.playerNum === 1) || (!stateRef.current.isPlayerTurn && multi.playerNum === 2);
       if (!isMyTurn) return;
       const row = getAvailableRow(stateRef.current.board, col)
       if (row === -1) return;
       multi.sendAction({ type: 'move', col });
       applyMove(col, true);
    } else {
       if (!stateRef.current.isPlayerTurn) return;
       const row = getAvailableRow(stateRef.current.board, col)
       if (row === -1) return;
       applyMove(col, true);
    }
  }

  const localReset = () => {
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult(null);
  }

  const resetGame = () => {
    localReset();
    if (multi.mode === 'online') {
      multi.sendAction({ type: 'reset' });
    }
  }

  const getStatusText = () => {
    if (gameOver) {
       return result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😞 You Lost!' : "🤝 It's a Draw!";
    }
    if (multi.mode === 'online') {
       const isMyTurn = (isPlayerTurn && multi.playerNum === 1) || (!isPlayerTurn && multi.playerNum === 2);
       return isMyTurn ? 'Your turn!' : "Opponent's turn...";
    } else {
       return isPlayerTurn ? 'Your turn (🔴)' : 'Computer thinking...';
    }
  }

  return (
    <MultiplayerMenu title="Connect Four" multi={multi}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: gameOver ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', minHeight: '20px' }}>
          {getStatusText()}
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
            <button onClick={resetGame} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>Play Again</button>
          </div>
        )}
      </div>
    </MultiplayerMenu>
  )
}

// ═══════════════════════════════════════════════════════
// MEMORY MATCH
// ═══════════════════════════════════════════════════════
export function MemoryMatchGame() {
  const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🥝', '🍑']
  const [cards, setCards] = React.useState([])
  const [flipped, setFlipped] = React.useState([])
  const [matched, setMatched] = React.useState([])
  const [moves, setMoves] = React.useState(0)
  const [gameOver, setGameOver] = React.useState(false)
  const [locked, setLocked] = React.useState(false)
  
  const [isPlayerTurn, setIsPlayerTurn] = React.useState(true) // P1 starts
  const [scores, setScores] = React.useState({ 1: 0, 2: 0 })

  const stateRef = React.useRef({ cards, flipped, matched, locked, isPlayerTurn, scores, gameOver });
  React.useEffect(() => { stateRef.current = { cards, flipped, matched, locked, isPlayerTurn, scores, gameOver } }, [cards, flipped, matched, locked, isPlayerTurn, scores, gameOver]);

  const multi = useMultiplayerGame('memory', (action) => {
    if (action.type === 'sync_cards') {
      setCards(action.cards);
    } else if (action.type === 'flip') {
      applyFlip(action.index, false);
    } else if (action.type === 'reset') {
      if (action.cards) setCards(action.cards);
      localReset(true);
    }
  });

  React.useEffect(() => {
    if (multi.mode !== 'online') {
      const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }))
      setCards(shuffled)
    } else if (multi.connected && multi.playersCount === 2 && multi.playerNum === 1) {
      // Host generates and sends cards
      const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }))
      setCards(shuffled);
      multi.sendAction({ type: 'sync_cards', cards: shuffled });
    }
  }, [multi.mode, multi.connected, multi.playersCount])

  const applyFlip = (index, isMyMove) => {
    const curState = stateRef.current;
    if (curState.locked || curState.flipped.includes(index) || curState.matched.includes(index) || curState.gameOver) return;
    
    const newFlipped = [...curState.flipped, index];
    stateRef.current.flipped = newFlipped;
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      
      if (curState.cards[newFlipped[0]].emoji === curState.cards[newFlipped[1]].emoji) {
        const newMatched = [...curState.matched, newFlipped[0], newFlipped[1]];
        stateRef.current.matched = newMatched;
        setMatched(newMatched);
        stateRef.current.flipped = [];
        setFlipped([]);
        stateRef.current.locked = false;
        setLocked(false);
        
        // Add score to current player
        const activePlayer = curState.isPlayerTurn ? 1 : 2;
        const newScores = { ...curState.scores, [activePlayer]: curState.scores[activePlayer] + 1 };
        setScores(newScores);

        if (newMatched.length === curState.cards.length) { 
           setGameOver(true);
        }
      } else {
        setTimeout(() => { 
           stateRef.current.flipped = [];
           setFlipped([]); 
           stateRef.current.locked = false;
           setLocked(false);
           if (multi.mode === 'online') {
              stateRef.current.isPlayerTurn = !curState.isPlayerTurn;
              setIsPlayerTurn(stateRef.current.isPlayerTurn);
           }
        }, 800);
      }
    }
  }

  const handleFlip = (index) => {
    if (multi.mode === 'online') {
      const isMyTurn = (stateRef.current.isPlayerTurn && multi.playerNum === 1) || (!stateRef.current.isPlayerTurn && multi.playerNum === 2);
      if (!isMyTurn) return;
      multi.sendAction({ type: 'flip', index });
      applyFlip(index, true);
    } else {
      applyFlip(index, true);
    }
  }

  const localReset = (keepCards = false) => {
    if (!keepCards) {
      const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }))
      setCards(shuffled);
    }
    setFlipped([]); setMatched([]); setMoves(0); setGameOver(false); setLocked(false);
    setIsPlayerTurn(true); setScores({ 1: 0, 2: 0 });
  }

  const resetGame = () => {
    if (multi.mode === 'online') {
      if (multi.playerNum === 1) {
        const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }))
        setCards(shuffled);
        localReset(true);
        multi.sendAction({ type: 'reset', cards: shuffled });
      }
    } else {
      localReset();
    }
  }

  const getStatusText = () => {
    if (gameOver) {
       if (multi.mode === 'online') {
         if (scores[1] === scores[2]) return "🤝 It's a Tie!";
         return scores[multi.playerNum] > scores[multi.playerNum === 1 ? 2 : 1] ? '🎉 You Win!' : '😞 You Lost!';
       }
       return '🎉 ALL PAIRS FOUND!';
    }
    if (multi.mode === 'online') {
       const isMyTurn = (isPlayerTurn && multi.playerNum === 1) || (!isPlayerTurn && multi.playerNum === 2);
       return isMyTurn ? 'Your turn!' : "Opponent's turn...";
    } else {
       return 'Find matching pairs!';
    }
  }

  return (
    <MultiplayerMenu title="Memory Match" multi={multi}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: gameOver ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', minHeight: '20px' }}>
          {getStatusText()}
        </div>
        
        {multi.mode === 'online' ? (
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '700' }}>
             <span style={{ color: multi.playerNum === 1 ? 'var(--accent)' : 'inherit' }}>P1 Score: {scores[1]}</span>
             <span style={{ color: multi.playerNum === 2 ? '#ef4444' : 'inherit' }}>P2 Score: {scores[2]}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '700', color: 'var(--ink-muted)' }}>
            <span>Moves: {moves}</span>
            <span>Pairs: {matched.length / 2}/{emojis.length}</span>
          </div>
        )}
        
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
            {multi.mode !== 'online' || multi.playerNum === 1 ? (
              <button onClick={resetGame} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>Play Again</button>
            ) : (
              <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Waiting for P1 to restart...</div>
            )}
          </div>
        )}
      </div>
    </MultiplayerMenu>
  )
}
