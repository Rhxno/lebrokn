// script.js
let players = {
    available: [], // Start with empty array
    team1: [],
    team2: [],
    team1Leader: null,
    team2Leader: null
};

let currentWord = '';
let currentTeam = 1;
let currentGuesser = null;
let gameLog = [];
let totalRounds = 5;
let currentRound = 0;
let numberOfPlayers = 0; // To store selected number of players
let gameDifficulty = 'easy'; // Default difficulty
let isWordVisible = true; // Track word visibility state
let gameStarted = false; // Track if the game has started
let pendingSwitch = null; // Track the pending switch action
let maxTeamSize = 0; // Declare maxTeamSize globally
let currentPlayerIndex = { 1: 0, 2: 0 }; // Track current player index for each team

// Drag and Drop State
let draggedItem = null;
let originalParent = null;
let originalNextSibling = null;
let offsetX = 0;
let offsetY = 0;

// --- Speech Recognition Variables ---
let recognition = null;
let targetInput = null;
let activeMicButton = null;

// --- Word Lists ---
const easyWords = [
    "SUN", "MOON", "STAR", "SKY", "CLOUD", "RAIN", "SNOW", "WIND", "TREE", "FLOWER",
    "LEAF", "ROOT", "PLANT", "GRASS", "BIRD", "FISH", "CAT", "DOG", "HORSE", "COW",
    "PIG", "SHEEP", "CHICKEN", "DUCK", "MOUSE", "RAT", "LION", "TIGER", "BEAR", "WOLF",
    "FOX", "DEER", "MONKEY", "ELEPHANT", "GIRAFFE", "ZEBRA", "BOAT", "CAR", "BUS", "TRAIN",
    "PLANE", "BIKE", "DOOR", "WINDOW", "HOUSE", "ROOM", "WALL", "FLOOR", "ROOF", "CHAIR",
    "TABLE", "BED", "SOFA", "PHONE", "BOOK", "PEN", "PENCIL", "PAPER", "COMPUTER", "SCREEN",
    "KEY", "LOCK", "CLOCK", "SHOE", "SHIRT", "PANTS", "HAT", "COAT", "DRESS", "SKIRT",
    "FOOD", "WATER", "MILK", "BREAD", "MEAT", "FISH", "RICE", "FRUIT", "APPLE", "BANANA",
    "ORANGE", "GRAPE", "LEMON", "PEAR", "KNIFE", "FORK", "SPOON", "PLATE", "CUP", "GLASS",
    "BOX", "BALL", "TOY", "GAME", "MUSIC", "SONG", "DANCE", "SMILE", "LAUGH", "CRY", "HAPPY",
    "SAD", "ANGRY", "COLD", "HOT", "WARM", "FAST", "SLOW", "BIG", "SMALL", "LONG", "SHORT",
    "UP", "DOWN", "LEFT", "RIGHT", "FRONT", "BACK", "GOOD", "BAD", "EASY", "HARD", "YES", "NO",
    "ONE", "TWO", "THREE", "DAY", "NIGHT", "TIME", "YEAR", "MONTH", "WEEK", "HOUR", "MINUTE",
    "SECOND", "LIFE", "WORLD", "PEOPLE", "FAMILY", "FRIEND", "WORK", "SCHOOL", "CITY", "COUNTRY",
    "STREET", "ROAD", "PARK", "STORE", "OFFICE", "BEACH", "MOUNTAIN", "RIVER", "LAKE", "OCEAN"
];

const mediumWords = [
    "ADVENTURE", "AMBITION", "BALANCE", "BELIEVE", "BRAVERY", "CAPTURE", "CHALLENGE", "CONFIDENT", "CREATE",
    "DAZZLE", "DEDICATION", "DELIGHT", "DETERMINE", "DISCOVER", "ELEGANT", "EMBRACE", "ENCOURAGE", "ENTHUSIASM", "EXPLORE",
    "FASCINATE", "FLOURISH", "FOCUS", "FREEDOM", "GENERATE", "GENEROSITY", "GRATITUDE", "GUIDE", "HARMONIOUS", "HOPEFUL",
    "HUMILITY", "IMAGINE", "INNOVATION", "INSPIRE", "INTEGRITY", "JOURNEY", "JUSTICE", "KEEN", "KNOWLEDGE", "LEADERSHIP",
    "LEGACY", "LIVELY", "MAGNIFICENT", "MOTIVATION", "MYSTERY", "NAVIGATE", "NOBLE", "NOURISH", "OPPORTUNITY", "OPTIMISM",
    "ORGANIZE", "OUTSTANDING", "PARTICIPATE", "PASSION", "PEACEFUL", "PERSEVERANCE", "PERSUADE", "PLAN", "POWERFUL", "QUESTION",
    "QUIET", "QUIRKY", "RADIANT", "REASON", "RECOGNIZE", "RELIABLE", "REMARKABLE", "SACRIFICE", "SERENITY", "SIMPLIFY",
    "SOLVE", "SPLENDID", "STRATEGIZE", "SUPPORT", "TENACITY", "THOUGHTFUL", "TRANSFORM", "TREASURE", "UNDERSTAND", "UNITY",
    "UPBEAT", "UTILIZE", "VALUABLE", "VERIFY", "VIBRANT", "VISIONARY", "WISDOM", "WONDERFUL", "XENIAL", "YOUTHFUL", "ZEALOUS",
    "ACHIEVEMENT", "ADAPT", "ACTIVATE", "ADMIRE", "ANALYZE", "APPRECIATE", "ASSEMBLE", "BENEFIT", "BUILD", "CALCULATE", "CHERISH",
    "COMPOSE", "CONNECT", "CONSIDER", "DEFINE", "DESIGN", "DEVELOP", "DREAM", "EMPATHIZE", "ESTABLISH", "EVALUATE", "EXAMINE",
    "FACILITATE", "FORMULATE", "GENERATE", "GLOWING", "HEARTFELT", "HYPOTHESIZE", "IDEALISTIC", "IMPLEMENT", "INTERPRET", "JOVIAL", "JUDGE",
    "JUSTIFY", "LEARN", "MEASURE", "MENTOR", "MODIFY", "NEGOTIATE", "OBSERVE", "OVERCOME", "PAINT", "PERFORM", "PRACTICE",
    "PREPARE", "PROMOTE", "PROVIDE", "REFLECT", "RESEARCH", "REVIEW", "SCHEDULE", "SHARE", "SING", "STUDY", "SUCCEED", "TEACH",
    "TEST", "TRAIN", "WRITE", "ZAPPY"
];

const hardWords = [
    "ABSTRUSE", "ADVERSITY", "AMBIVALENT", "ANACHRONISM", "APATHETIC", "ARBITRARY", "BENIGN", "BUREAUCRACY", "CATALYST", "COGNIZANT",
    "COMPLACENT", "CONDESCENDING", "CONJECTURE", "CONVOLUTED", "CRYPTIC", "CYNICAL", "DEBACLE", "DEFERENCE", "DELINEATE", "DERIVATIVE",
    "DESPONDENT", "DIALECTIC", "DIDACTIC", "DISPARITY", "DOGMATIC", "EBULLIENT", "ECCENTRIC", "ECLECTIC", "EFFEMINATE", "ELUSIVE",
    "EMBEZZLE", "EMINENT", "EMPATHY", "ENIGMATIC", "EPHEMERAL", "EQUANIMITY", "ERUDITE", "ESCHEW", "EUPHEMISM", "EVANESCENT",
    "EXACERBATE", "EXEMPLARY", "EXPLICIT", "EXTRAPOLATE", "FASTIDIOUS", "FECUND", "FORTUITOUS", "FRUGAL", "FULMINATE", "GARRULOUS",
    "GERMANE", "GRANDILOQUENT", "GREGARIOUS", "HAPLESS", "HEDONISTIC", "HEGEMONY", "HETERODOX", "HYPERBOLE", "IDIOSYNCRASY", "IMPASSE",
    "IMPECUNIOUS", "IMPERIOUS", "IMPERTINENT", "IMPLACABLE", "IMPUGN", "INANE", "INCIPIENT", "INCISIVE", "INDEFATIGABLE", "INDIGENOUS",
    "INDOLENT", "INEFFABLE", "INEXORABLE", "INSIDIOUS", "INSIPID", "INSOLENT", "INTREPID", "INVETERATE", "IRASCIBLE", "IRREVERENT",
    "ITINERANT", "JOCULAR", "JUDICIOUS", "LAConic", "LANGUID", "LARGESSE", "LATENT", "LETHARGIC", "LIBERAL", "LIMPID", "LOQUACIOUS",
    "LUCID", "LUGUBRIOUS", "MAGNANIMOUS", "MALADROIT", "MALEVOLENT", "MARTINET", "MAUDLIN", "MELLIFLUOUS", "MENDACIOUS", "MERCURIAL",
    "METICULOUS", "MISANTHROPE", "MITIGATE", "MNEMONIC", "MOROSE", "MYOPIC", "NEBULOUS", "NEFARIOUS", "NEXUS", "NOISOME", "NONPLUSSED",
    "OBDURATE", "OBFUSCATE", "OBSEQUIOUS", "OBSTREPEROUS", "OMNIPOTENT", "ONEROUS", "OPPORTUNE", "OSCILLATE", "OSTENSIBLE", "OSTRACIZE",
    "PALATABLE", "PALLIATIVE", "PALPABLE", "PANDEMONIUM", "PARADIGM", "PARADOX", "PARSIMONIOUS", "PATHOS", "PAUCITY", "PEDANTIC",
    "PELLUCID", "PENCHANT", "PERFIDIOUS", "PERFUNCTORY", "PERIPATETIC", "PERNICIOUS", "PERSPICACITY", "PETULANT", "PHILANTHROPY", "PHLEGMATIC",
    "PLACID", "PLAUDIT", "PLETHORA", "POLEMICAL", "PONTIFICATE", "PORTENTOUS", "PRAGMATIC", "PRECIPITOUS", "PRECLUDE", "PREDILECTION",
    "PREEMINENT", "PRESCIENT", "PREVARICATE", "PROCLIVITY", "PRODIGAL", "PROGNOSIS", "PROLIFIC", "PROPENSITY", "PROSAIC", "PROSTRATE",
    "PROVINCIAL", "PUERILE", "PUGNACIOUS", "PULCHRITUDE", "PUNGENT", "PUSILLANIMOUS", "QUIESCENCE", "QUIXOTIC", "QUOTIDIAN", "RAMBUNCTIOUS",
    "RECALCITRANT", "RECONDITE", "RECRUIT", "REDOLENT", "REFRACTORY", "RELEGATE", "REMUNERATION", "REPROBATE", "REPUGNANT", "RESILIENT",
    "RESONANCE", "REVERENCE", "RHETORIC", "ROBUST", "RUSTIC", "SACROSANCT", "SAGACIOUS", "SALACIOUS", "SALIENT", "SANCTIMONIOUS",
    "SANGUINE", "SARDONIC", "SATURNINE", "SATIATE", "SCINTILLA", "SCURRILOUS", "SEDULOUS", "SEMINAL", "SENTIENT", "SERAPHIC",
    "SERENDIPITY", "SERRATED", "SESQUIPEDALIAN", "SIMULACRUM", "SINECURE", "SINUOUS", "SOPORIFIC", "SPARTAN", "SPURIOUS", "SQUALID",
    "STOIC", "STRATAGEM", "STRIATED", "SUCCINCT", "SUPERSEDE", "SUPPLANT", "SURREPTITIOUS", "TACITURN", "TENACIOUS", "TENET",
    "TENUOUS", "TERSE", "TRACTABLE", "TRANSIENT", "TREMULOUS", "TRUCULENT", "TURBID", "TURGID", "TURPITUDE", "UBIQUITOUS",
    "UMBRAGE", "UNCTUOUS", "UNDULATING", "UNGAINLY", "UNREMITTING", "UNSCRUPULOUS", "UNWARRANTED", "VACILLATE", "VACUOUS", "VAGARY",
    "VAPID", "VARIEGATED", "VEHEMENT", "VENAL", "VERACIOUS", "VERBOSE", "VEX", "VILIFY", "VIRULENT", "VITUPERATIVE", "VOLUBLE",
    "VORACIOUS", "WAINSCOTING", "WANTON", "WARY", "WAXING", "WINSOME", "WRETCHED", "XANTHIC", "XENOPHOBIA", "YCLEPT", "YEN", "YIELDING",
    "ZEALOTRY", "ZEITGEIST", "ZENITH", "ZEPHYR", "ZYMURGY"
];

// --- Utility Functions ---
function getRandomWord() {
    let wordList;
    switch (gameDifficulty) {
        case 'easy':
            wordList = easyWords;
            break;
        case 'medium':
            wordList = mediumWords;
            break;
        case 'hard':
            wordList = hardWords;
            break;
        default:
            wordList = easyWords;
    }
    return wordList[Math.floor(Math.random() * wordList.length)];
}

async function fetchRandomWord() {
    return Promise.resolve(getRandomWord());
}

// --- Speech Recognition ---
function initializeSpeechRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
        console.warn("Speech Recognition API not supported in this browser.");
        document.querySelectorAll('.mic-btn').forEach(btn => {
            btn.disabled = true;
            btn.title = "Speech recognition not supported";
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
        });
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        if (targetInput) {
            targetInput.value = speechResult.trim();
        }
    };

    recognition.onerror = (event) => {
        let errorMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') {
            errorMsg = "Microphone access denied. Please allow microphone access in your browser settings.";
        } else if (event.error === 'no-speech') {
            errorMsg = "No speech detected. Please try again.";
        }
        showErrorModal(errorMsg);
        stopListeningUIUpdate();
    };

    recognition.onend = () => {
        stopListeningUIUpdate();
    };

    document.querySelectorAll('.mic-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (!recognition) {
                showErrorModal("Speech recognition is not initialized or supported.");
                return;
            }
            const teamNumber = parseInt(button.dataset.team);
            if (gameStarted && teamNumber !== currentTeam) {
                showErrorModal(`It's not Team ${teamNumber}'s turn!`);
                return;
            }
            targetInput = document.getElementById(`team${teamNumber}-word-log`);
            activeMicButton = button;
            if (targetInput) {
                try {
                    startListeningUIUpdate();
                    recognition.start();
                } catch (error) {
                    showErrorModal("Could not start speech recognition. Is it already running?");
                    stopListeningUIUpdate();
                }
            }
        });
    });
}

function startListeningUIUpdate() {
    if (activeMicButton) {
        activeMicButton.classList.add('listening');
        activeMicButton.disabled = true;
    }
}

function stopListeningUIUpdate() {
    if (activeMicButton) {
        activeMicButton.classList.remove('listening');
        activeMicButton.disabled = false;
        activeMicButton = null;
    }
    targetInput = null;
}

// --- Player Management ---
function addPlayer() {
    if (gameStarted) {
        showErrorModal('Cannot add players after the game has started!');
        return;
    }

    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput.value.trim();

    if (!playerName) return;

    const nameExists = players.available.includes(playerName) ||
                      players.team1.includes(playerName) ||
                      players.team2.includes(playerName) ||
                      players.team1Leader === playerName ||
                      players.team2Leader === playerName;

    if (nameExists) {
        showErrorModal('A player with this name already exists!');
        return;
    }

    if (players.available.length >= numberOfPlayers) {
        showErrorModal(`You can only add ${numberOfPlayers} players!`);
        return;
    }

    players.available.push(playerName);
    playerNameInput.value = '';
    updateAvailablePlayersDisplay();
}

function removePlayerFromAllGroups(playerName) {
    players.available = players.available.filter(p => p !== playerName);
    players.team1 = players.team1.filter(p => p !== playerName);
    players.team2 = players.team2.filter(p => p !== playerName);

    if (players.team1Leader === playerName) players.team1Leader = null;
    if (players.team2Leader === playerName) players.team2Leader = null;
}

function getPlayerCurrentTeam(playerName) {
    if (players.team1Leader === playerName || players.team1.includes(playerName)) return 1;
    if (players.team2Leader === playerName || players.team2.includes(playerName)) return 2;
    return null;
}

// --- UI Updates ---
function updateAvailablePlayersDisplay() {
    const availablePlayersDiv = document.getElementById('available-players');
    availablePlayersDiv.innerHTML = '';
    players.available.forEach(playerName => {
        const playerElement = createPlayerElement(playerName);
        availablePlayersDiv.appendChild(playerElement);
    });
}

function updateTeamPlayersDisplay() {
    const team1PlayersContainer = document.getElementById('team1-players');
    team1PlayersContainer.innerHTML = '';
    players.team1.forEach(playerName => {
        team1PlayersContainer.appendChild(createPlayerElement(playerName));
    });

    const team2PlayersContainer = document.getElementById('team2-players');
    team2PlayersContainer.innerHTML = '';
    players.team2.forEach(playerName => {
        team2PlayersContainer.appendChild(createPlayerElement(playerName));
    });

    const team1LeaderContainer = document.getElementById('team1-leader');
    team1LeaderContainer.innerHTML = '';
    if (players.team1Leader) {
        team1LeaderContainer.appendChild(createPlayerElement(players.team1Leader, true));
    }

    const team2LeaderContainer = document.getElementById('team2-leader');
    team2LeaderContainer.innerHTML = '';
    if (players.team2Leader) {
        team2LeaderContainer.appendChild(createPlayerElement(players.team2Leader, true));
    }
}

// --- Drag and Drop (Unaltered as requested) ---
function allowDrop(event) {
    event.preventDefault();
}

function handleTouchStart(event) {
    if (gameStarted) return;
    event.preventDefault();
    draggedItem = event.target;
    originalParent = draggedItem.parentNode;
    originalNextSibling = draggedItem.nextSibling;
    const touch = event.touches[0];
    const rect = draggedItem.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const elementPageX = rect.left + scrollX;
    const elementPageY = rect.top + scrollY;
    offsetX = touch.pageX - elementPageX;
    offsetY = touch.pageY - elementPageY;
    draggedItem.classList.add('dragging');
    draggedItem.style.position = 'fixed';
    draggedItem.style.zIndex = '1000';
    requestAnimationFrame(() => {
        if (!draggedItem) return;
        const initialX = touch.pageX - offsetX - window.pageXOffset;
        const initialY = touch.pageY - offsetY - window.pageYOffset;
        draggedItem.style.left = `${initialX}px`;
        draggedItem.style.top = `${initialY}px`;
    });
}

function handleTouchMove(event) {
    if (!draggedItem || gameStarted) return;
    event.preventDefault();
    const touch = event.touches[0];
    const x = touch.pageX - offsetX - window.pageXOffset;
    const y = touch.pageY - offsetY - window.pageYOffset;
    draggedItem.style.left = `${x}px`;
    draggedItem.style.top = `${y}px`;
    removeDropTargetHighlight();
    draggedItem.style.visibility = 'hidden';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    draggedItem.style.visibility = 'visible';
    if (elementBelow) {
        const dropTarget = elementBelow.closest('.players-list, .leader-slot, #available-players');
        if (dropTarget && dropTarget !== originalParent) {
            dropTarget.classList.add('drag-over');
        }
    }
}

function resetDraggedItem() {
    if (draggedItem && originalParent) {
        draggedItem.style.position = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem.style.zIndex = '';
        draggedItem.classList.remove('dragging');
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
            originalParent.insertBefore(draggedItem, originalNextSibling);
        } else {
            originalParent.appendChild(draggedItem);
        }
    }
    draggedItem = null;
    originalParent = null;
    originalNextSibling = null;
    removeDropTargetHighlight();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.textContent);
}

function drop(ev) {
    ev.preventDefault();
    if (gameStarted) return;
    const playerName = ev.dataTransfer.getData("text");
    const teamElement = ev.target.closest('.team');
    const teamId = teamElement ? teamElement.id : null;
    if (teamId === 'team1' || teamId === 'team2') {
        const team = teamId === 'team1' ? 'team1' : 'team2';
        if (players[team].length >= maxTeamSize) {
            showErrorModal(`Team ${teamId} is already full (max ${maxTeamSize} players)!`);
            return;
        }
        showConfirmationDialog(`Are you sure you want to move ${playerName} to ${team}?`, () => {
            removePlayerFromAllGroups(playerName);
            players[team].push(playerName);
            updateTeamPlayersDisplay();
            updateAvailablePlayersDisplay();
        });
    }
}

function handleTeamDrop(event, teamNumber, isLeaderSlot) {
    event.preventDefault();
    if (gameStarted) return false;
    const playerName = event.dataTransfer.getData("text/plain");
    if (!playerName) return false;

    const team = `team${teamNumber}`;
    const currentTeamOfPlayer = getPlayerCurrentTeam(playerName);

    if (isLeaderSlot) {
        const existingLeader = teamNumber === 1 ? players.team1Leader : players.team2Leader;
        if (existingLeader === playerName) return false;

        if (existingLeader) {
            showConfirmationDialog(`Switch positions between ${existingLeader} (Leader) and ${playerName}?`, () => {
                removePlayerFromAllGroups(playerName);
                removePlayerFromAllGroups(existingLeader);
                if (teamNumber === 1) players.team1Leader = playerName;
                else players.team2Leader = playerName;
                if (currentTeamOfPlayer === 1) players.team1.push(existingLeader);
                else if (currentTeamOfPlayer === 2) players.team2.push(existingLeader);
                else players.available.push(existingLeader);
                updateTeamPlayersDisplay();
                updateAvailablePlayersDisplay();
            }, resetDraggedItem);
        } else {
            if (players[team].length + (players[`team${teamNumber}Leader`] ? 0 : 1) > maxTeamSize) {
                showErrorModal(`Team ${teamNumber} is already full (max ${maxTeamSize} players)!`);
                return false;
            }
            showConfirmationDialog(`Make ${playerName} the leader of Team ${teamNumber}?`, () => {
                removePlayerFromAllGroups(playerName);
                if (teamNumber === 1) players.team1Leader = playerName;
                else players.team2Leader = playerName;
                updateTeamPlayersDisplay();
                updateAvailablePlayersDisplay();
            }, resetDraggedItem);
        }
    } else {
        if (currentTeamOfPlayer === teamNumber) return false;
        if (players[team].length + (players[`team${teamNumber}Leader`] ? 1 : 0) >= maxTeamSize) {
            showErrorModal(`Team ${teamNumber} is already full (max ${maxTeamSize} players)!`);
            return false;
        }
        showConfirmationDialog(`Move ${playerName} to Team ${teamNumber}?`, () => {
            removePlayerFromAllGroups(playerName);
            players[team].push(playerName);
            updateTeamPlayersDisplay();
            updateAvailablePlayersDisplay();
        }, resetDraggedItem);
    }
    return true;
}

function createPlayerElement(playerName, isLeader = false) {
    const playerElement = document.createElement('div');
    playerElement.className = isLeader ? 'player leader locked' : 'player';
    playerElement.draggable = !gameStarted && !isLeader;
    playerElement.textContent = playerName;

    if (!isLeader) {
        playerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        playerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        playerElement.addEventListener('touchend', function(e) {
            if (!draggedItem || gameStarted) return;
            e.preventDefault();
            removeDropTargetHighlight();
            const touch = e.changedTouches[0];
            const dropTargetElement = document.elementFromPoint(touch.clientX, touch.clientY);
            let droppedInValidZone = false;
            let requiresConfirmation = false;
            if (dropTargetElement) {
                const teamContainer = dropTargetElement.closest('.team');
                const leaderSlot = dropTargetElement.closest('.leader-slot');
                const playersList = dropTargetElement.closest('.players-list');
                const availablePlayersContainer = dropTargetElement.closest('#available-players');
                if ((leaderSlot || playersList) && !(playersList === originalParent || leaderSlot === originalParent)) {
                    const targetTeamNumber = teamContainer ? parseInt(teamContainer.id.replace('team', '')) : null;
                    if (targetTeamNumber) {
                        droppedInValidZone = true;
                        const simulatedEvent = {
                            preventDefault: () => {},
                            dataTransfer: { getData: (format) => (format === "text/plain" ? draggedItem.textContent : null) },
                            target: dropTargetElement
                        };
                        requiresConfirmation = handleTeamDrop(simulatedEvent, targetTeamNumber, !!leaderSlot);
                    }
                } else if (availablePlayersContainer && originalParent !== availablePlayersContainer) {
                    droppedInValidZone = true;
                    requiresConfirmation = true;
                    showConfirmationDialog(`Move ${draggedItem.textContent} back to Available Players?`, () => {
                        removePlayerFromAllGroups(draggedItem.textContent);
                        players.available.push(draggedItem.textContent);
                        updateTeamPlayersDisplay();
                        updateAvailablePlayersDisplay();
                    }, resetDraggedItem);
                }
            }
            if (!droppedInValidZone || !requiresConfirmation) {
                resetDraggedItem();
            }
        }, { passive: false });
        playerElement.addEventListener('dragstart', drag);
    }
    return playerElement;
}

function removeDropTargetHighlight() {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

// --- Confirmation Dialog ---
function showConfirmationDialog(message, onConfirmCallback, onCancelCallback = resetDraggedItem) {
    const dialog = document.getElementById('confirmation-dialog');
    const messageElement = document.getElementById('confirmation-message');
    messageElement.textContent = message;
    dialog.style.display = 'flex';
    dialog.classList.add('show');
    pendingSwitch = { onConfirm: onConfirmCallback, onCancel: onCancelCallback };
}

function confirmSwitch(confirm) {
    const dialog = document.getElementById('confirmation-dialog');
    dialog.classList.remove('show');
    setTimeout(() => {
        dialog.style.display = 'none';
        if (confirm && pendingSwitch?.onConfirm) {
            pendingSwitch.onConfirm();
        } else if (!confirm && pendingSwitch?.onCancel) {
            pendingSwitch.onCancel();
        }
        pendingSwitch = null;
    }, 300);
}

// --- Game Logic ---
async function startGame() {
    if (!players.team1Leader || !players.team2Leader) {
        showErrorModal('Each team needs a leader!');
        return;
    }
    if (players.team1.length === 0 || players.team2.length === 0) {
        showErrorModal('Each team needs at least one player!');
        return;
    }

    if (!currentWord) {
        await generateNewWord();
        if (!currentWord) {
            showErrorModal('Failed to generate a word to start the game.');
            return;
        }
    }

    gameStarted = true;
    document.querySelectorAll('.player').forEach(p => p.draggable = false);
    document.querySelector('.word-controls button:first-child').disabled = true;
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('referee-controls').style.display = 'block';
    document.querySelector('.game-setup').style.display = 'none';
    document.querySelector('.setup-section').style.display = 'none';

    currentRound = 1;
    gameLog = [];
    
    // Initialize turn by setting the team before the first turn and indices to -1
    currentTeam = 2; 
    currentPlayerIndex = { 1: -1, 2: -1 };

    // Start the first turn
    switchTeams();
}

async function generateNewWord() {
    try {
        currentWord = await fetchRandomWord();
        const wordElement = document.getElementById('current-word');
        const toggleButton = document.getElementById('toggle-word-btn');
        if (wordElement && currentWord) {
            wordElement.textContent = currentWord;
            isWordVisible = true;
            wordElement.classList.remove('hidden');
            toggleButton.textContent = 'Hide Word';
        }
    } catch (error) {
        console.error('Error generating word:', error);
        showErrorModal('Could not fetch a new word. Please check your connection or try again.');
    }
}

function toggleWordVisibility() {
    if (!currentWord) return;
    const wordElement = document.getElementById('current-word');
    const toggleButton = document.getElementById('toggle-word-btn');
    
    isWordVisible = !isWordVisible;
    wordElement.classList.toggle('hidden');
    
    toggleButton.textContent = isWordVisible ? 'Hide Word' : 'Show Word';
}

function switchTeams() {
    // Switch to the next team
    currentTeam = currentTeam === 1 ? 2 : 1;
    
    const teamPlayers = players[`team${currentTeam}`];
    if (teamPlayers.length > 0) {
        // Cycle to the next player on that team
        currentPlayerIndex[currentTeam] = (currentPlayerIndex[currentTeam] + 1) % teamPlayers.length;
        currentGuesser = teamPlayers[currentPlayerIndex[currentTeam]];
    } else {
        // If a team has no regular players, the leader is the guesser
        currentGuesser = players[`team${currentTeam}Leader`];
    }

    showTurnOverlay();
    highlightCurrentTeam();
    updateActiveTeamLog();
}

function highlightCurrentTeam() {
    document.querySelectorAll('.team').forEach(team => {
        team.classList.remove('active');
        if (team.id === `team${currentTeam}`) {
            team.classList.add('active');
        }
    });
}

function showTurnOverlay() {
    const overlay = document.getElementById('turn-overlay');
    const playerNameDisplay = document.getElementById('turn-player-name');
    const teamIndicatorDisplay = document.getElementById('turn-team-indicator');
    const currentTeamName = `Team ${currentTeam}`;
    const teamColor = currentTeam === 1 ? 'var(--team1-color)' : 'var(--team2-color)';

    playerNameDisplay.textContent = `${currentGuesser}'s Turn!`;
    teamIndicatorDisplay.textContent = currentTeamName;
    playerNameDisplay.style.color = teamColor;

    overlay.classList.add('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2500);
}

function updateActiveTeamLog() {
    document.querySelectorAll('.team-log').forEach((log, index) => {
        const isActive = (index + 1) === currentTeam;
        log.style.display = isActive ? 'block' : 'none';
        if(isActive) log.classList.add('active');
        else log.classList.remove('active');
    });
}

function logWord(teamNumber) {
    if (teamNumber !== currentTeam) {
        showErrorModal(`It's not Team ${teamNumber}'s turn!`);
        return;
    }

    const wordLogInput = document.getElementById(`team${teamNumber}-word-log`);
    const word = wordLogInput.value.trim().toUpperCase();
    if (word === '') return;

    const playerName = currentGuesser;
    gameLog.push({
        player: playerName,
        word: word,
        team: teamNumber,
        timestamp: new Date(),
        type: word === currentWord ? 'correct-guess' : 'wrong-guess'
    });

    const wordDisplay = document.getElementById(`team${teamNumber}-word-display`);
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    const messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    messageSpan.textContent = `${playerName}: ${word}`;
    const timeSpan = document.createElement('span');
    timeSpan.className = 'timestamp';
    timeSpan.textContent = formatTime(new Date());
    logEntry.appendChild(messageSpan);
    logEntry.appendChild(timeSpan);
    wordDisplay.appendChild(logEntry);
    wordDisplay.scrollTop = wordDisplay.scrollHeight;
    wordLogInput.value = '';

    if (word === currentWord) {
        showErrorModal(`Team ${teamNumber} guessed the password! Round ${currentRound} win!`, true);
        endRound();
        return;
    }

    // On wrong guess, switch to the next team and player
    switchTeams();
}

function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

async function endRound() {
    currentRound++;
    if (currentRound > totalRounds) {
        setTimeout(endGame, 2000);
    } else {
        setTimeout(async () => {
            await generateNewWord();
            // The team that lost the previous round starts the next round.
            switchTeams(); 
        }, 2000);
    }
}

function endGame() {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.classList.add('show');
    document.getElementById('referee-controls').style.display = 'none';

    const correctGuesses = gameLog.filter(entry => entry.type === 'correct-guess');
    document.getElementById('guess-results').innerHTML = correctGuesses.map(guess => `
        <div class="result-item">
            <span>${guess.player} (Team ${guess.team})</span>
            <span>${guess.word}</span>
        </div>
    `).join('') || "<p>No correct guesses were made.</p>";
    
    document.getElementById('hint-results').innerHTML = "<p>Hint effectiveness tracking is not available.</p>";

    const team1Score = correctGuesses.filter(g => g.team === 1).length;
    const team2Score = correctGuesses.filter(g => g.team === 2).length;
    let finalMessage = `Game Over!<br>Team 1: ${team1Score} | Team 2: ${team2Score}<br>`;
    if (team1Score > team2Score) {
        finalMessage += `<span class="final-score">Team 1 Wins!</span>`;
    } else if (team2Score > team1Score) {
        finalMessage += `<span class="final-score">Team 2 Wins!</span>`;
    } else {
        finalMessage += `<span class="final-score">It's a Tie!</span>`;
    }
    showErrorModal(finalMessage, true);
}

// --- Screen Transitions ---
function switchScreen(hideScreenId, showScreenId) {
    const hideScreen = document.getElementById(hideScreenId);
    const showScreen = document.getElementById(showScreenId);

    if (hideScreen) {
        hideScreen.classList.remove('active');
    }
    if (showScreen) {
        showScreen.classList.add('active');
    }
}

function selectPlayerCount(count) {
    numberOfPlayers = count;
    maxTeamSize = Math.ceil(numberOfPlayers / 2);
    switchScreen('player-select-screen', 'difficulty-select-screen');
}

function selectDifficulty(difficulty) {
    gameDifficulty = difficulty;
    switchScreen('difficulty-select-screen', 'round-select-screen');
}

function selectRounds(rounds) {
    totalRounds = rounds;
    const roundsInput = document.getElementById('rounds');
    if (roundsInput) roundsInput.value = rounds;
    
    switchScreen('round-select-screen', 'game-container');
    
    // Show relevant game sections
    document.getElementById('game-container').style.display = 'block';
    document.querySelector('.game-setup').style.display = 'block';
    document.querySelector('.setup-section').style.display = 'block';
    document.querySelector('.game-controls').style.display = 'block';
    document.querySelector('.word-section').style.display = 'block';

    if (!currentWord) {
        generateNewWord();
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .btn, .team').forEach(el => {
        observer.observe(el);
    });

    const playerSlider = document.getElementById('player-slider-input');
    const sliderValueDisplay = document.getElementById('slider-value');
    const confirmPlayerCountBtn = document.getElementById('confirm-player-count-btn');

    if (playerSlider && sliderValueDisplay) {
        sliderValueDisplay.textContent = playerSlider.value;
        playerSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = playerSlider.value;
        });
    }

    if (confirmPlayerCountBtn) {
        confirmPlayerCountBtn.addEventListener('click', () => {
            selectPlayerCount(parseInt(playerSlider.value));
        });
    }

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('toggle-word-btn').addEventListener('click', toggleWordVisibility);

    // Set initial screen
    switchScreen(null, 'player-select-screen');
    
    updateAvailablePlayersDisplay();
    initializeSpeechRecognition();
});


// --- Modal Controls ---
function showErrorModal(message, isVictory = false) {
    const modal = document.getElementById('error-modal');
    const modalContent = modal.querySelector('.modal-content');
    const errorMessage = document.getElementById('error-message');

    modalContent.classList.remove('victory');
    const existingConfetti = modalContent.querySelector('.confetti-container');
    if (existingConfetti) {
        existingConfetti.remove();
    }

    if (isVictory) {
        modalContent.classList.add('victory');
        errorMessage.innerHTML = `<div class="victory-message">${message}</div>`;
        triggerConfetti();
    } else {
        errorMessage.textContent = message;
    }

    modal.classList.add('show');
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    modal.classList.remove('show');
}

function triggerConfetti() {
    const container = document.querySelector('.modal-content.victory .victory-message');
    if (!container) return;

    let confettiContainer = container.querySelector('.confetti-container');
    if (!confettiContainer) {
        confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        container.appendChild(confettiContainer);
    }
    confettiContainer.innerHTML = '';

    const confettiCount = 100;
    const colors = ['#ff0077', '#00eeff', '#7700ff', '#ffffff', '#f4d35e'];
    for (let i = 0; i < confettiCount; i++) {
        const piece = document.createElement('i');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 4;
        piece.style.animationDuration = `${duration}s`;
        const delay = Math.random() * 5;
        piece.style.animationDelay = `${delay}s`;
        confettiContainer.appendChild(piece);
    }
}
''
