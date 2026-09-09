import React, { useState, useEffect } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  // true = user (X), false = computer (O)
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  const handleClick = (index) => {
    // Return if it's computer's turn, game is over, or square is filled
    if (!isXNext || winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    
    const currentWinner = checkWinner(newBoard);
    if (currentWinner) {
      setWinner(currentWinner);
    }
  };

  useEffect(() => {
    if (!isXNext && !winner) {
      // Computer's turn
      const timer = setTimeout(() => {
        // Find empty spots
        const emptySpots = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        
        if (emptySpots.length > 0) {
          // Very simple AI: Pick a random spot
          // For a fully fledged game we could do minimax, but random is okay for a simple mini-game while waiting
          // Let's make it slightly smarter: check if we can win, or block user
          let move = -1;

          // 1. Check if computer can win
          for (let i = 0; i < emptySpots.length; i++) {
            const testBoard = [...board];
            testBoard[emptySpots[i]] = 'O';
            if (checkWinner(testBoard) === 'O') {
              move = emptySpots[i];
              break;
            }
          }

          // 2. Check if need to block user
          if (move === -1) {
            for (let i = 0; i < emptySpots.length; i++) {
              const testBoard = [...board];
              testBoard[emptySpots[i]] = 'X';
              if (checkWinner(testBoard) === 'X') {
                move = emptySpots[i];
                break;
              }
            }
          }

          // 3. Take center if available
          if (move === -1 && board[4] === null) {
            move = 4;
          }

          // 4. Random choice
          if (move === -1) {
            const randomIndex = Math.floor(Math.random() * emptySpots.length);
            move = emptySpots[randomIndex];
          }

          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          setIsXNext(true);

          const currentWinner = checkWinner(newBoard);
          if (currentWinner) {
            setWinner(currentWinner);
          }
        }
      }, 500); // Slight delay for realistic feel
      
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, winner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  let statusText = isXNext ? "Your turn (X)" : "Computer's turn (O)";
  if (winner === 'X') statusText = "You won! 🎉";
  else if (winner === 'O') statusText = "Computer won!";
  else if (winner === 'Draw') statusText = "It's a draw!";

  return (
    <div style={{ background: 'linear-gradient(135deg, #1e3fd1 0%, #3b5fe0 50%, #6366f1 100%)', borderRadius: '32px', padding: '32px 24px', textAlign: 'center', marginBottom: '24px', color: '#fff' }}>
      <h3 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', lineHeight: 1.2 }}>Let's Play Tic Tac Toe<br/>while we wait!</h3>
      <p style={{ fontSize: '15px', opacity: 0.9, margin: '0 0 24px 0' }}>Play against the computer. Track status below.</p>
      
      <div style={{ backgroundColor: '#f8fafc', borderRadius: '24px', padding: '20px', maxWidth: '280px', margin: '0 auto 20px auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        {board.map((cell, index) => {
          const borderRight = (index % 3 !== 2) ? '2px solid #b2c1da' : 'none';
          const borderBottom = (index < 6) ? '2px solid #b2c1da' : 'none';

          return (
            <div 
              key={index} 
              onClick={() => handleClick(index)}
              style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight,
                borderBottom,
                cursor: (!cell && !winner && isXNext) ? 'pointer' : 'default',
                fontSize: '42px',
                fontWeight: '900',
                color: '#2563eb', // Blue for X and O to match reference
                lineHeight: 1
              }}
            >
              {cell === 'X' && (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              )}
              {cell === 'O' && (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"></circle></svg>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0' }}>{statusText}</p>
      
      {winner && (
        <button 
          onClick={resetGame}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.5)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToe;
