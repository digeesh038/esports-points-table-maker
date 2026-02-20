import {
    createContext,
    useEffect,
    useState,
    useCallback,
    useContext,
} from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// ✅ MUST use socket URL (NOT API URL)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const socketInstance = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'], // cleaner & avoids polling issues
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected:', socketInstance.id);
            setConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setConnected(false);

            if (reason === 'io server disconnect') {
                socketInstance.connect();
            }
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    /* ---------- Core socket helpers ---------- */
    const on = useCallback(
        (event, callback) => {
            if (!socket) return;
            socket.on(event, callback);
        },
        [socket]
    );

    const off = useCallback(
        (event, callback) => {
            if (!socket) return;
            socket.off(event, callback);
        },
        [socket]
    );

    const emit = useCallback(
        (event, data) => {
            if (socket && connected) {
                socket.emit(event, data);
            }
        },
        [socket, connected]
    );

    /* ---------- Leaderboard helpers ---------- */
    const subscribeToLeaderboard = useCallback(
        (id, type = 'stage', callback) => {
            if (type === 'tournament') {
                emit('join:tournament', id);
            } else {
                emit('join:stage', id);
            }
            on('leaderboard:update', callback);
        },
        [emit, on]
    );

    const unsubscribeFromLeaderboard = useCallback(
        (id, type = 'stage', callback) => {
            if (type === 'tournament') {
                emit('leave:tournament', id);
            }
            // Note: Currently backend doesn't have leave:stage, but we off the listener
            off('leaderboard:update', callback);
        },
        [emit, off]
    );

    /* ---------- Room helpers ---------- */
    const joinTournament = (tournamentId) =>
        emit('join:tournament', tournamentId);

    const leaveTournament = (tournamentId) =>
        emit('leave:tournament', tournamentId);

    const joinMatch = (matchId) =>
        emit('join:match', matchId);

    const leaveMatch = (matchId) =>
        emit('leave:match', matchId);

    return (
        <SocketContext.Provider
            value={{
                socket,
                connected,
                on,
                off,
                emit,
                joinTournament,
                leaveTournament,
                joinMatch,
                leaveMatch,
                subscribeToLeaderboard,
                unsubscribeFromLeaderboard,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

/* =========================
   useSocket hook
========================= */
export const useSocket = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error('useSocket must be used inside SocketProvider');
    }

    return context;
};

export default SocketContext;
