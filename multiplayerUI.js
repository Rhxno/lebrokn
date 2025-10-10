// multiplayerUI.js - UI components for multiplayer functionality
class MultiplayerUI {
    constructor(multiplayerClient) {
        console.log('MultiplayerUI constructor called');
        this.client = multiplayerClient;
        this.currentScreen = null;
        this.roomPlayers = [];
        
        this.setupEventListeners();
        this.createMultiplayerScreens();
        console.log('MultiplayerUI initialization complete');
    }

    setupEventListeners() {
        // Client event handlers
        this.client.on('connected', () => {
            this.showConnectionStatus('Connected to server', 'success');
        });

        this.client.on('disconnected', (reason) => {
            this.showConnectionStatus(`Disconnected: ${reason}`, 'error');
            this.showMultiplayerMenu();
        });

        this.client.on('error', (error) => {
            this.showConnectionStatus(error.message, 'error');
        });

        this.client.on('roomJoined', (data) => {
            this.showLobby(data.roomInfo);
            this.updatePlayerList(data.players);
        });

        this.client.on('playerJoined', (data) => {
            this.updatePlayerList(data.players);
            this.showNotification(`${data.player.name} joined the room`);
        });

        this.client.on('playerLeft', (data) => {
            this.updatePlayerList(data.players);
            this.showNotification(`${data.playerName} left the room`);
        });

        this.client.on('playerReady', (data) => {
            this.updatePlayerReadyStatus(data);
        });

        this.client.on('roomReady', (data) => {
            this.showStartGameButton();
        });

        this.client.on('gameStarted', (data) => {
            this.hideMultiplayerScreens();
            this.startMultiplayerGame(data);
        });

        this.client.on('gameUpdate', (data) => {
            this.handleGameUpdate(data);
        });
    }

    createMultiplayerScreens() {
        // Create multiplayer menu screen
        this.createMultiplayerMenu();
        
        // Create lobby screen
        this.createLobbyScreen();
        
        // Create connection screen
        this.createConnectionScreen();
    }

    createMultiplayerMenu() {
        console.log('Creating multiplayer menu screen');
        const menuHTML = `
            <section class="setup-screen" id="multiplayer-menu-screen">
                <div class="card-content">
                    <h2>Multiplayer Mode</h2>
                    <div class="connection-status" id="connection-status"></div>
                    
                    <div class="player-name-section">
                        <input type="text" id="multiplayer-player-name" placeholder="Enter your name" maxlength="20">
                    </div>
                    
                    <div class="multiplayer-options">
                        <button class="btn primary-btn" id="find-public-game-btn">Find Public Game</button>
                        <button class="btn secondary-btn" id="create-private-room-btn">Create Private Room</button>
                        <button class="btn secondary-btn" id="join-private-room-btn">Join Private Room</button>
                        <button class="btn secondary-btn" id="back-to-single-player-btn">Back to Single Player</button>
                    </div>
                    
                    <div class="private-room-section" id="private-room-section" style="display: none;">
                        <input type="text" id="room-code-input" placeholder="Enter room code" maxlength="6">
                        <button class="btn primary-btn" id="join-room-btn">Join Room</button>
                        <button class="btn secondary-btn" id="cancel-join-btn">Cancel</button>
                    </div>
                </div>
            </section>
        `;
        
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        console.log('Multiplayer menu HTML added to DOM');
        this.setupMultiplayerMenuEvents();
        console.log('Multiplayer menu events setup complete');
    }

    createLobbyScreen() {
        const lobbyHTML = `
            <section class="setup-screen" id="multiplayer-lobby-screen">
                <div class="card-content">
                    <h2 id="lobby-title">Game Lobby</h2>
                    <div class="room-info" id="room-info">
                        <div class="room-code" id="room-code-display" style="display: none;">
                            <span>Room Code: <strong id="room-code-text"></strong></span>
                            <button class="btn secondary-btn" id="copy-room-code-btn">Copy</button>
                        </div>
                        <div class="room-details">
                            <span id="room-players-count">0/6 Players</span>
                            <span id="room-difficulty">Medium</span>
                        </div>
                    </div>
                    
                    <div class="players-list-container">
                        <h3>Players</h3>
                        <div class="players-list" id="lobby-players-list"></div>
                    </div>
                    
                    <div class="lobby-actions">
                        <button class="btn secondary-btn" id="toggle-ready-btn">Ready</button>
                        <button class="btn primary-btn" id="start-multiplayer-game-btn" style="display: none;">Start Game</button>
                        <button class="btn secondary-btn" id="leave-room-btn">Leave Room</button>
                    </div>
                </div>
            </section>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lobbyHTML);
        this.setupLobbyEvents();
    }

    createConnectionScreen() {
        const connectionHTML = `
            <section class="setup-screen" id="connection-screen">
                <div class="card-content">
                    <h2>Connecting...</h2>
                    <div class="loading-spinner"></div>
                    <p id="connection-message">Connecting to server...</p>
                    <button class="btn secondary-btn" id="cancel-connection-btn">Cancel</button>
                </div>
            </section>
        `;
        
        document.body.insertAdjacentHTML('beforeend', connectionHTML);
        this.setupConnectionEvents();
    }

    setupMultiplayerMenuEvents() {
        document.getElementById('find-public-game-btn').addEventListener('click', () => {
            this.findPublicGame();
        });

        document.getElementById('create-private-room-btn').addEventListener('click', () => {
            this.createPrivateRoom();
        });

        document.getElementById('join-private-room-btn').addEventListener('click', () => {
            this.showJoinPrivateRoomInput();
        });

        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.joinPrivateRoom();
        });

        document.getElementById('cancel-join-btn').addEventListener('click', () => {
            this.hideJoinPrivateRoomInput();
        });

        document.getElementById('back-to-single-player-btn').addEventListener('click', () => {
            this.backToSinglePlayer();
        });

        // Enter key support for inputs
        document.getElementById('multiplayer-player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.findPublicGame();
            }
        });

        document.getElementById('room-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinPrivateRoom();
            }
        });
    }

    setupLobbyEvents() {
        document.getElementById('toggle-ready-btn').addEventListener('click', () => {
            this.toggleReady();
        });

        document.getElementById('start-multiplayer-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('leave-room-btn').addEventListener('click', () => {
            this.leaveRoom();
        });

        document.getElementById('copy-room-code-btn').addEventListener('click', () => {
            this.copyRoomCode();
        });
    }

    setupConnectionEvents() {
        document.getElementById('cancel-connection-btn').addEventListener('click', () => {
            this.cancelConnection();
        });
    }

    // Screen management
    showMultiplayerMenu() {
        console.log('showMultiplayerMenu called');
        this.hideAllScreens();
        const menuScreen = document.getElementById('multiplayer-menu-screen');
        console.log('multiplayer-menu-screen found:', !!menuScreen);
        if (menuScreen) {
            menuScreen.classList.add('active');
            this.currentScreen = 'menu';
            console.log('Multiplayer menu screen activated');
            console.log('Menu screen classes:', menuScreen.className);
            console.log('Menu screen display:', window.getComputedStyle(menuScreen).display);
            console.log('Menu screen opacity:', window.getComputedStyle(menuScreen).opacity);
            console.log('Menu screen transform:', window.getComputedStyle(menuScreen).transform);
            console.log('Menu screen z-index:', window.getComputedStyle(menuScreen).zIndex);
        } else {
            console.error('multiplayer-menu-screen not found in DOM');
        }
    }

    showLobby(roomInfo) {
        this.hideAllScreens();
        document.getElementById('multiplayer-lobby-screen').classList.add('active');
        this.currentScreen = 'lobby';
        
        // Update lobby info
        document.getElementById('lobby-title').textContent = roomInfo.name || 'Game Lobby';
        document.getElementById('room-players-count').textContent = `${roomInfo.currentPlayers}/${roomInfo.maxPlayers} Players`;
        document.getElementById('room-difficulty').textContent = roomInfo.difficulty.charAt(0).toUpperCase() + roomInfo.difficulty.slice(1);
        
        // Show room code for private rooms
        if (roomInfo.type === 'private' && roomInfo.code) {
            document.getElementById('room-code-display').style.display = 'block';
            document.getElementById('room-code-text').textContent = roomInfo.code;
        } else {
            document.getElementById('room-code-display').style.display = 'none';
        }
    }

    showConnectionScreen(message = 'Connecting to server...') {
        this.hideAllScreens();
        document.getElementById('connection-screen').classList.add('active');
        document.getElementById('connection-message').textContent = message;
        this.currentScreen = 'connecting';
    }

    hideAllScreens() {
        const screens = ['multiplayer-menu-screen', 'multiplayer-lobby-screen', 'connection-screen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('active');
            }
        });
    }

    hideMultiplayerScreens() {
        this.hideAllScreens();
        this.currentScreen = null;
    }

    // Actions
    async findPublicGame() {
        const playerName = document.getElementById('multiplayer-player-name').value.trim();
        if (!playerName) {
            this.showConnectionStatus('Please enter your name', 'error');
            return;
        }

        try {
            this.showConnectionScreen('Connecting to server...');
            
            // Check if server is running first
            const serverRunning = await this.checkServerStatus();
            if (!serverRunning) {
                this.showServerNotRunningMessage();
                return;
            }
            
            await this.client.connect(playerName);
            
            this.showConnectionScreen('Finding public game...');
            this.client.findPublicGame({
                maxPlayers: 6,
                difficulty: 'medium'
            });
        } catch (error) {
            this.showConnectionStatus('Failed to connect: ' + error.message, 'error');
            this.showMultiplayerMenu();
        }
    }

    async createPrivateRoom() {
        const playerName = document.getElementById('multiplayer-player-name').value.trim();
        if (!playerName) {
            this.showConnectionStatus('Please enter your name', 'error');
            return;
        }

        try {
            this.showConnectionScreen('Creating private room...');
            
            // Check if server is running first
            const serverRunning = await this.checkServerStatus();
            if (!serverRunning) {
                this.showServerNotRunningMessage();
                return;
            }
            
            await this.client.connect(playerName);
            
            this.client.createPrivateRoom({
                maxPlayers: 6,
                difficulty: 'medium',
                roomName: `${playerName}'s Room`
            });
        } catch (error) {
            this.showConnectionStatus('Failed to create room: ' + error.message, 'error');
            this.showMultiplayerMenu();
        }
    }

    showJoinPrivateRoomInput() {
        document.getElementById('private-room-section').style.display = 'block';
        document.getElementById('room-code-input').focus();
    }

    hideJoinPrivateRoomInput() {
        document.getElementById('private-room-section').style.display = 'none';
        document.getElementById('room-code-input').value = '';
    }

    async joinPrivateRoom() {
        const playerName = document.getElementById('multiplayer-player-name').value.trim();
        const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
        
        if (!playerName) {
            this.showConnectionStatus('Please enter your name', 'error');
            return;
        }
        
        if (!roomCode) {
            this.showConnectionStatus('Please enter room code', 'error');
            return;
        }

        try {
            this.showConnectionScreen('Joining private room...');
            
            // Check if server is running first
            const serverRunning = await this.checkServerStatus();
            if (!serverRunning) {
                this.showServerNotRunningMessage();
                return;
            }
            
            await this.client.connect(playerName);
            
            this.client.joinPrivateRoom(roomCode);
        } catch (error) {
            this.showConnectionStatus('Failed to join room: ' + error.message, 'error');
            this.showMultiplayerMenu();
        }
    }

    toggleReady() {
        const readyBtn = document.getElementById('toggle-ready-btn');
        const isReady = readyBtn.textContent === 'Ready';
        
        this.client.setPlayerReady(!isReady);
        readyBtn.textContent = isReady ? 'Not Ready' : 'Ready';
        readyBtn.className = isReady ? 'btn primary-btn' : 'btn secondary-btn';
    }

    startGame() {
        this.client.startGame({
            rounds: 3,
            timerEnabled: true,
            timerDuration: 90
        });
    }

    leaveRoom() {
        this.client.leaveRoom();
        this.showMultiplayerMenu();
    }

    cancelConnection() {
        this.client.disconnect();
        this.showMultiplayerMenu();
    }

    backToSinglePlayer() {
        this.hideMultiplayerScreens();
        // Show the original single player setup
        document.getElementById('player-select-screen').classList.add('active');
    }

    copyRoomCode() {
        const roomCode = document.getElementById('room-code-text').textContent;
        navigator.clipboard.writeText(roomCode).then(() => {
            this.showNotification('Room code copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = roomCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Room code copied!');
        });
    }

    // UI Updates
    updatePlayerList(players) {
        const playersList = document.getElementById('lobby-players-list');
        if (!playersList) return;

        playersList.innerHTML = '';
        
        players.forEach(playerId => {
            const player = this.getPlayerById(playerId);
            if (player) {
                const playerElement = document.createElement('div');
                playerElement.className = 'lobby-player';
                playerElement.innerHTML = `
                    <span class="player-name">${player.name}</span>
                    <span class="player-status ${player.isReady ? 'ready' : 'not-ready'}">
                        ${player.isReady ? '✓ Ready' : '⏳ Not Ready'}
                    </span>
                    ${player.isLeader ? '<span class="leader-badge">👑 Leader</span>' : ''}
                `;
                playersList.appendChild(playerElement);
            }
        });
    }

    updatePlayerReadyStatus(data) {
        // Update the player list display
        this.updatePlayerList(data.players);
    }

    showStartGameButton() {
        document.getElementById('start-multiplayer-game-btn').style.display = 'block';
    }

    showConnectionStatus(message, type = 'info') {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `connection-status ${type}`;
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'connection-status';
            }, 5000);
        }
    }

    showNotification(message, duration = 3000) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('multiplayer-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'multiplayer-notification';
            notification.className = 'multiplayer-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    // Game integration
    startMultiplayerGame(gameData) {
        // Hide multiplayer screens and start the game
        this.hideMultiplayerScreens();
        
        // Initialize the game with multiplayer data
        if (window.startMultiplayerGameMode) {
            window.startMultiplayerGameMode(gameData);
        } else {
            console.error('Multiplayer game mode not available');
        }
    }

    handleGameUpdate(data) {
        // Handle real-time game updates
        if (window.handleMultiplayerGameUpdate) {
            window.handleMultiplayerGameUpdate(data);
        }
    }

    // Utility methods
    getPlayerById(playerId) {
        // This would need to be implemented based on how player data is stored
        // For now, return a mock player object
        return {
            id: playerId,
            name: 'Player ' + playerId.substring(0, 6),
            isReady: false,
            isLeader: false
        };
    }

    // Check if server is running
    async checkServerStatus() {
        try {
            const serverUrl = this.client.serverUrl;
            const response = await fetch(`${serverUrl}/health`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            return response.ok;
        } catch (error) {
            console.log('Server not running:', error);
            return false;
        }
    }

    // Show message when server is not running
    showServerNotRunningMessage() {
        this.hideAllScreens();
        
        // Create a custom message screen
        const messageHTML = `
            <div class="server-message-overlay">
                <div class="server-message-card">
                    <h2>🎮 Multiplayer Server Not Running</h2>
                    <p>To play multiplayer, you need to start the game server first.</p>
                    
                    <div class="server-instructions">
                        <h3>How to start the server:</h3>
                        <ol>
                            <li>Open a terminal/command prompt in the game folder</li>
                            <li>Run: <code>node server.js</code></li>
                            <li>Or double-click: <code>start.bat</code></li>
                        </ol>
                        <p class="note">The server will run on <strong>http://localhost:3001</strong></p>
                    </div>
                    
                    <div class="server-message-buttons">
                        <button class="btn primary-btn" id="retry-connection-btn">Retry Connection</button>
                        <button class="btn secondary-btn" id="back-from-server-msg-btn">Back to Menu</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing message if any
        const existingMessage = document.querySelector('.server-message-overlay');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add message to body
        document.body.insertAdjacentHTML('beforeend', messageHTML);
        
        // Add event listeners
        document.getElementById('retry-connection-btn').addEventListener('click', () => {
            document.querySelector('.server-message-overlay').remove();
            this.showMultiplayerMenu();
        });
        
        document.getElementById('back-from-server-msg-btn').addEventListener('click', () => {
            document.querySelector('.server-message-overlay').remove();
            this.showMultiplayerMenu();
        });
    }
}

// Export for use in other files
window.MultiplayerUI = MultiplayerUI;