// gameManager.js - Core game logic and room management
const { v4: uuidv4 } = require('uuid');

class GameManager {
    constructor() {
        this.players = new Map(); // playerId -> player object
        this.rooms = new Map(); // roomId -> room object
        this.privateRoomCodes = new Map(); // roomCode -> roomId
        this.playerRooms = new Map(); // playerId -> roomId
        
        // Game configuration
        this.config = {
            maxPlayersPerRoom: 10,
            minPlayersToStart: 4,
            roomCodeLength: 6,
            maxRooms: 1000,
            playerTimeout: 300000, // 5 minutes
            gameTimeout: 1800000 // 30 minutes
        };

        // Start cleanup interval
        this.startCleanupInterval();
    }

    // Player management
    addPlayer(playerId, playerData) {
        this.players.set(playerId, {
            ...playerData,
            id: playerId,
            joinedAt: new Date(),
            lastActivity: new Date()
        });
        return this.players.get(playerId);
    }

    getPlayer(playerId) {
        return this.players.get(playerId);
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            // Remove from room if in one
            this.removePlayerFromRoom(playerId);
            this.players.delete(playerId);
        }
        return player;
    }

    updatePlayerActivity(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.lastActivity = new Date();
        }
    }

    // Room management
    createRoom(type, creatorId, options = {}) {
        if (this.rooms.size >= this.config.maxRooms) {
            throw new Error('Server is full');
        }

        const roomId = uuidv4();
        const creator = this.players.get(creatorId);
        
        if (!creator) {
            throw new Error('Creator not found');
        }

        const room = {
            id: roomId,
            type: type, // 'public' or 'private'
            name: options.roomName || `${creator.name}'s Room`,
            code: type === 'private' ? this.generateRoomCode() : null,
            createdBy: creatorId,
            createdAt: new Date(),
            maxPlayers: Math.min(options.maxPlayers || 6, this.config.maxPlayersPerRoom),
            difficulty: options.difficulty || 'medium',
            status: 'waiting', // waiting, ready_to_start, playing, finished
            players: [creatorId],
            teams: { team1: [], team2: [] },
            gameState: null,
            lastActivity: new Date()
        };

        this.rooms.set(roomId, room);
        this.playerRooms.set(creatorId, roomId);
        
        if (room.code) {
            this.privateRoomCodes.set(room.code, roomId);
        }

        // Set creator as leader for private rooms
        if (type === 'private') {
            creator.isLeader = true;
        }

        console.log(`Created ${type} room ${roomId} ${room.code ? `(${room.code})` : ''}`);
        return room;
    }

    findOrCreatePublicRoom(playerId, options = {}) {
        const player = this.players.get(playerId);
        if (!player) return null;

        // First, try to find an existing public room with space
        for (const [roomId, room] of this.rooms) {
            if (room.type === 'public' && 
                room.status === 'waiting' && 
                room.players.length < room.maxPlayers &&
                room.difficulty === (options.difficulty || 'medium')) {
                
                // Add player to existing room
                room.players.push(playerId);
                this.playerRooms.set(playerId, roomId);
                room.lastActivity = new Date();
                
                console.log(`Player ${player.name} joined existing public room ${roomId}`);
                return room;
            }
        }

        // No suitable room found, create new one
        try {
            const newRoom = this.createRoom('public', playerId, options);
            console.log(`Created new public room ${newRoom.id} for player ${player.name}`);
            return newRoom;
        } catch (error) {
            console.error('Failed to create public room:', error);
            return null;
        }
    }

    createPrivateRoom(creatorId, options = {}) {
        try {
            return this.createRoom('private', creatorId, options);
        } catch (error) {
            console.error('Failed to create private room:', error);
            return null;
        }
    }

    joinPrivateRoom(playerId, roomCode) {
        const player = this.players.get(playerId);
        if (!player) return null;

        const roomId = this.privateRoomCodes.get(roomCode.toUpperCase());
        if (!roomId) return null;

        const room = this.rooms.get(roomId);
        if (!room || room.players.length >= room.maxPlayers || room.status !== 'waiting') {
            return null;
        }

        // Add player to room
        room.players.push(playerId);
        this.playerRooms.set(playerId, roomId);
        room.lastActivity = new Date();

        return room;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getPlayerRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        return roomId ? this.rooms.get(roomId) : null;
    }

    removePlayerFromRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        // Remove player from room
        room.players = room.players.filter(id => id !== playerId);
        this.playerRooms.delete(playerId);

        // If room is empty, clean it up
        if (room.players.length === 0) {
            this.cleanupRoom(roomId);
        } else {
            // If the leaving player was the leader, assign new leader
            const leavingPlayer = this.players.get(playerId);
            if (leavingPlayer && leavingPlayer.isLeader && room.players.length > 0) {
                const newLeaderId = room.players[0];
                const newLeader = this.players.get(newLeaderId);
                if (newLeader) {
                    newLeader.isLeader = true;
                }
            }
            room.lastActivity = new Date();
        }
    }

    cleanupRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Remove room code mapping if private
        if (room.code) {
            this.privateRoomCodes.delete(room.code);
        }

        // Remove all player mappings
        room.players.forEach(playerId => {
            this.playerRooms.delete(playerId);
        });

        // Remove room
        this.rooms.delete(roomId);
        console.log(`Cleaned up room ${roomId} ${room.code ? `(${room.code})` : ''}`);
    }

    // Game logic
    startGame(roomId, gameOptions = {}) {
        const room = this.rooms.get(roomId);
        if (!room || room.status !== 'waiting' && room.status !== 'ready_to_start') {
            return false;
        }

        if (room.players.length < this.config.minPlayersToStart) {
            return false;
        }

        // Initialize game state
        room.gameState = {
            currentRound: 1,
            totalRounds: gameOptions.rounds || 3,
            currentTeam: 1,
            currentWord: null,
            currentGuesser: null,
            currentClueGiver: null,
            timer: {
                enabled: gameOptions.timerEnabled !== false,
                duration: gameOptions.timerDuration || 90,
                remaining: gameOptions.timerDuration || 90
            },
            scores: { team1: 0, team2: 0 },
            gameLog: [],
            startedAt: new Date()
        };

        // Assign players to teams
        this.assignTeams(room);

        room.status = 'playing';
        room.lastActivity = new Date();

        return true;
    }

    assignTeams(room) {
        const players = room.players.map(id => this.players.get(id)).filter(p => p);
        
        // Shuffle players
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Assign to teams alternately
        room.teams.team1 = [];
        room.teams.team2 = [];

        players.forEach((player, index) => {
            const team = index % 2 === 0 ? 'team1' : 'team2';
            room.teams[team].push(player.id);
            player.team = team;
        });
    }

    handleGameAction(roomId, playerId, action, payload) {
        const room = this.rooms.get(roomId);
        const player = this.players.get(playerId);

        if (!room || !player || room.status !== 'playing') {
            return { success: false, error: 'Invalid game state' };
        }

        room.lastActivity = new Date();
        this.updatePlayerActivity(playerId);

        switch (action) {
            case 'give_clue':
                return this.handleGiveClue(room, playerId, payload);
            case 'make_guess':
                return this.handleMakeGuess(room, playerId, payload);
            case 'next_turn':
                return this.handleNextTurn(room, playerId);
            case 'end_round':
                return this.handleEndRound(room, playerId);
            case 'generate_word':
                return this.handleGenerateWord(room, playerId);
            default:
                return { success: false, error: 'Unknown action' };
        }
    }

    handleGiveClue(room, playerId, payload) {
        const { clue, word } = payload;
        
        if (!clue || !word) {
            return { success: false, error: 'Clue and word are required' };
        }

        // Log the clue
        room.gameState.gameLog.push({
            type: 'clue',
            playerId: playerId,
            playerName: this.players.get(playerId).name,
            clue: clue,
            word: word,
            timestamp: new Date()
        });

        return {
            success: true,
            data: {
                type: 'clue_given',
                playerId: playerId,
                playerName: this.players.get(playerId).name,
                clue: clue
            }
        };
    }

    handleMakeGuess(room, playerId, payload) {
        const { guess, isCorrect } = payload;
        const player = this.players.get(playerId);

        // Log the guess
        room.gameState.gameLog.push({
            type: 'guess',
            playerId: playerId,
            playerName: player.name,
            guess: guess,
            isCorrect: isCorrect,
            timestamp: new Date()
        });

        // Update score if correct
        if (isCorrect) {
            room.gameState.scores[player.team]++;
        }

        return {
            success: true,
            data: {
                type: 'guess_made',
                playerId: playerId,
                playerName: player.name,
                guess: guess,
                isCorrect: isCorrect,
                scores: room.gameState.scores
            }
        };
    }

    handleNextTurn(room, playerId) {
        // Switch teams
        room.gameState.currentTeam = room.gameState.currentTeam === 1 ? 2 : 1;
        
        return {
            success: true,
            data: {
                type: 'turn_changed',
                currentTeam: room.gameState.currentTeam
            }
        };
    }

    handleEndRound(room, playerId) {
        room.gameState.currentRound++;
        
        if (room.gameState.currentRound > room.gameState.totalRounds) {
            // Game finished
            room.status = 'finished';
            
            return {
                success: true,
                data: {
                    type: 'game_finished',
                    finalScores: room.gameState.scores,
                    winner: room.gameState.scores.team1 > room.gameState.scores.team2 ? 'team1' : 
                           room.gameState.scores.team2 > room.gameState.scores.team1 ? 'team2' : 'tie'
                }
            };
        }

        return {
            success: true,
            data: {
                type: 'round_ended',
                currentRound: room.gameState.currentRound,
                totalRounds: room.gameState.totalRounds
            }
        };
    }

    handleGenerateWord(room, playerId) {
        const words = this.getWordsForDifficulty(room.difficulty);
        const randomWord = words[Math.floor(Math.random() * words.length)];
        
        room.gameState.currentWord = randomWord;
        
        return {
            success: true,
            data: {
                type: 'word_generated',
                word: randomWord
            }
        };
    }

    // Utility methods
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        
        do {
            code = '';
            for (let i = 0; i < this.config.roomCodeLength; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.privateRoomCodes.has(code));
        
        return code;
    }

    getWordsForDifficulty(difficulty) {
        const easyWords = ['SUN', 'MOON', 'STAR', 'CAR', 'BOOK', 'TREE', 'HOUSE', 'WATER', 'FIRE', 'BIRD'];
        const mediumWords = ['ADVENTURE', 'BALANCE', 'CHALLENGE', 'DISCOVER', 'ELEGANT', 'FREEDOM', 'HARMONY', 'INSPIRE', 'JOURNEY', 'KNOWLEDGE'];
        const hardWords = ['AMBIVALENT', 'CATALYST', 'ENIGMATIC', 'FASTIDIOUS', 'GREGARIOUS', 'INEFFABLE', 'JUXTAPOSE', 'MELLIFLUOUS', 'PARADIGM', 'SERENDIPITY'];
        
        switch (difficulty) {
            case 'easy': return easyWords;
            case 'hard': return hardWords;
            default: return mediumWords;
        }
    }

    // Statistics and monitoring
    getServerStats() {
        return {
            totalPlayers: this.players.size,
            totalRooms: this.rooms.size,
            publicRooms: Array.from(this.rooms.values()).filter(r => r.type === 'public').length,
            privateRooms: Array.from(this.rooms.values()).filter(r => r.type === 'private').length,
            activeGames: Array.from(this.rooms.values()).filter(r => r.status === 'playing').length,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }

    getActiveRoomsCount() {
        return this.rooms.size;
    }

    getConnectedPlayersCount() {
        return this.players.size;
    }

    // Cleanup inactive rooms and players
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupInactiveRooms();
            this.cleanupInactivePlayers();
        }, 60000); // Run every minute
    }

    cleanupInactiveRooms() {
        const now = new Date();
        const roomsToDelete = [];

        for (const [roomId, room] of this.rooms) {
            const inactiveTime = now - room.lastActivity;
            
            // Remove rooms inactive for more than game timeout
            if (inactiveTime > this.config.gameTimeout) {
                roomsToDelete.push(roomId);
            }
        }

        roomsToDelete.forEach(roomId => {
            console.log(`Cleaning up inactive room: ${roomId}`);
            this.cleanupRoom(roomId);
        });
    }

    cleanupInactivePlayers() {
        const now = new Date();
        const playersToDelete = [];

        for (const [playerId, player] of this.players) {
            const inactiveTime = now - player.lastActivity;
            
            // Remove players inactive for more than player timeout
            if (inactiveTime > this.config.playerTimeout) {
                playersToDelete.push(playerId);
            }
        }

        playersToDelete.forEach(playerId => {
            console.log(`Cleaning up inactive player: ${playerId}`);
            this.removePlayer(playerId);
        });
    }
}

module.exports = GameManager;