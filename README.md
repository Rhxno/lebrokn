# Password - Word Party Game with Multiplayer

A fun word guessing party game where teams compete to guess words based on one-word clues. Now featuring both single-player and multiplayer modes with real-time matchmaking!

## Features

### Single Player Mode
- Local multiplayer for 4-10 players
- Three difficulty levels (Easy, Medium, Hard)
- Customizable rounds and timer settings
- Team setup with drag-and-drop player assignment
- Real-time scoring and game log

### Multiplayer Mode
- **Global Matchmaking**: Find public games with players worldwide
- **Private Rooms**: Create private rooms and share room codes with friends
- **Real-time Gameplay**: Synchronized game state across all players
- **Automatic Team Assignment**: Server handles team balancing
- **Cross-platform**: Play on any device with a web browser

## Quick Start

### For Players (Client Only)
1. Open `index.html` in your web browser
2. Choose between Single Player or Multiplayer mode
3. For multiplayer, enter your name and either:
   - Click "Find Public Game" to join a random game
   - Click "Create Private Room" to create a room for friends
   - Click "Join Private Room" and enter a room code

### For Developers (Full Setup)

#### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

#### Server Setup
1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. The server will start on port 3001 by default
5. Open `index.html` in your browser or serve it from a local web server

#### Production Deployment
1. Set environment variables:
   ```bash
   export NODE_ENV=production
   export PORT=3001
   ```

2. Update the client-side server URL in `multiplayerClient.js`:
   ```javascript
   this.serverUrl = 'https://your-domain.com';
   ```

3. Deploy to your preferred hosting service (Heroku, Railway, DigitalOcean, etc.)

## Game Rules

### Objective
Teams take turns giving one-word clues to help their teammates guess the target word. The team with the most correct guesses wins!

### How to Play
1. **Setup**: Players are divided into two teams
2. **Rounds**: Each round, teams alternate giving clues
3. **Clue Giving**: One player gives a one-word clue for the target word
4. **Guessing**: The team has limited time to guess the word
5. **Scoring**: Correct guesses earn points for the team
6. **Winning**: The team with the most points after all rounds wins

### Multiplayer Features
- **Room Codes**: Private rooms generate 6-character codes (e.g., "ABC123")
- **Ready System**: All players must mark themselves as ready before starting
- **Leader Controls**: Room creators can start the game
- **Real-time Updates**: All game actions are synchronized across players
- **Automatic Cleanup**: Inactive rooms and players are automatically removed

## Technical Architecture

### Backend (Node.js + Socket.IO)
- **Express Server**: RESTful API and static file serving
- **Socket.IO**: Real-time WebSocket communication
- **Game Manager**: Handles room creation, player management, and game logic
- **Automatic Cleanup**: Removes inactive players and rooms

### Frontend (Vanilla JavaScript)
- **Multiplayer Client**: Handles server communication
- **Multiplayer UI**: Manages matchmaking and lobby interfaces
- **Game Integration**: Seamlessly integrates with existing single-player game

### Key Components
- `server.js`: Main server application
- `gameManager.js`: Core game logic and room management
- `multiplayerClient.js`: Client-side multiplayer functionality
- `multiplayerUI.js`: Multiplayer user interface components
- `script.js`: Main game logic (enhanced with multiplayer support)

## API Endpoints

### REST API
- `GET /health`: Server health check
- `GET /api/stats`: Server statistics

### WebSocket Events
- `player_join`: Join as a player
- `find_public_game`: Find or create public room
- `create_private_room`: Create private room
- `join_private_room`: Join room with code
- `player_ready`: Set ready status
- `start_game`: Start the game
- `game_action`: Send game actions (clues, guesses, etc.)

## Configuration

### Server Configuration
```javascript
// In gameManager.js
this.config = {
    maxPlayersPerRoom: 10,
    minPlayersToStart: 4,
    roomCodeLength: 6,
    maxRooms: 1000,
    playerTimeout: 300000, // 5 minutes
    gameTimeout: 1800000   // 30 minutes
};
```

### Client Configuration
```javascript
// In multiplayerClient.js
this.serverUrl = 'http://localhost:3001'; // Development
// this.serverUrl = 'https://your-domain.com'; // Production
```

## Security Features
- **Helmet.js**: Security headers
- **CORS**: Cross-origin request protection
- **Input Validation**: Server-side validation of all inputs
- **Rate Limiting**: Prevents spam and abuse
- **Automatic Cleanup**: Prevents resource exhaustion

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check if server is running on correct port
2. **Room Not Found**: Verify room code is correct and room still exists
3. **Game Won't Start**: Ensure minimum 4 players and all are ready
4. **Audio Issues**: Check browser audio permissions

### Development Tips
- Use browser developer tools to monitor WebSocket connections
- Check server logs for detailed error information
- Test with multiple browser tabs to simulate multiple players

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - feel free to use and modify for your projects!

## Support
For issues or questions, please create an issue in the repository or contact the development team.

---

**Have fun playing Password with friends around the world! 🎉**