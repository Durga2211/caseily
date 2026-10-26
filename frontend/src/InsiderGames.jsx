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

// ═══════════════════════════════════════════════════════
// WATER COLOR SORT
// ═══════════════════════════════════════════════════════
const CAPACITY = 4;
const STORAGE_KEY = 'caseily_watersort_level';

function isSolvedWaterState(ts) {
  return ts.every(t => t.length === 0 || (t.length === CAPACITY && t.every(c => c === t[0])));
}

function solveWaterBFS(state, maxVisits = 4500) {
  const serialize = (ts) => ts.map(t => t.join(',')).sort().join('|');
  const queue = [state];
  const visited = new Set([serialize(state)]);
  let count = 0;

  while (queue.length > 0) {
    const cur = queue.shift();
    if (isSolvedWaterState(cur)) return true;
    if (++count > maxVisits) return false;

    for (let i = 0; i < cur.length; i++) {
      if (cur[i].length === 0) continue;
      const src = cur[i];
      const color = src[src.length - 1];
      let colorCount = 0;
      for (let k = src.length - 1; k >= 0 && src[k] === color; k--) colorCount++;

      for (let j = 0; j < cur.length; j++) {
        if (i === j) continue;
        const dst = cur[j];
        if (dst.length === CAPACITY) continue;
        if (dst.length > 0 && dst[dst.length - 1] !== color) continue;
        if (dst.length === 0 && src.length === colorCount && src.length === CAPACITY) continue;

        const moveCount = Math.min(colorCount, CAPACITY - dst.length);
        const nextState = cur.map((t, idx) => {
          if (idx === i) return t.slice(0, t.length - moveCount);
          if (idx === j) return [...t, ...Array(moveCount).fill(color)];
          return t;
        });

        const key = serialize(nextState);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(nextState);
        }
      }
    }
  }
  return false;
}

function generateWaterPalette(numColors, lvl) {
  const palette = [];
  const offset = (lvl * 53) % 360;
  for (let i = 0; i < numColors; i++) {
    const hue = Math.round((offset + i * (360 / numColors)) % 360);
    palette.push({
      id: i,
      hue: hue,
      gradient: `linear-gradient(180deg, hsl(${hue}, 88%, 56%) 0%, hsl(${hue}, 82%, 42%) 100%)`,
      solid: `hsl(${hue}, 85%, 48%)`,
      glow: `hsla(${hue}, 90%, 55%, 0.45)`
    });
  }
  return palette;
}

function generateWaterLevel(lvl) {
  const numColors = Math.min(3 + Math.floor((lvl - 1) / 2), 8);
  const palette = generateWaterPalette(numColors, lvl);

  let candidate = null;
  let attempts = 0;

  while (attempts++ < 30) {
    const pool = [];
    for (let c = 0; c < numColors; c++) {
      for (let k = 0; k < CAPACITY; k++) pool.push(c);
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const candidateTubes = [];
    for (let c = 0; c < numColors; c++) {
      candidateTubes.push(pool.slice(c * CAPACITY, (c + 1) * CAPACITY));
    }
    candidateTubes.push([], []);

    if (isSolvedWaterState(candidateTubes)) continue;
    const hasPreSolved = candidateTubes.some(t => t.length === CAPACITY && t.every(c => c === t[0]));
    if (hasPreSolved && numColors > 3) continue;

    if (solveWaterBFS(candidateTubes)) {
      candidate = candidateTubes;
      break;
    }
  }

  if (!candidate) {
    let fallback = Array.from({ length: numColors }, (_, i) => [i, i, i, i]);
    fallback.push([], []);
    for (let step = 0; step < 50; step++) {
      const nonEmpties = fallback.map((t, idx) => ({ t, idx })).filter(o => o.t.length > 0);
      const { t: b, idx: bIdx } = nonEmpties[Math.floor(Math.random() * nonEmpties.length)];
      const color = b[b.length - 1];
      let streak = 0;
      for (let k = b.length - 1; k >= 0 && b[k] === color; k--) streak++;
      const validDest = fallback.map((t, idx) => ({ t, idx })).filter(o => o.idx !== bIdx && o.t.length < CAPACITY);
      if (validDest.length === 0) continue;
      const { idx: aIdx } = validDest[Math.floor(Math.random() * validDest.length)];
      const maxK = Math.min(streak, CAPACITY - fallback[aIdx].length);
      let allowed = [];
      if (b.length <= maxK) allowed.push(b.length);
      for (let k = 1; k < streak && k <= maxK; k++) allowed.push(k);
      if (allowed.length === 0) continue;
      const k = allowed[Math.floor(Math.random() * allowed.length)];
      fallback = fallback.map((t, idx) => {
        if (idx === bIdx) return t.slice(0, t.length - k);
        if (idx === aIdx) return [...t, ...Array(k).fill(color)];
        return t;
      });
    }
    candidate = fallback;
  }

  return { tubes: candidate, palette, numColors };
}

export function WaterSortGame() {
  const [level, setLevel] = React.useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '1', 10);
  });
  const [gameData, setGameData] = React.useState(() => generateWaterLevel(level));
  const [tubes, setTubes] = React.useState(gameData.tubes);
  const [initialTubes, setInitialTubes] = React.useState(gameData.tubes);
  const [palette, setPalette] = React.useState(gameData.palette);
  const [history, setHistory] = React.useState([]);
  const [moves, setMoves] = React.useState(0);
  const [selectedIdx, setSelectedIdx] = React.useState(null);
  const [isPouring, setIsPouring] = React.useState(false);
  const [pouringInfo, setPouringInfo] = React.useState(null); // { src, dst, dir, color }
  const [extraTubesCount, setExtraTubesCount] = React.useState(0);
  const [won, setWon] = React.useState(false);
  const audioCtxRef = React.useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtxRef.current = new AudioClass();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSfx = (type) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(620, t + 0.08);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } else if (type === 'pour') {
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const f = 380 + Math.random() * 240 + i * 110;
          osc.frequency.setValueAtTime(f, t + i * 0.06);
          osc.frequency.exponentialRampToValueAtTime(f * 1.4, t + i * 0.06 + 0.1);
          gain.gain.setValueAtTime(0.08, t + i * 0.06);
          gain.gain.linearRampToValueAtTime(0.001, t + i * 0.06 + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + i * 0.06);
          osc.stop(t + i * 0.06 + 0.1);
        }
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          gain.gain.setValueAtTime(0.16, t + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.4);
        });
      }
    } catch (e) {}
  };

  const loadLevel = (lvl) => {
    const data = generateWaterLevel(lvl);
    setGameData(data);
    setTubes(data.tubes);
    setInitialTubes(data.tubes);
    setPalette(data.palette);
    setHistory([]);
    setMoves(0);
    setSelectedIdx(null);
    setIsPouring(false);
    setPouringInfo(null);
    setExtraTubesCount(0);
    setWon(false);
  };

  const handleTubeClick = (idx) => {
    initAudio();
    if (isPouring || won) return;

    const tube = tubes[idx];

    // Nothing selected yet
    if (selectedIdx === null) {
      if (tube.length === 0) return;
      setSelectedIdx(idx);
      playSfx('tap');
      return;
    }

    // Clicked same tube -> deselect
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      playSfx('tap');
      return;
    }

    // Pour candidate
    const srcIdx = selectedIdx;
    const src = tubes[srcIdx];
    const dst = tubes[idx];

    const srcTop = src[src.length - 1];
    const dstTop = dst.length > 0 ? dst[dst.length - 1] : null;

    let srcCount = 0;
    for (let k = src.length - 1; k >= 0 && src[k] === srcTop; k--) srcCount++;

    const dstSpace = CAPACITY - dst.length;
    const isValid = dstSpace > 0 && (dst.length === 0 || dstTop === srcTop);

    if (isValid) {
      const amount = Math.min(srcCount, dstSpace);
      const dir = idx < srcIdx ? 'left' : 'right';

      setIsPouring(true);
      setSelectedIdx(null);
      setPouringInfo({ src: srcIdx, dst: idx, dir, color: srcTop });
      playSfx('pour');

      // Record undo history
      setHistory(prev => [...prev, { tubes: JSON.parse(JSON.stringify(tubes)), moves }]);

      setTimeout(() => {
        setTubes(prev => {
          const next = prev.map(t => [...t]);
          for (let i = 0; i < amount; i++) {
            next[srcIdx].pop();
            next[idx].push(srcTop);
          }
          return next;
        });
        setMoves(m => m + 1);
        setIsPouring(false);
        setPouringInfo(null);

        // Check Win
        setTimeout(() => {
          setTubes(currentTubes => {
            if (isSolvedWaterState(currentTubes)) {
              setWon(true);
              playSfx('win');
              const nextLvl = level + 1;
              localStorage.setItem(STORAGE_KEY, nextLvl.toString());
            }
            return currentTubes;
          });
        }, 100);
      }, 350);
    } else {
      if (dst.length > 0) {
        setSelectedIdx(idx);
        playSfx('tap');
      } else {
        setSelectedIdx(null);
      }
    }
  };

  const handleUndo = () => {
    initAudio();
    if (history.length === 0 || isPouring) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setTubes(prev.tubes);
    setMoves(prev.moves);
    setSelectedIdx(null);
    playSfx('tap');
  };

  const handleRestart = () => {
    initAudio();
    if (isPouring) return;
    setTubes(JSON.parse(JSON.stringify(initialTubes)));
    setHistory([]);
    setMoves(0);
    setSelectedIdx(null);
    setWon(false);
    playSfx('tap');
  };

  const handleAddTube = () => {
    initAudio();
    if (extraTubesCount >= 2 || isPouring) return;
    setHistory(prev => [...prev, { tubes: JSON.parse(JSON.stringify(tubes)), moves }]);
    setTubes(prev => [...prev, []]);
    setExtraTubesCount(c => c + 1);
    playSfx('tap');
  };

  const handleNextLevel = () => {
    initAudio();
    const nextLvl = level + 1;
    setLevel(nextLvl);
    loadLevel(nextLvl);
  };

  return (
    <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      {/* Top Header Row */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 4px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', color: 'var(--ink-strong)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            Level <strong style={{ color: 'var(--accent)' }}>{level}</strong>
          </span>
          <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', color: 'var(--ink-strong)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            Moves <strong style={{ color: '#0ea5e9' }}>{moves}</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isPouring}
            style={{ padding: '6px 12px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--ink-strong)', fontWeight: '700', fontSize: '12px', cursor: history.length === 0 ? 'not-allowed' : 'pointer', opacity: history.length === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ↩️ Undo
          </button>
          <button
            onClick={handleRestart}
            disabled={isPouring}
            style={{ padding: '6px 12px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--ink-strong)', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🔄 Reset
          </button>
          <button
            onClick={handleAddTube}
            disabled={extraTubesCount >= 2 || isPouring}
            style={{ padding: '6px 12px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent)', fontWeight: '800', fontSize: '12px', cursor: extraTubesCount >= 2 ? 'not-allowed' : 'pointer', opacity: extraTubesCount >= 2 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🧪 +Tube
          </button>
        </div>
      </div>

      {/* Glass Tubes Board */}
      <div style={{ width: '100%', minHeight: '320px', background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.06), transparent 70%)', borderRadius: '24px', padding: '32px 12px 20px 12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '28px 16px', position: 'relative' }}>
        {tubes.map((tube, tubeIdx) => {
          const isSelected = selectedIdx === tubeIdx;
          const isPouringSrc = pouringInfo && pouringInfo.src === tubeIdx;
          const pourDir = pouringInfo ? pouringInfo.dir : 'right';

          let transform = 'translateY(0) scale(1)';
          let zIndex = 1;
          if (isSelected) {
            transform = 'translateY(-22px) scale(1.04)';
            zIndex = 10;
          } else if (isPouringSrc) {
            transform = pourDir === 'left' ? 'translateY(-28px) translateX(-10px) rotate(-38deg)' : 'translateY(-28px) translateX(10px) rotate(38deg)';
            zIndex = 20;
          }

          return (
            <div
              key={tubeIdx}
              onClick={() => handleTubeClick(tubeIdx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform,
                zIndex
              }}
            >
              {/* Glass Rim Top Lip */}
              <div
                style={{
                  width: '58px',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(200, 220, 255, 0.4) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
                  zIndex: 3,
                  marginBottom: '-2px'
                }}
              />

              {/* Glass Tube Body */}
              <div
                style={{
                  position: 'relative',
                  width: '50px',
                  height: '170px',
                  borderRadius: '0 0 25px 25px',
                  border: isSelected ? '3px solid var(--accent)' : '3px solid rgba(255, 255, 255, 0.45)',
                  borderTop: 'none',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.12) 100%)',
                  boxShadow: isSelected ? '0 12px 28px rgba(59, 130, 246, 0.35), inset 0 0 12px rgba(255, 255, 255, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.12), inset 0 0 8px rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  overflow: 'hidden',
                  padding: '0 2px 2px 2px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Specular vertical glossy highlight */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '2px',
                    width: '4px',
                    height: '92%',
                    borderRadius: '2px',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.15) 80%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />

                {/* Right subtle reflection */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '2px',
                    width: '2px',
                    height: '85%',
                    borderRadius: '2px',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.05) 80%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />

                {/* Liquid Layers */}
                {tube.map((colorId, layerIdx) => {
                  const col = palette[colorId];
                  const isTop = layerIdx === tube.length - 1;
                  const isBottom = layerIdx === 0;

                  return (
                    <div
                      key={layerIdx}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: col ? col.gradient : '#3b82f6',
                        position: 'relative',
                        borderRadius: isBottom && isTop ? '4px 4px 22px 22px' : isBottom ? '0 0 22px 22px' : isTop ? '4px 4px 0 0' : '0',
                        boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
                        transition: 'height 0.25s ease'
                      }}
                    >
                      {/* Top liquid meniscus highlight */}
                      {isTop && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.65)',
                            boxShadow: '0 0 4px rgba(255, 255, 255, 0.9)'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Win Modal Popup */}
      {won && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 17, 32, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '32px 24px',
              maxWidth: '320px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ fontSize: '50px', lineHeight: 1 }}>🏆</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--ink-strong)' }}>Level {level} Solved!</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: '1.5' }}>
              Awesome job! All water colors are perfectly sorted into their matching glass tubes.
            </div>

            <div style={{ display: 'flex', gap: '16px', margin: '6px 0' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent)' }}>{moves}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moves</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{level}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Level</div>
              </div>
            </div>

            <button
              onClick={handleNextLevel}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 20px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              Next Level &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

