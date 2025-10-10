// server.js - Main backend server for Password Game
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow WebSocket connections
}));
app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] // Replace with your actual domain
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Socket.IO setup with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://yourdomain.com']
            : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Game state management
const GameManager = require('./gameManager');
const gameManager = new GameManager();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        activeRooms: gameManager.getActiveRoomsCount(),
        connectedPlayers: gameManager.getConnectedPlayersCount()
    });
});

// API endpoints
app.get('/api/stats', (req, res) => {
    res.json(gameManager.getServerStats());
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle player joining
    socket.on('player_join', (data) => {
        try {
            const { playerName, gameMode } = data;
            
            if (!playerName || playerName.trim().length === 0) {
                socket.emit('error', { message: 'Player name is required' });
                return;
            }

            // Create player object
            const player = {
                id: socket.id,
                name: playerName.trim(),
                isReady: false,
                isLeader: false,
                team: null,
                joinedAt: new Date()
            };

            gameManager.addPlayer(socket.id, player);
            
            socket.emit('player_joined', { 
                playerId: socket.id, 
                playerName: player.name 
            });

            console.log(`Player ${player.name} (${socket.id}) joined`);
        } catch (error) {
            console.error('Error in player_join:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    // Handle finding public game
    socket.on('find_public_game', (data) => {
        try {
            const { maxPlayers = 6, difficulty = 'medium' } = data;
            const player = gameManager.getPlayer(socket.id);
            
            if (!player) {
                socket.emit('error', { message: 'Player not found. Please rejoin.' });
                return;
            }

            const room = gameManager.findOrCreatePublicRoom(socket.id, { maxPlayers, difficulty });
            
            if (room) {
                socket.join(room.id);
                
                // Notify all players in room about new player
                io.to(room.id).emit('player_joined_room', {
                    roomId: room.id,
                    player: player,
                    players: room.players,
                    roomInfo: {
                        id: room.id,
                        type: room.type,
                        maxPlayers: room.maxPlayers,
                        currentPlayers: room.players.length,
                        difficulty: room.difficulty,
                        status: room.status
                    }
                });

                console.log(`Player ${player.name} joined public room ${room.id}`);
            } else {
                socket.emit('error', { message: 'Failed to find or create room' });
            }
        } catch (error) {
            console.error('Error in find_public_game:', error);
            socket.emit('error', { message: 'Failed to find public game' });
        }
    });

    // Handle creating private room
    socket.on('create_private_room', (data) => {
        try {
            const { maxPlayers = 6, difficulty = 'medium', roomName } = data;
            const player = gameManager.getPlayer(socket.id);
            
            if (!player) {
                socket.emit('error', { message: 'Player not found. Please rejoin.' });
                return;
            }

            const room = gameManager.createPrivateRoom(socket.id, { 
                maxPlayers, 
                difficulty, 
                roomName 
            });
            
            if (room) {
                socket.join(room.id);
                player.isLeader = true;
                
                socket.emit('private_room_created', {
                    roomId: room.id,
                    roomCode: room.code,
                    roomInfo: {
                        id: room.id,
                        code: room.code,
                        name: room.name,
                        type: room.type,
                        maxPlayers: room.maxPlayers,
                        currentPlayers: room.players.length,
                        difficulty: room.difficulty,
                        status: room.status,
                        leader: player.name
                    }
                });

                console.log(`Player ${player.name} created private room ${room.code}`);
            } else {
                socket.emit('error', { message: 'Failed to create private room' });
            }
        } catch (error) {
            console.error('Error in create_private_room:', error);
            socket.emit('error', { message: 'Failed to create private room' });
        }
    });

    // Handle joining private room
    socket.on('join_private_room', (data) => {
        try {
            const { roomCode } = data;
            const player = gameManager.getPlayer(socket.id);
            
            if (!player) {
                socket.emit('error', { message: 'Player not found. Please rejoin.' });
                return;
            }

            if (!roomCode || roomCode.trim().length === 0) {
                socket.emit('error', { message: 'Room code is required' });
                return;
            }

            const room = gameManager.joinPrivateRoom(socket.id, roomCode.trim().toUpperCase());
            
            if (room) {
                socket.join(room.id);
                
                // Notify all players in room
                io.to(room.id).emit('player_joined_room', {
                    roomId: room.id,
                    player: player,
                    players: room.players,
                    roomInfo: {
                        id: room.id,
                        code: room.code,
                        name: room.name,
                        type: room.type,
                        maxPlayers: room.maxPlayers,
                        currentPlayers: room.players.length,
                        difficulty: room.difficulty,
                        status: room.status
                    }
                });

                console.log(`Player ${player.name} joined private room ${room.code}`);
            } else {
                socket.emit('error', { message: 'Room not found or is full' });
            }
        } catch (error) {
            console.error('Error in join_private_room:', error);
            socket.emit('error', { message: 'Failed to join private room' });
        }
    });

    // Handle player ready status
    socket.on('player_ready', (data) => {
        try {
            const { isReady } = data;
            const player = gameManager.getPlayer(socket.id);
            const room = gameManager.getPlayerRoom(socket.id);
            
            if (!player || !room) {
                socket.emit('error', { message: 'Player or room not found' });
                return;
            }

            player.isReady = isReady;
            
            // Notify all players in room
            io.to(room.id).emit('player_ready_update', {
                playerId: socket.id,
                playerName: player.name,
                isReady: isReady,
                players: room.players
            });

            // Check if all players are ready
            const allReady = room.players.every(p => p.isReady);
            if (allReady && room.players.length >= 4) { // Minimum 4 players
                room.status = 'ready_to_start';
                io.to(room.id).emit('room_ready_to_start', { roomId: room.id });
            }

            console.log(`Player ${player.name} ready status: ${isReady}`);
        } catch (error) {
            console.error('Error in player_ready:', error);
            socket.emit('error', { message: 'Failed to update ready status' });
        }
    });

    // Handle game start
    socket.on('start_game', (data) => {
        try {
            const player = gameManager.getPlayer(socket.id);
            const room = gameManager.getPlayerRoom(socket.id);
            
            if (!player || !room) {
                socket.emit('error', { message: 'Player or room not found' });
                return;
            }

            if (!player.isLeader && room.type === 'private') {
                socket.emit('error', { message: 'Only room leader can start the game' });
                return;
            }

            if (room.players.length < 4) {
                socket.emit('error', { message: 'Need at least 4 players to start' });
                return;
            }

            const gameStarted = gameManager.startGame(room.id, data);
            
            if (gameStarted) {
                io.to(room.id).emit('game_started', {
                    roomId: room.id,
                    gameState: room.gameState,
                    teams: room.teams
                });

                console.log(`Game started in room ${room.id}`);
            } else {
                socket.emit('error', { message: 'Failed to start game' });
            }
        } catch (error) {
            console.error('Error in start_game:', error);
            socket.emit('error', { message: 'Failed to start game' });
        }
    });

    // Handle game actions
    socket.on('game_action', (data) => {
        try {
            const { action, payload } = data;
            const player = gameManager.getPlayer(socket.id);
            const room = gameManager.getPlayerRoom(socket.id);
            
            if (!player || !room || room.status !== 'playing') {
                socket.emit('error', { message: 'Invalid game state' });
                return;
            }

            const result = gameManager.handleGameAction(room.id, socket.id, action, payload);
            
            if (result.success) {
                // Broadcast to all players in room
                io.to(room.id).emit('game_update', {
                    action: action,
                    payload: result.data,
                    gameState: room.gameState
                });
            } else {
                socket.emit('error', { message: result.error });
            }
        } catch (error) {
            console.error('Error in game_action:', error);
            socket.emit('error', { message: 'Failed to process game action' });
        }
    });

    // Handle leaving room
    socket.on('leave_room', () => {
        try {
            handlePlayerLeave(socket.id);
        } catch (error) {
            console.error('Error in leave_room:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        try {
            console.log(`Player disconnected: ${socket.id}, reason: ${reason}`);
            handlePlayerLeave(socket.id);
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });

    // Helper function to handle player leaving
    function handlePlayerLeave(playerId) {
        const player = gameManager.getPlayer(playerId);
        const room = gameManager.getPlayerRoom(playerId);
        
        if (player && room) {
            // Remove player from room
            gameManager.removePlayerFromRoom(playerId);
            
            // Notify other players
            socket.to(room.id).emit('player_left_room', {
                playerId: playerId,
                playerName: player.name,
                players: room.players,
                roomInfo: {
                    currentPlayers: room.players.length,
                    status: room.status
                }
            });

            console.log(`Player ${player.name} left room ${room.id}`);
        }
        
        // Remove player completely
        gameManager.removePlayer(playerId);
    }
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Password Game Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };