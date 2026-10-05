import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

export function useMultiplayerGame(gameType, onActionReceived) {
  const [mode, setMode] = useState('menu'); // menu, local_ai, online
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [playerNum, setPlayerNum] = useState(null);
  const playerNumRef = useRef(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const onActionRef = useRef(onActionReceived);

  useEffect(() => {
    playerNumRef.current = playerNum;
  }, [playerNum]);

  useEffect(() => {
    onActionRef.current = onActionReceived;
  }, [onActionReceived]);

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    connectWs(code);
  };

  const joinRoom = (code) => {
    if (!code) return;
    setRoomCode(code.toUpperCase());
    connectWs(code.toUpperCase());
  };

  const connectWs = (code) => {
    const socket = new WebSocket(`${WS_URL}/api/games/ws/${gameType}_${code}`);
    
    socket.onopen = () => {
      setConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') {
        setPlayerNum(data.player);
      } else if (data.type === 'player_joined') {
        setPlayersCount(data.count);
      } else if (data.type === 'player_left') {
        setPlayersCount(data.count);
        setError('Opponent left the game.');
      } else if (data.type === 'action') {
        if (data.sender !== playerNumRef.current) {
          if (onActionRef.current) {
            onActionRef.current(data.action);
          }
        }
      } else if (data.type === 'error') {
        setError(data.message);
        socket.close();
      }
    };

    socket.onclose = () => {
      setConnected(false);
    };

    ws.current = socket;
  };

  const sendAction = useCallback((action) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'action', action }));
    }
  }, []);

  const leaveRoom = () => {
    if (ws.current) {
      ws.current.close();
    }
    setMode('menu');
    setRoomCode('');
    setRoomCodeInput('');
    setConnected(false);
    setPlayerNum(null);
    setPlayersCount(0);
    setError(null);
  };

  return {
    mode, setMode,
    roomCodeInput, setRoomCodeInput,
    roomCode, connected, playerNum, playersCount, error,
    createRoom, joinRoom, leaveRoom, sendAction
  };
}
