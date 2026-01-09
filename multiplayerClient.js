// multiplayerClient.js - Client-side multiplayer functionality
class MultiplayerClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.currentPlayer = null;
        this.serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3001' 
            : 'https://your-server-domain.com'; // Replace with your actual server domain
        
        this.callbacks = {
            onConnected: null,
            onDisconnected: null,
            onError: null,
            onRoomJoined: null,
            onPlayerJoined: null,
            onPlayerLeft: null,
            onGameStarted: null,
            onGameUpdate: null,
            onPlayerReady: null
        };

        this.players = new Map(); // id -> {id, name, ...}

        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Connection management
    connect(playerName) {
        return new Promise((resolve, reject) => {
            try {
                // Load Socket.IO from CDN if not already loaded
                if (typeof io === 'undefined') {
                    this.loadSocketIO().then(() => {
                        this.establishConnection(playerName, resolve, reject);
                    }).catch(reject);
                } else {
                    this.establishConnection(playerName, resolve, reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    loadSocketIO() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    establishConnection(playerName, resolve, reject) {
        this.socket = io(this.serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Join as player
            this.socket.emit('player_join', { playerName });
            
            if (this.callbacks.onConnected) {
                this.callbacks.onConnected();
            }
        });

        this.socket.on('player_joined', (data) => {
            this.currentPlayer = {
                id: data.playerId,
                name: data.playerName
            };
            resolve(this.currentPlayer);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            this.isConnected = false;
            this.currentRoom = null;
            
            if (this.callbacks.onDisconnected) {
                this.callbacks.onDisconnected(reason);
            }

            // Attempt to reconnect
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.isConnected = false;
            reject(error);
        });

        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        });

        // Room events
        this.socket.on('player_joined_room', (data) => {
            this.currentRoom = data.roomInfo;
            
            // Update players map
            if (data.players && Array.isArray(data.players)) {
                data.players.forEach(p => {
                    this.players.set(p.id, p);
                });
            }
            
            if (this.callbacks.onRoomJoined) {
                this.callbacks.onRoomJoined(data);
            }
            if (this.callbacks.onPlayerJoined) {
                this.callbacks.onPlayerJoined(data);
            }
        });

        this.socket.on('private_room_created', (data) => {
            this.currentRoom = data.roomInfo;
            if (this.callbacks.onRoomJoined) {
                this.callbacks.onRoomJoined(data);
            }
        });

        this.socket.on('player_left_room', (data) => {
            if (this.callbacks.onPlayerLeft) {
                this.callbacks.onPlayerLeft(data);
            }
        });

        this.socket.on('player_ready_update', (data) => {
            if (this.callbacks.onPlayerReady) {
                this.callbacks.onPlayerReady(data);
            }
        });

        this.socket.on('room_ready_to_start', (data) => {
            if (this.callbacks.onRoomReady) {
                this.callbacks.onRoomReady(data);
            }
        });

        this.socket.on('game_started', (data) => {
            if (this.callbacks.onGameStarted) {
                this.callbacks.onGameStarted(data);
            }
        });

        this.socket.on('game_update', (data) => {
            if (this.callbacks.onGameUpdate) {
                this.callbacks.onGameUpdate(data);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                if (this.socket) {
                    this.socket.connect();
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            if (this.callbacks.onError) {
                this.callbacks.onError({ message: 'Failed to reconnect to server' });
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.currentRoom = null;
        this.currentPlayer = null;
    }

    // Room management
    findPublicGame(options = {}) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        
        this.socket.emit('find_public_game', {
            maxPlayers: options.maxPlayers || 6,
            difficulty: options.difficulty || 'medium'
        });
    }

    createPrivateRoom(options = {}) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        
        this.socket.emit('create_private_room', {
            maxPlayers: options.maxPlayers || 6,
            difficulty: options.difficulty || 'medium',
            roomName: options.roomName || `${this.currentPlayer.name}'s Room`
        });
    }

    joinPrivateRoom(roomCode) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        
        this.socket.emit('join_private_room', { roomCode });
    }

    leaveRoom() {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        
        this.socket.emit('leave_room');
        this.currentRoom = null;
    }

    setPlayerReady(isReady) {
        if (!this.isConnected || !this.currentRoom) {
            throw new Error('Not in a room');
        }
        
        this.socket.emit('player_ready', { isReady });
    }

    startGame(gameOptions = {}) {
        if (!this.isConnected || !this.currentRoom) {
            throw new Error('Not in a room');
        }
        
        this.socket.emit('start_game', gameOptions);
    }

    // Game actions
    sendGameAction(action, payload) {
        if (!this.isConnected || !this.currentRoom) {
            throw new Error('Not in a game');
        }
        
        this.socket.emit('game_action', { action, payload });
    }

    giveClue(clue, word) {
        this.sendGameAction('give_clue', { clue, word });
    }

    makeGuess(guess, isCorrect) {
        this.sendGameAction('make_guess', { guess, isCorrect });
    }

    nextTurn() {
        this.sendGameAction('next_turn', {});
    }

    endRound() {
        this.sendGameAction('end_round', {});
    }

    generateWord() {
        this.sendGameAction('generate_word', {});
    }

    // Event callbacks
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
        }
    }

    // Utility methods
    isInRoom() {
        return this.currentRoom !== null;
    }

    getRoomInfo() {
        return this.currentRoom;
    }

    getPlayerInfo() {
        return this.currentPlayer;
    }

    getPlayerName(playerId) {
        if (this.currentPlayer && this.currentPlayer.id === playerId) {
            return this.currentPlayer.name;
        }
        const player = this.players.get(playerId);
        return player ? player.name : `Player ${playerId.substring(0, 4)}`;
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            room: this.currentRoom,
            player: this.currentPlayer
        };
    }
}

// Export for use in other files
window.MultiplayerClient = MultiplayerClient;