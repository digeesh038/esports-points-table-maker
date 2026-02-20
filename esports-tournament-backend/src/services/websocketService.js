import { Server } from 'socket.io';

class WebSocketService {
    constructor() {
        this.io = null;
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        this.io.on('connection', (socket) => {
            console.log(`✅ WebSocket client connected: ${socket.id}`);

            // Join tournament room
            socket.on('join:tournament', (tournamentId) => {
                socket.join(`tournament:${tournamentId}`);
                console.log(`📡 Client ${socket.id} joined tournament:${tournamentId}`);
            });

            // Join match room
            socket.on('join:match', (matchId) => {
                socket.join(`match:${matchId}`);
                console.log(`📡 Client ${socket.id} joined match:${matchId}`);
            });

            // Join stage/leaderboard room
            socket.on('join:stage', (stageId) => {
                socket.join(`stage:${stageId}`);
                console.log(`📡 Client ${socket.id} joined stage:${stageId}`);
            });

            // Leave tournament room
            socket.on('leave:tournament', (tournamentId) => {
                socket.leave(`tournament:${tournamentId}`);
                console.log(`📡 Client ${socket.id} left tournament:${tournamentId}`);
            });

            // Leave match room
            socket.on('leave:match', (matchId) => {
                socket.leave(`match:${matchId}`);
                console.log(`📡 Client ${socket.id} left match:${matchId}`);
            });

            socket.on('disconnect', () => {
                console.log(`❌ WebSocket client disconnected: ${socket.id}`);
            });
        });

        console.log('✅ WebSocket service initialized');
    }

    // Emit match status update
    emitMatchUpdate(matchId, data) {
        if (this.io) {
            this.io.to(`match:${matchId}`).emit('match:update', data);
        }
    }

    // Emit match result update
    emitMatchResult(matchId, results) {
        if (this.io) {
            this.io.to(`match:${matchId}`).emit('match:result', results);
        }
    }

    // Emit leaderboard update
    emitLeaderboardUpdate(tournamentId, leaderboard) {
        if (this.io) {
            this.io.to(`tournament:${tournamentId}`).emit('leaderboard:update', leaderboard);
        }
    }

    emitStageLeaderboardUpdate(stageId, leaderboard) {
        if (this.io) {
            this.io.to(`stage:${stageId}`).emit('leaderboard:update', { leaderboard, stageId });
        }
    }

    // Emit tournament update
    emitTournamentUpdate(tournamentId, data) {
        if (this.io) {
            this.io.to(`tournament:${tournamentId}`).emit('tournament:update', data);
        }
    }

    // Broadcast to all clients
    broadcast(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    // Broadcast to a specific room
    broadcastToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
