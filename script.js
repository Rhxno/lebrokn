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
let currentHintGiver = null;
let gameLog = [];
let totalRounds = 5;
let currentRound = 0;
let numberOfPlayers = 0; // To store selected number of players
let gameDifficulty = 'easy'; // Default difficulty
let isWordVisible = true; // Track word visibility state - INITIAL STATE IS NOW TRUE (VISIBLE)
let selectedRoundsCount = 5; // Track selected rounds count globally
let gameStarted = false; // Track if the game has started
let pendingSwitch = null; // Track the pending switch action
let maxTeamSize = 0; // Declare maxTeamSize globally
let currentPlayerIndex = { 1: 0, 2: 0 }; // Track current player index for each team

// Drag and Drop State
let dragState = {
    element: null,
    originalParent: null,
    originalIndex: null,
    startX: 0,
    startY: 0,
    isDragging: false,
    dragClone: null
};

// --- Speech Recognition Variables ---
let recognition = null;
let targetInput = null;
let activeMicButton = null;

// --- Even More Expanded and Refined Word Lists ---
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
            wordList = easyWords; // Default to easy if difficulty is not set
    }
    return wordList[Math.floor(Math.random() * wordList.length)];
}

// --- Fetch a random word from an API (using local word lists now) ---
async function fetchRandomWord() {
    // Using local word lists based on difficulty
    return Promise.resolve(getRandomWord());
}

// --- Speech Recognition Initialization ---
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

    if (!playerName) return; // Don't add empty names

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

function updateAvailablePlayers() {
    const availablePlayersElement = document.getElementById('available-players-setup');
    if (!availablePlayersElement) {
        console.warn('Available players element not found');
        return;
    }
    availablePlayersElement.innerHTML = '';
    players.available.forEach(playerId => {
        const playerElement = document.getElementById(playerId);
        if (playerElement) {
            availablePlayersElement.appendChild(playerElement);
        }
    });
}

function updateTeamPlayers() {
    ['team1', 'team2'].forEach(team => {
        const teamPlayersElement = document.getElementById(`${team}-players`);
        teamPlayersElement.innerHTML = '';
        players[team].forEach(playerId => {
            const playerElement = document.getElementById(playerId);
            teamPlayersElement.appendChild(playerElement);
        });
    });
}

function updatePlayerDropdowns() {
    const playerSelect1 = document.getElementById('team1-player-select');
    const playerSelect2 = document.getElementById('team2-player-select');

    if (!playerSelect1 || !playerSelect2) {
        console.error("Player select elements not found.");
        return;
    }

    playerSelect1.innerHTML = '';
    playerSelect2.innerHTML = '';

    players.team1.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        playerSelect1.appendChild(option);
    });

    players.team2.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        playerSelect2.appendChild(option);
    });
}

// --- Modern Drag and Drop System ---
function initializeDragAndDrop() {
    // Add event listeners to drop zones
    const dropZones = document.querySelectorAll('.players-list, .leader-slot, #available-players');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(event) {
    if (gameStarted) {
        event.preventDefault();
        return;
    }

    dragState.element = event.target;
    dragState.originalParent = event.target.parentNode;
    dragState.originalIndex = Array.from(dragState.originalParent.children).indexOf(event.target);
    dragState.isDragging = true;

    event.target.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.target.textContent);
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    clearDropZoneHighlights();
    dragState.isDragging = false;
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(event) {
    event.preventDefault();
    if (dragState.isDragging && event.currentTarget !== dragState.originalParent) {
        event.currentTarget.classList.add('drag-over');
    }
}

function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
        event.currentTarget.classList.remove('drag-over');
    }
}

function handleDrop(event) {
    event.preventDefault();
    if (gameStarted) return;

    const dropZone = event.currentTarget;
    const playerName = event.dataTransfer.getData('text/plain');

    clearDropZoneHighlights();

    if (!playerName || !dragState.element) return;

    // Determine drop target type
    const isAvailableZone = dropZone.id === 'available-players';
    const isLeaderSlot = dropZone.classList.contains('leader-slot');
    const isTeamZone = dropZone.classList.contains('players-list') && dropZone.closest('.team');

    if (isAvailableZone) {
        handleDropToAvailable(playerName);
    } else if (isLeaderSlot) {
        const teamNumber = getTeamNumberFromElement(dropZone);
        handleDropToLeader(playerName, teamNumber);
    } else if (isTeamZone) {
        const teamNumber = getTeamNumberFromElement(dropZone);
        handleDropToTeam(playerName, teamNumber);
    }
}

function handleDropToAvailable(playerName) {
    // Check if we're in team setup mode
    const availableContainer = document.getElementById('available-players-setup');

    if (availableContainer) {
        // Team setup mode - handle DOM-based drag and drop
        handleTeamSetupDropToAvailable(playerName);
        return;
    }

    // Original game mode logic
    const currentLocation = getPlayerLocation(playerName);
    if (currentLocation === 'available') return;

    showConfirmationDialog(
        `Move ${playerName} back to Available Players?`,
        () => {
            removePlayerFromAllGroups(playerName);
            players.available.push(playerName);
            updateAllDisplays();
        },
        resetDraggedElement
    );
}

function handleDropToLeader(playerName, teamNumber) {
    // Check if we're in team setup mode
    const setupLeaderContainer = document.getElementById(`team${teamNumber}-leader-container`);

    if (setupLeaderContainer) {
        // Team setup mode - handle DOM-based drag and drop
        handleTeamSetupDropToLeader(playerName, teamNumber);
        return;
    }

    // Original game mode logic
    const teamKey = `team${teamNumber}`;
    const currentLeader = players[`${teamKey}Leader`];

    if (currentLeader === playerName) {
        resetDraggedElement();
        return;
    }

    if (currentLeader) {
        showConfirmationDialog(
            `Replace ${currentLeader} as Team ${teamNumber} leader with ${playerName}?`,
            () => {
                removePlayerFromAllGroups(playerName);
                removePlayerFromAllGroups(currentLeader);

                players[`${teamKey}Leader`] = playerName;
                players.available.push(currentLeader);
                updateAllDisplays();
            },
            resetDraggedElement
        );
    } else {
        if (getTeamSize(teamNumber) >= maxTeamSize) {
            showErrorModal(`Team ${teamNumber} is full!`);
            resetDraggedElement();
            return;
        }

        showConfirmationDialog(
            `Make ${playerName} the leader of Team ${teamNumber}?`,
            () => {
                removePlayerFromAllGroups(playerName);
                players[`${teamKey}Leader`] = playerName;
                updateAllDisplays();
            },
            resetDraggedElement
        );
    }
}

function handleDropToTeam(playerName, teamNumber) {
    // Check if we're in team setup mode
    const setupPlayersContainer = document.getElementById(`team${teamNumber}-players-setup`);

    if (setupPlayersContainer) {
        // Team setup mode - handle DOM-based drag and drop
        handleTeamSetupDropToTeam(playerName, teamNumber);
        return;
    }

    // Original game mode logic
    const teamKey = `team${teamNumber}`;
    const currentLocation = getPlayerLocation(playerName);

    if (currentLocation === teamKey) {
        resetDraggedElement();
        return;
    }

    if (getTeamSize(teamNumber) >= maxTeamSize) {
        showErrorModal(`Team ${teamNumber} is full!`);
        resetDraggedElement();
        return;
    }

    showConfirmationDialog(
        `Move ${playerName} to Team ${teamNumber}?`,
        () => {
            removePlayerFromAllGroups(playerName);
            players[teamKey].push(playerName);
            updateAllDisplays();
        },
        resetDraggedElement
    );
}

function getTeamNumberFromElement(element) {
    const teamElement = element.closest('.team');
    return teamElement ? parseInt(teamElement.id.replace('team', '')) : null;
}

function getPlayerLocation(playerName) {
    if (players.available.includes(playerName)) return 'available';
    if (players.team1.includes(playerName) || players.team1Leader === playerName) return 'team1';
    if (players.team2.includes(playerName) || players.team2Leader === playerName) return 'team2';
    return null;
}

function getTeamSize(teamNumber) {
    const teamKey = `team${teamNumber}`;

    // Check if we're in team setup mode (using DOM elements)
    const setupLeaderContainer = document.getElementById(`team${teamNumber}-leader-container`);
    const setupPlayersContainer = document.getElementById(`team${teamNumber}-players-setup`);

    if (setupLeaderContainer && setupPlayersContainer) {
        // Team setup mode - count DOM elements
        const leaderCount = setupLeaderContainer.children.length;
        const playersCount = setupPlayersContainer.children.length;
        return leaderCount + playersCount;
    } else {
        // Game mode - use players object
        const leaderCount = players[`${teamKey}Leader`] ? 1 : 0;
        const playersCount = players[teamKey] ? players[teamKey].length : 0;
        return playersCount + leaderCount;
    }
}

function clearDropZoneHighlights() {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function resetDraggedElement() {
    if (dragState.element && dragState.originalParent) {
        const children = Array.from(dragState.originalParent.children);
        if (dragState.originalIndex < children.length) {
            dragState.originalParent.insertBefore(dragState.element, children[dragState.originalIndex]);
        } else {
            dragState.originalParent.appendChild(dragState.element);
        }
    }

    dragState.element = null;
    dragState.originalParent = null;
    dragState.originalIndex = null;
}

function showConfirmationDialog(message, onConfirmCallback, onCancelCallback = resetDraggedItem) {
    const dialog = document.getElementById('confirmation-dialog');
    const messageElement = document.getElementById('confirmation-message');
    messageElement.textContent = message;
    dialog.style.display = 'flex';

    void dialog.offsetWidth;

    dialog.classList.add('show');
    pendingSwitch = {
        onConfirm: onConfirmCallback,
        onCancel: onCancelCallback
    };
}

function confirmSwitch(confirm) {
    const dialog = document.getElementById('confirmation-dialog');
    dialog.classList.remove('show');

    const actionToConfirm = pendingSwitch?.onConfirm;
    const actionOnCancel = pendingSwitch?.onCancel;

    setTimeout(() => {
        dialog.style.display = 'none';
        if (confirm && actionToConfirm) {
            actionToConfirm();
        } else if (!confirm && actionOnCancel) {
            actionOnCancel();
        } else if (!confirm) {
            resetDraggedItem();
        }
        pendingSwitch = null;
    }, 300);
}

// --- Simplified Mobile Touch Drag and Drop ---
function addTouchSupport(element) {
    let touchState = {
        startX: 0,
        startY: 0,
        isDragging: false,
        dragThreshold: 15,
        longPressTimer: null,
        longPressDelay: 300
    };

    element.addEventListener('touchstart', (e) => {
        if (gameStarted) return;
        e.preventDefault();

        const touch = e.touches[0];
        touchState.startX = touch.clientX;
        touchState.startY = touch.clientY;
        touchState.isDragging = false;

        // Visual feedback for long press
        element.classList.add('long-press-active');

        // Start long press timer
        touchState.longPressTimer = setTimeout(() => {
            touchState.isDragging = true;
            startTouchDrag(element, touch);
        }, touchState.longPressDelay);

    }, { passive: false });

    element.addEventListener('touchmove', (e) => {
        if (gameStarted) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchState.startX);
        const deltaY = Math.abs(touch.clientY - touchState.startY);

        // Cancel long press if moved too much before drag starts
        if (!touchState.isDragging && (deltaX > touchState.dragThreshold || deltaY > touchState.dragThreshold)) {
            if (touchState.longPressTimer) {
                clearTimeout(touchState.longPressTimer);
                touchState.longPressTimer = null;
                element.classList.remove('long-press-active');
            }
            return;
        }

        // Update drag position if dragging
        if (touchState.isDragging && dragState.isDragging) {
            updateTouchDragPosition(element, touch);
            updateTouchDropZoneHighlight(touch);
        }

    }, { passive: false });

    element.addEventListener('touchend', (e) => {
        if (gameStarted) return;
        e.preventDefault();

        // Clear timers and visual feedback
        if (touchState.longPressTimer) {
            clearTimeout(touchState.longPressTimer);
            touchState.longPressTimer = null;
        }
        element.classList.remove('long-press-active');

        // Handle drag end
        if (touchState.isDragging && dragState.isDragging) {
            const touch = e.changedTouches[0];
            endTouchDrag(element, touch);
        }

        touchState.isDragging = false;

    }, { passive: false });

    element.addEventListener('touchcancel', (e) => {
        // Clean up everything
        if (touchState.longPressTimer) {
            clearTimeout(touchState.longPressTimer);
            touchState.longPressTimer = null;
        }
        element.classList.remove('long-press-active');

        if (touchState.isDragging && dragState.isDragging) {
            cancelTouchDrag(element);
        }

        touchState.isDragging = false;
    });
}

function startTouchDrag(element, touch) {
    dragState.element = element;
    dragState.originalParent = element.parentNode;
    dragState.originalIndex = Array.from(dragState.originalParent.children).indexOf(element);
    dragState.isDragging = true;

    // Create a visual clone for dragging instead of moving the original
    const clone = element.cloneNode(true);
    clone.classList.add('dragging');
    clone.style.position = 'fixed';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.width = element.offsetWidth + 'px';
    clone.style.height = element.offsetHeight + 'px';

    // Calculate initial position
    const rect = element.getBoundingClientRect();
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';

    // Store offset from touch point to element center
    const offsetX = touch.clientX - (rect.left + rect.width / 2);
    const offsetY = touch.clientY - (rect.top + rect.height / 2);
    clone._touchOffset = { x: offsetX, y: offsetY };

    // Hide original and add clone to body
    element.style.opacity = '0.3';
    document.body.appendChild(clone);
    dragState.dragClone = clone;

    // Add haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function updateTouchDragPosition(element, touch) {
    const clone = dragState.dragClone;
    if (!clone || !clone._touchOffset) return;

    // Center the clone on the touch point
    const x = touch.clientX - clone.offsetWidth / 2;
    const y = touch.clientY - clone.offsetHeight / 2;

    clone.style.left = x + 'px';
    clone.style.top = y + 'px';
}

function updateTouchDropZoneHighlight(touch) {
    // Clear previous highlights
    clearDropZoneHighlights();

    // Find element under touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementBelow) return;

    // Find valid drop zone - include team setup specific zones
    const dropZone = elementBelow.closest('.players-list, .leader-slot, #available-players, #available-players-setup, #team1-players-setup, #team2-players-setup, #team1-leader-container, #team2-leader-container');
    if (dropZone && dropZone !== dragState.originalParent) {
        dropZone.classList.add('drag-over');
    }
}

function endTouchDrag(element, touch) {
    // Find drop target - include team setup specific zones
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.players-list, .leader-slot, #available-players, #available-players-setup, #team1-players-setup, #team2-players-setup, #team1-leader-container, #team2-leader-container');

    // Clean up
    cleanupTouchDrag(element);
    clearDropZoneHighlights();

    // Handle drop
    if (dropZone && dropZone !== dragState.originalParent) {
        const playerName = element.textContent;

        // Team setup specific zones
        if (dropZone.id === 'available-players-setup') {
            handleDropToAvailable(playerName);
        } else if (dropZone.id === 'team1-leader-container' || dropZone.id === 'team2-leader-container') {
            const teamNumber = dropZone.id.includes('team1') ? 1 : 2;
            handleDropToLeader(playerName, teamNumber);
        } else if (dropZone.id === 'team1-players-setup' || dropZone.id === 'team2-players-setup') {
            const teamNumber = dropZone.id.includes('team1') ? 1 : 2;
            handleDropToTeam(playerName, teamNumber);
        }
        // Original game zones
        else if (dropZone.id === 'available-players') {
            handleDropToAvailable(playerName);
        } else if (dropZone.classList.contains('leader-slot')) {
            const teamNumber = getTeamNumberFromElement(dropZone);
            handleDropToLeader(playerName, teamNumber);
        } else if (dropZone.classList.contains('players-list') && dropZone.closest('.team')) {
            const teamNumber = getTeamNumberFromElement(dropZone);
            handleDropToTeam(playerName, teamNumber);
        }
    } else {
        // No valid drop zone, return to original position
        resetDraggedElement();
    }

    dragState.isDragging = false;
}

function cancelTouchDrag(element) {
    cleanupTouchDrag(element);
    clearDropZoneHighlights();
    resetDraggedElement();
    dragState.isDragging = false;
}

function cleanupTouchDrag(element) {
    // Restore original element
    element.style.opacity = '';
    element.classList.remove('dragging');

    // Remove drag clone
    if (dragState.dragClone) {
        dragState.dragClone.remove();
        dragState.dragClone = null;
    }
}

function createPlayerElement(playerName, isLeader = false) {
    const playerElement = document.createElement('div');
    playerElement.className = isLeader ? 'player leader locked' : 'player';
    playerElement.textContent = playerName;
    playerElement.dataset.playerName = playerName;

    if (!isLeader) {
        if (isMobileDevice()) {
            // Mobile: Use touch drag with tap fallback
            addTouchSupport(playerElement);
            addSimpleTouchFallback(playerElement);
        } else {
            // Desktop: Use HTML5 drag and drop
            playerElement.draggable = true;
            playerElement.addEventListener('dragstart', handleDragStart);
            playerElement.addEventListener('dragend', handleDragEnd);
        }
    }

    return playerElement;
}

// Helper function to detect mobile devices
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0);
}

// Helper function to update all displays
function updateAllDisplays() {
    updateAvailablePlayersDisplay();
    updateTeamPlayersDisplay();
    updatePlayerDropdowns();
}

// --- Game Logic ---
async function startGame() {
    console.log("Starting game...");
    console.log("Team 1:", players.team1);
    console.log("Team 2:", players.team2);

    if (!players.team1Leader || !players.team2Leader) {
        showErrorModal('Each team needs a leader!');
        return;
    }

    if (players.team1.length === 0 || players.team2.length === 0) {
        showErrorModal('Each team needs at least one player!');
        return;
    }

    // Check if a word exists. If not, generate one.
    if (!currentWord) {
        console.log("No current word found, generating one for game start.");
        await generateNewWord(); // Generate word only if needed
        if (!currentWord) { // Check again in case generation failed
            showErrorModal('Failed to generate a word to start the game.');
            return;
        }
    } else {
        console.log("Starting game with existing word:", currentWord);
        // Ensure the existing word is displayed correctly (in case it was hidden)
        const wordElement = document.getElementById('current-word');
        const toggleButton = document.getElementById('toggle-word-btn');
        if (wordElement) {
            wordElement.textContent = currentWord;
            wordElement.style.filter = 'none';
            wordElement.style.backgroundColor = 'var(--tertiary-bg)';
            wordElement.style.color = 'var(--text-color-light)';
            wordElement.style.border = '1px solid var(--border-color)';
            wordElement.classList.remove('word-hidden');
            isWordVisible = true;
            if (toggleButton) toggleButton.textContent = 'Hide Word';
        }
    }

    gameStarted = true;

    // Disable the 'Generate Word' button after start
    const generateWordButton = document.querySelector('.word-controls button:first-child');
    if (generateWordButton) {
        generateWordButton.disabled = true;
    }

    // Hide setup screens and show game container
    document.querySelectorAll('.setup-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById('game-container').style.display = 'block';

    currentTeam = 1;
    currentRound = 0;
    currentPlayerIndex = { 1: 0, 2: 0 };
    gameLog = [];

    // Reset scores visually if you have score display elements
    document.querySelectorAll('.score span').forEach(span => span.textContent = '0');

    // Assign initial guesser (assuming team 1 starts)
    currentGuesser = players.team1.length > 0 ? players.team1[0] : players.team1Leader;

    showTurnOverlay();
    highlightCurrentTeam();
    updateActiveTeamLog();

    // Update game screen word display
    const gameWordElement = document.getElementById('game-current-word');
    if (gameWordElement && currentWord) {
        gameWordElement.textContent = currentWord;
        gameWordElement.style.filter = 'none';
        gameWordElement.style.backgroundColor = 'var(--tertiary-bg)';
        gameWordElement.style.color = 'var(--text-color-light)';
        gameWordElement.style.border = '1px solid var(--border-color)';
        gameWordElement.classList.remove('word-hidden');
    }

    console.log("Game started successfully with word:", currentWord);
}

async function generateNewWord() {
    try {
        currentWord = await fetchRandomWord();
        const wordElement = document.getElementById('current-word');
        const gameWordElement = document.getElementById('game-current-word');
        const toggleButton = document.getElementById('toggle-word-btn');

        if (wordElement && currentWord) {
            // Always show the word when generating a new one
            wordElement.textContent = currentWord;
            wordElement.style.filter = 'none';
            wordElement.style.backgroundColor = 'var(--tertiary-bg)';
            wordElement.style.color = 'var(--text-color-light)';
            wordElement.style.border = '1px solid var(--border-color)';
            wordElement.classList.remove('word-hidden');
            isWordVisible = true;

            if (toggleButton) {
                toggleButton.textContent = 'Hide Word';
            }
        }

        // Also update game screen word if it exists
        if (gameWordElement && currentWord) {
            gameWordElement.textContent = currentWord;
            gameWordElement.style.filter = 'none';
            gameWordElement.style.backgroundColor = 'var(--tertiary-bg)';
            gameWordElement.style.color = 'var(--text-color-light)';
            gameWordElement.style.border = '1px solid var(--border-color)';
            gameWordElement.classList.remove('word-hidden');
        }
    } catch (error) {
        console.error('Error generating word:', error);
    }
}

// Function for generating new word during game
async function generateNewGameWord() {
    await generateNewWord();
}

function toggleWordVisibility() {
    if (!currentWord) return;

    const wordElement = document.getElementById('current-word');
    const gameWordElement = document.getElementById('game-current-word');
    const toggleButton = document.getElementById('toggle-word-btn');
    const gameToggleButton = document.getElementById('game-toggle-word-btn');

    isWordVisible = !isWordVisible;
    
    // Add haptic feedback for mobile
    if (navigator.vibrate && isMobileDevice()) {
        navigator.vibrate(50);
    }

    // Update word generation screen word
    if (wordElement && toggleButton) {
        if (isWordVisible) {
            wordElement.textContent = currentWord;
            wordElement.style.filter = 'none';
            wordElement.style.backgroundColor = 'var(--tertiary-bg)';
            wordElement.style.color = 'var(--text-color-light)';
            wordElement.style.border = '1px solid var(--border-color)';
            wordElement.classList.remove('word-hidden');
            toggleButton.textContent = 'Hide Word';
        } else {
            wordElement.textContent = currentWord;
            wordElement.style.filter = 'blur(10px)';
            wordElement.style.backgroundColor = 'var(--primary-bg)';
            wordElement.style.color = 'var(--text-color-light)';
            wordElement.style.border = '1px solid var(--border-color)';
            wordElement.classList.add('word-hidden');
            toggleButton.textContent = 'Show Word';
        }
    }

    // Update game screen word
    if (gameWordElement && gameToggleButton) {
        if (isWordVisible) {
            gameWordElement.textContent = currentWord;
            gameWordElement.style.filter = 'none';
            gameWordElement.style.backgroundColor = 'var(--tertiary-bg)';
            gameWordElement.style.color = 'var(--text-color-light)';
            gameWordElement.style.border = '1px solid var(--border-color)';
            gameWordElement.classList.remove('word-hidden');
            gameToggleButton.textContent = 'Hide Word';
        } else {
            gameWordElement.textContent = currentWord;
            gameWordElement.style.filter = 'blur(10px)';
            gameWordElement.style.backgroundColor = 'var(--primary-bg)';
            gameWordElement.style.color = 'var(--text-color-light)';
            gameWordElement.style.border = '1px solid var(--border-color)';
            gameWordElement.classList.add('word-hidden');
            gameToggleButton.textContent = 'Show Word';
        }
    }
}

function switchTeams() {
    currentTeam = currentTeam === 1 ? 2 : 1;
    currentPlayerIndex[currentTeam] = 0;
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
    const currentPlayerName = currentGuesser;
    const teamColor = currentTeam === 1 ? 'var(--team1-color)' : 'var(--team2-color)';

    playerNameDisplay.textContent = `${currentPlayerName}'s Turn!`;
    teamIndicatorDisplay.textContent = currentTeamName;
    playerNameDisplay.style.color = teamColor;

    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
        updateActiveTeamLog();
    }, 2500);
}

function updateActiveTeamLog() {
    document.querySelectorAll('.team-log').forEach(log => {
        log.style.display = 'none';
        log.classList.remove('active');
    });

    const activeTeamLog = document.querySelector(`.team-log:nth-child(${currentTeam})`);
    if (activeTeamLog) {
        activeTeamLog.style.display = 'block';
        activeTeamLog.classList.add('active');

        console.log(`Switching to Team ${currentTeam}'s log`);
    }
}

// --- Referee Logging ---
function logWord(teamNumber) {
    if (teamNumber !== currentTeam) {
        showErrorModal(`It's not Team ${teamNumber}'s turn!`);
        return;
    }

    const wordLogInput = document.getElementById(`team${teamNumber}-word-log`);
    const word = wordLogInput.value.trim().toUpperCase();

    if (word === '') return;

    const playerName = players[`team${teamNumber}`][currentPlayerIndex[teamNumber]];
    const timestamp = formatTime(new Date());

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
    wordLogInput.value = '';

    if (word === currentWord) {
        showErrorModal(`Team ${teamNumber} guessed the password!`);
        endRound();
        return;
    }

    switchTeams();
    showTurnOverlay();
    highlightCurrentTeam();
    updateActiveTeamLog();
}

function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = String(hours).padStart(2, '0');

    return `${hours}:${minutes} ${ampm}`;
}

function updateScore(teamNumber) {
    const scoreElement = document.querySelector(`#team${teamNumber} .score span`);
    scoreElement.textContent = parseInt(scoreElement.textContent) + 1;
}

async function endRound() {
    const victoryMessage = `
        Team ${currentTeam} Wins Round ${currentRound + 1}!
    `;

    showErrorModal(victoryMessage, true);
    currentRound++;

    if (currentRound >= totalRounds) {
        setTimeout(() => {
            const finalMessage = `
                Game Over!<br>
                <span class="final-score">Final Score: Team ${currentTeam} Wins!</span>
            `;
            showErrorModal(finalMessage, true);
            endGame();
        }, 2000);
    } else {
        setTimeout(async () => {
            await generateNewWord();
            switchTeams();
        }, 2000);
    }
}

// --- Results Calculation ---
function endGame() {
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').classList.add('show');
    // Hide game controls when showing results
    const gameScreen = document.querySelector('.game-screen');
    if (gameScreen) {
        gameScreen.style.display = 'none';
    }

    const correctGuesses = gameLog.filter(entry => entry.type === 'correct-guess');
    document.getElementById('guess-results').innerHTML = correctGuesses.map(guess => `
        <div class="result-item">
            <span>${guess.player} (Team ${guess.team})</span>
            <span>${guess.word}</span>
        </div>
    `).join('');

    const hintResults = calculateHintEffectiveness();
    document.getElementById('hint-results').innerHTML = hintResults.map(hint => `
        <div class="result-item">
            <span>${hint.player} (Team ${hint.team})</span>
            <span>${hint.effectiveness.toFixed(1)}%</span>
        </div>
    `).join('');
}

function calculateHintEffectiveness() {
    const hintStats = {};

    gameLog.filter(entry => entry.type === 'hint').forEach(entry => {
        if (!hintStats[entry.player]) {
            hintStats[entry.player] = {
                total: 0,
                effective: 0,
                team: entry.team
            };
        }

        hintStats[entry.player].total++;
        if (isEffectiveHint(entry.word)) {
            hintStats[entry.player].effective++;
        }
    });

    return Object.entries(hintStats).map(([player, stats]) => ({
        player,
        team: stats.team,
        effectiveness: (stats.effective / stats.total) * 100 || 0
    })).sort((a, b) => b.effectiveness - a.effectiveness);
}

function isEffectiveHint(word) {
    const cleanWord = word.replace(/[^A-Z]/g, '');
    const cleanPassword = currentWord.replace(/[^A-Z]/g, '');

    return cleanWord === cleanPassword ||
        cleanPassword.includes(cleanWord) ||
        cleanWord.includes(cleanPassword) ||
        calculateSimilarity(cleanWord, cleanPassword) > 0.4;
}

function calculateSimilarity(a, b) {
    const longer = a.length > b.length ? a : b;
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return 1 - (matrix[a.length][b.length] / longer.length);
}

// --- Modern Screen Transition System ---
let currentScreen = 0;
const screens = ['player-select-screen', 'difficulty-select-screen', 'round-select-screen', 'team-setup-screen', 'word-generation-screen'];
let selectedPlayerCount = 0;

function transitionToScreen(fromScreenId, toScreenId, direction = 'right') {
    const fromScreen = document.getElementById(fromScreenId);
    const toScreen = document.getElementById(toScreenId);

    if (!fromScreen || !toScreen) {
        console.error('Screen not found:', fromScreenId, toScreenId);
        return;
    }

    console.log('Transitioning from', fromScreenId, 'to', toScreenId);

    // Update progress indicator
    updateProgressIndicator(toScreenId);

    // Hide current screen immediately
    fromScreen.classList.remove('active');
    fromScreen.style.display = 'none';

    // Show next screen immediately
    toScreen.style.display = 'flex';
    toScreen.style.opacity = '1';
    toScreen.style.transform = 'translateX(0)';
    toScreen.classList.add('active');

    // Ensure all content is visible
    const content = toScreen.querySelector('.card-content');
    const buttons = toScreen.querySelectorAll('.btn');
    const h2 = toScreen.querySelector('h2');
    const optionsGrid = toScreen.querySelector('.options-grid');

    console.log('Content found:', !!content);
    console.log('Buttons found:', buttons.length);
    console.log('H2 found:', !!h2);
    console.log('Options grid found:', !!optionsGrid);

    if (content) {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        content.style.display = 'block';
        content.style.visibility = 'visible';
    }

    if (h2) {
        h2.style.opacity = '1';
        h2.style.visibility = 'visible';
    }

    if (optionsGrid) {
        optionsGrid.style.opacity = '1';
        optionsGrid.style.visibility = 'visible';
        optionsGrid.style.display = 'flex';
    }

    buttons.forEach((btn, index) => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
        btn.style.display = 'inline-block';
        btn.style.visibility = 'visible';
        console.log(`Button ${index}:`, btn.textContent);
    });

    console.log('Transition completed to', toScreenId);

    // Initialize specific screens
    if (toScreenId === 'team-setup-screen') {
        initializeTeamSetup();
    }
}

function triggerContentAnimations(screen) {
    console.log('Triggering animations for screen:', screen.id);
    const buttons = screen.querySelectorAll('.btn');
    const content = screen.querySelector('.card-content');

    console.log('Found content:', !!content, 'Found buttons:', buttons.length);

    if (content) {
        content.style.transform = 'translateY(30px)';
        content.style.opacity = '0';

        setTimeout(() => {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
            console.log('Content animation triggered');
        }, 100);
    }

    buttons.forEach((btn, index) => {
        btn.style.transform = 'translateY(20px)';
        btn.style.opacity = '0';

        setTimeout(() => {
            btn.style.transform = 'translateY(0)';
            btn.style.opacity = '1';
            console.log('Button', index, 'animation triggered');
        }, 200 + (index * 100));
    });
}

function updateProgressIndicator(targetScreenId) {
    // Create progress indicator if it doesn't exist
    if (!document.querySelector('.setup-progress')) {
        createProgressIndicator();
    }

    const dots = document.querySelectorAll('.progress-dot');
    const targetIndex = screens.indexOf(targetScreenId);

    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index < targetIndex) {
            dot.classList.add('completed');
        } else if (index === targetIndex) {
            dot.classList.add('active');
        }
    });
}

function createProgressIndicator() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'setup-progress';

    screens.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (index === 0) dot.classList.add('active');
        progressContainer.appendChild(dot);
    });

    document.body.appendChild(progressContainer);
}

function selectPlayerCount(playerCount) {
    numberOfPlayers = playerCount;
    transitionToScreen('player-select-screen', 'difficulty-select-screen');
}

function selectRounds(rounds) {
    totalRounds = rounds;
    transitionToScreen('round-select-screen', 'team-setup-screen');
}

function selectDifficulty(difficulty) {
    console.log('Difficulty selected:', difficulty);
    gameDifficulty = difficulty;

    // Add visual feedback for selected difficulty
    const selectedBtn = event.target;
    if (selectedBtn) {
        selectedBtn.style.transform = 'scale(0.95)';
        selectedBtn.style.background = 'var(--text-color-light)';
        selectedBtn.style.color = 'var(--primary-bg)';
    }

    setTimeout(() => {
        console.log('Starting transition to round screen');

        // Debug: Check if round screen exists and has content
        const roundScreen = document.getElementById('round-select-screen');
        console.log('Round screen found:', !!roundScreen);
        if (roundScreen) {
            console.log('Round screen content:', roundScreen.innerHTML.substring(0, 200));
        }

        transitionToScreen('difficulty-select-screen', 'round-select-screen');
    }, 200);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const playerSlider = document.getElementById('player-slider-input');
    const sliderValueDisplay = document.getElementById('slider-value');
    const confirmPlayerCountBtn = document.getElementById('confirm-player-count-btn');
    const playerSelectScreen = document.getElementById('player-select-screen');

    if (playerSlider && sliderValueDisplay) {
        // Set initial display value from the slider's current value
        sliderValueDisplay.textContent = playerSlider.value; // ADD THIS LINE

        // Update display when slider value changes
        playerSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = playerSlider.value;
        });
    }

    if (confirmPlayerCountBtn && playerSelectScreen && playerSlider) {
        confirmPlayerCountBtn.addEventListener('click', () => {
            numberOfPlayers = parseInt(playerSlider.value);
            maxTeamSize = Math.ceil(numberOfPlayers / 2);
            teamsConfig.team1.maxPlayers = maxTeamSize;
            teamsConfig.team2.maxPlayers = maxTeamSize;

            // Add button feedback
            confirmPlayerCountBtn.style.transform = 'scale(0.95)';
            confirmPlayerCountBtn.style.background = 'var(--text-color-light)';
            confirmPlayerCountBtn.style.color = 'var(--primary-bg)';

            setTimeout(() => {
                transitionToScreen('player-select-screen', 'difficulty-select-screen');
            }, 200);
        });
    }

    const difficultySelectScreen = document.getElementById('difficulty-select-screen');
    if (difficultySelectScreen) {
        // Initially hide it if it's not the first screen.
    }

    // Initialize setup screens
    const playerScreen = document.getElementById('player-select-screen');
    const difficultyScreen = document.getElementById('difficulty-select-screen');
    const roundScreen = document.getElementById('round-select-screen');
    const teamScreen = document.getElementById('team-setup-screen');
    const wordScreen = document.getElementById('word-generation-screen');

    // Make sure only the first screen is active
    playerScreen.classList.add('active');
    playerScreen.style.display = 'flex';
    playerScreen.style.transform = 'translateX(0)';
    playerScreen.style.opacity = '1';

    [difficultyScreen, roundScreen, teamScreen, wordScreen].forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
            screen.style.display = 'none';
        }
    });

    // Setup round slider
    const roundSlider = document.getElementById('round-slider-input');
    const roundSliderValue = document.getElementById('round-slider-value');

    if (roundSlider && roundSliderValue) {
        roundSliderValue.textContent = roundSlider.value;
        roundSlider.addEventListener('input', () => {
            roundSliderValue.textContent = roundSlider.value;
        });
    }

    // Setup round confirmation
    const confirmRoundBtn = document.getElementById('confirm-round-count-btn');
    if (confirmRoundBtn) {
        confirmRoundBtn.addEventListener('click', () => {
            totalRounds = parseInt(roundSlider.value);
            confirmRoundBtn.style.transform = 'scale(0.95)';
            confirmRoundBtn.style.background = 'var(--text-color-light)';
            confirmRoundBtn.style.color = 'var(--primary-bg)';

            setTimeout(() => {
                transitionToScreen('round-select-screen', 'team-setup-screen');
            }, 200);
        });
    }

    // Setup team management
    setupTeamManagement();

    // Setup final start game button
    const finalStartGameBtn = document.getElementById('final-start-game-btn');
    if (finalStartGameBtn) {
        finalStartGameBtn.addEventListener('click', () => {
            finalStartGameBtn.style.transform = 'scale(0.95)';
            finalStartGameBtn.style.background = 'var(--text-color-light)';
            finalStartGameBtn.style.color = 'var(--primary-bg)';

            setTimeout(() => {
                finalizeGameSetup();
            }, 200);
        });
    }

    // Create progress indicator
    createProgressIndicator();

    updateAvailablePlayersDisplay();

    const toggleButton = document.getElementById('toggle-word-btn');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleWordVisibility);
    }

    const gameToggleButton = document.getElementById('game-toggle-word-btn');
    if (gameToggleButton) {
        gameToggleButton.addEventListener('click', toggleWordVisibility);
    }

    document.querySelectorAll('.team-log').forEach(log => {
        log.style.display = 'none';
    });
    document.getElementById('team1-word-log').closest('.team-log').style.display = 'block';

    initializeSpeechRecognition();
    initializeDragAndDrop();

    // Mobile-specific fixes
    if (isMobileDevice()) {
        // Fix all text inputs for mobile
        const allInputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
        
        // Enhance buttons for mobile touch
        const allButtons = document.querySelectorAll('.btn');
        allButtons.forEach(button => {
            button.style.touchAction = 'manipulation';
            button.style.webkitTapHighlightColor = 'transparent';
            
            // Add touch feedback
            button.addEventListener('touchstart', (e) => {
                button.style.transform = 'scale(0.95)';
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            }, { passive: true });
            
            button.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 100);
            }, { passive: true });
        });
        allInputs.forEach(input => {
            input.style.fontSize = '16px';
            input.style.webkitAppearance = 'none';
            input.style.appearance = 'none';
            input.style.touchAction = 'manipulation';
            input.style.webkitUserSelect = 'text';
            input.style.userSelect = 'text';
            input.style.webkitTouchCallout = 'default';
        });

        // Prevent zoom on input focus for iOS
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }

        // Add mobile-specific event listeners
        document.addEventListener('touchstart', function () { }, { passive: true });
        document.addEventListener('touchmove', function () { }, { passive: true });
    }
});

function showDifficultySelectScreen() {
    const playerSelectScreen = document.getElementById('player-select-screen');
    const difficultySelectScreen = document.getElementById('difficulty-select-screen');

    if (playerSelectScreen) {
        playerSelectScreen.classList.remove('active');
    }
    if (difficultySelectScreen) {
        difficultySelectScreen.classList.add('active');
        console.log("Difficulty screen should now be active.");
    } else {
        console.error("Difficulty select screen not found");
    }
}

function updateAvailablePlayersDisplay() {
    const availablePlayersDiv = document.getElementById('available-players-setup');
    if (!availablePlayersDiv) {
        console.warn('Available players container not found');
        return;
    }
    availablePlayersDiv.innerHTML = '';
    players.available.forEach(playerName => {
        // Use createPlayerElement so touch handlers are attached!
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

    if (players.team1Leader) {
        document.getElementById('team1-leader').innerHTML = createPlayerElement(players.team1Leader, true).outerHTML;
    }
    if (players.team2Leader) {
        document.getElementById('team2-leader').innerHTML = createPlayerElement(players.team2Leader, true).outerHTML;
    }
}

function showErrorModal(message, isVictory = false) {
    const modal = document.getElementById('error-modal');
    const modalContent = modal.querySelector('.modal-content');
    const errorMessage = document.getElementById('error-message');

    modalContent.classList.remove('victory');
    // Clear any leftover confetti if the modal wasn't closed properly
    const existingConfetti = modalContent.querySelector('.confetti-container');
    if (existingConfetti) {
        existingConfetti.innerHTML = '';
    }

    if (isVictory) {
        modalContent.classList.add('victory');
        errorMessage.innerHTML = `
            <div class="victory-message">
                <h2>Victory!</h2>
                <div class="victory-stats">
                     ${message}
                </div>
            </div>
        `;
        setTimeout(triggerConfetti, 50);
    } else {
        errorMessage.textContent = message;
    }

    modal.classList.add('show');
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    const modalContent = modal.querySelector('.modal-content');

    if (modalContent.classList.contains('victory')) {
        const confettiContainer = modalContent.querySelector('.confetti-container');
        if (confettiContainer) {
            confettiContainer.innerHTML = '';
        }
    }

    modal.classList.remove('show');
}

function triggerConfetti() {
    const container = document.querySelector('.modal-content.victory .victory-message');
    if (!container) return;

    // Create a dedicated confetti container if it doesn't exist
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
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 4;
        piece.style.animationDuration = `${duration}s`;
        const delay = Math.random() * 5;
        piece.style.animationDelay = `${delay}s`;
        confettiContainer.appendChild(piece);
    }
}

const teamsConfig = {
    team1: {
        players: [],
        leader: null,
        maxPlayers: 0
    },
    team2: {
        players: [],
        leader: null,
        maxPlayers: 0
    }
};

function selectPlayerCount(count) {
    numberOfPlayers = count;
    selectedPlayerCount = count;
    maxTeamSize = Math.floor(count / 2);

    teamsConfig.team1.maxPlayers = Math.floor(count / 2);
    teamsConfig.team2.maxPlayers = Math.floor(count / 2);

    const playerSelectScreen = document.getElementById('player-select-screen');
    const difficultySelectScreen = document.getElementById('difficulty-select-screen');

    playerSelectScreen.style.display = 'none';

    difficultySelectScreen.style.display = 'block';
    difficultySelectScreen.classList.add('active');
}

// --- Add these function definitions back into script.js ---

function removePlayerFromAllGroups(playerName) {
    console.log("Attempting to remove player:", playerName); // Added for debugging

    // Remove from available list
    const availableIndex = players.available.indexOf(playerName);
    if (availableIndex > -1) {
        players.available.splice(availableIndex, 1);
        console.log(playerName, "removed from available.");
    }

    // Remove from team lists
    ['team1', 'team2'].forEach(team => {
        const teamIndex = players[team].indexOf(playerName);
        if (teamIndex > -1) {
            players[team].splice(teamIndex, 1);
            console.log(playerName, `removed from ${team}.`);
        }
    });

    // Remove from leader positions
    if (players.team1Leader === playerName) {
        players.team1Leader = null;
        console.log(playerName, "removed as Team 1 Leader.");
    }
    if (players.team2Leader === playerName) {
        players.team2Leader = null;
        console.log(playerName, "removed as Team 2 Leader.");
    }
}

function getPlayerCurrentTeam(playerName) {
    if (players.team1Leader === playerName || players.team1.includes(playerName)) {
        return 1;
    }
    if (players.team2Leader === playerName || players.team2.includes(playerName)) {
        return 2;
    }
    return null; // Return null if player is not assigned to a team
}

// --- Fallback: Simple Tap-to-Move System ---
let selectedPlayer = null;

function addSimpleTouchFallback(element) {
    let tapCount = 0;
    let tapTimer = null;

    element.addEventListener('click', (e) => {
        if (gameStarted) return;
        e.preventDefault();
        e.stopPropagation();

        tapCount++;

        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                // Single tap - select player for mobile
                handleMobilePlayerSelection(element);
                tapCount = 0;
            }, 250);
        } else if (tapCount === 2) {
            // Double tap - quick move to available
            clearTimeout(tapTimer);
            handleQuickMoveToAvailable(element);
            tapCount = 0;
        }
    });
}

function handleMobilePlayerSelection(element) {
    // Clear previous selection
    document.querySelectorAll('.player.selected').forEach(p => p.classList.remove('selected'));

    if (selectedPlayer === element) {
        // Deselect if clicking same player
        selectedPlayer = null;
        return;
    }

    // Select new player
    selectedPlayer = element;
    element.classList.add('selected');

    // Show mobile-friendly move options
    showMobileMoveOptions(element.textContent);
}

function showMobileMoveOptions(playerName) {
    // Create a mobile-optimized modal with move options
    const modal = document.createElement('div');
    modal.className = 'move-options-modal';
    modal.innerHTML = `
        <div class="move-options-content">
            <h3>Move ${playerName}</h3>
            <div class="mobile-move-buttons">
                <button onclick="movePlayerTo('available')" class="btn primary-btn mobile-move-btn">Available Players</button>
                <button onclick="movePlayerTo('team1')" class="btn primary-btn mobile-move-btn">Team 1 Players</button>
                <button onclick="movePlayerTo('team2')" class="btn primary-btn mobile-move-btn">Team 2 Players</button>
                <button onclick="movePlayerTo('team1-leader')" class="btn secondary-btn mobile-move-btn">Team 1 Leader</button>
                <button onclick="movePlayerTo('team2-leader')" class="btn secondary-btn mobile-move-btn">Team 2 Leader</button>
                <button onclick="closeMoveOptions()" class="btn danger-btn mobile-move-btn">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function handlePlayerSelection(element) {
    // Clear previous selection
    document.querySelectorAll('.player.selected').forEach(p => p.classList.remove('selected'));

    if (selectedPlayer === element) {
        // Deselect if clicking same player
        selectedPlayer = null;
        return;
    }

    // Select new player
    selectedPlayer = element;
    element.classList.add('selected');

    // Show move options
    showMoveOptions(element.textContent);
}

function showMoveOptions(playerName) {
    // Create a simple modal with move options
    const modal = document.createElement('div');
    modal.className = 'move-options-modal';
    modal.innerHTML = `
        <div class="move-options-content">
            <h3>Move ${playerName}</h3>
            <button onclick="movePlayerTo('available')" class="btn primary-btn">Available Players</button>
            <button onclick="movePlayerTo('team1')" class="btn primary-btn">Team 1</button>
            <button onclick="movePlayerTo('team2')" class="btn primary-btn">Team 2</button>
            <button onclick="movePlayerTo('team1-leader')" class="btn secondary-btn">Team 1 Leader</button>
            <button onclick="movePlayerTo('team2-leader')" class="btn secondary-btn">Team 2 Leader</button>
            <button onclick="closeMoveOptions()" class="btn danger-btn">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function movePlayerTo(destination) {
    if (!selectedPlayer) return;

    const playerName = selectedPlayer.textContent;

    switch (destination) {
        case 'available':
            handleDropToAvailable(playerName);
            break;
        case 'team1':
            handleDropToTeam(playerName, 1);
            break;
        case 'team2':
            handleDropToTeam(playerName, 2);
            break;
        case 'team1-leader':
            handleDropToLeader(playerName, 1);
            break;
        case 'team2-leader':
            handleDropToLeader(playerName, 2);
            break;
    }

    closeMoveOptions();
}

function closeMoveOptions() {
    const modal = document.querySelector('.move-options-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }

    // Clear selection
    if (selectedPlayer) {
        selectedPlayer.classList.remove('selected');
        selectedPlayer = null;
    }
}

function handleQuickMoveToAvailable(element) {
    const playerName = element.textContent;
    const currentLocation = getPlayerLocation(playerName);

    if (currentLocation !== 'available') {
        handleDropToAvailable(playerName);
    }
}

// --- Team Setup Management ---
function setupTeamManagement() {
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerNameInput = document.getElementById('player-name-input');
    const confirmTeamsBtn = document.getElementById('confirm-teams-btn');

    if (addPlayerBtn && playerNameInput) {
        addPlayerBtn.addEventListener('click', addPlayerToSetup);
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addPlayerToSetup();
            }
        });
    }

    if (confirmTeamsBtn) {
        confirmTeamsBtn.addEventListener('click', () => {
            if (validateTeamSetup()) {
                confirmTeamsBtn.style.transform = 'scale(0.95)';
                confirmTeamsBtn.style.background = 'var(--text-color-light)';
                confirmTeamsBtn.style.color = 'var(--primary-bg)';

                setTimeout(() => {
                    transitionToScreen('team-setup-screen', 'word-generation-screen');
                    startWordGeneration();
                }, 200);
            }
        });
    }
}

function addPlayerToSetup() {
    const playerNameInput = document.getElementById('player-name-input');
    const playerName = playerNameInput.value.trim();

    if (!playerName) return;

    // Check if name already exists
    const existingPlayers = document.querySelectorAll('.player[data-player-name]');
    const nameExists = Array.from(existingPlayers).some(p =>
        p.dataset.playerName.toLowerCase() === playerName.toLowerCase()
    );

    if (nameExists) {
        showErrorModal('A player with this name already exists!');
        return;
    }

    // Check player limit
    if (existingPlayers.length >= numberOfPlayers) {
        showErrorModal(`You can only add ${numberOfPlayers} players!`);
        return;
    }

    // Add player to available players
    const availableContainer = document.getElementById('available-players-setup');
    const playerElement = createSetupPlayerElement(playerName);
    availableContainer.appendChild(playerElement);

    playerNameInput.value = '';

    // Only focus on desktop, not mobile to prevent keyboard issues
    if (!isMobileDevice()) {
        playerNameInput.focus();
    }
}

function createSetupPlayerElement(playerName) {
    const playerElement = document.createElement('div');
    playerElement.className = 'player';
    playerElement.textContent = playerName;
    playerElement.dataset.playerName = playerName;
    playerElement.draggable = true;

    // Add drag and drop for team setup
    playerElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', playerName);
    });

    // Add touch support for mobile
    if (isMobileDevice()) {
        addTouchSupport(playerElement);
        addSimpleTouchFallback(playerElement);
    }

    return playerElement;
}

function validateTeamSetup() {
    const team1Leader = document.getElementById('team1-leader-container').children.length > 0;
    const team2Leader = document.getElementById('team2-leader-container').children.length > 0;
    const team1Players = document.getElementById('team1-players-setup').children.length;
    const team2Players = document.getElementById('team2-players-setup').children.length;

    if (!team1Leader || !team2Leader) {
        showErrorModal('Each team needs a leader!');
        return false;
    }

    if (team1Players === 0 || team2Players === 0) {
        showErrorModal('Each team needs at least one player besides the leader!');
        return false;
    }

    const totalAssigned = team1Players + team2Players + 2; // +2 for leaders
    const availablePlayers = document.getElementById('available-players-setup').children.length;

    if (availablePlayers > 0) {
        showErrorModal('Please assign all players to teams!');
        return false;
    }

    return true;
}

function startWordGeneration() {
    // Show loading spinner
    const spinner = document.querySelector('.loading-spinner');
    const wordSection = document.querySelector('.word-section');
    const gameInfo = document.querySelector('.game-info');
    const startButton = document.getElementById('final-start-game-btn');

    if (spinner) spinner.style.display = 'block';
    if (wordSection) wordSection.style.opacity = '0';
    if (gameInfo) gameInfo.style.opacity = '0';
    if (startButton) startButton.style.display = 'none';

    // Update game info
    document.getElementById('final-player-count').textContent = numberOfPlayers;
    document.getElementById('final-round-count').textContent = totalRounds;
    document.getElementById('final-difficulty').textContent = gameDifficulty.charAt(0).toUpperCase() + gameDifficulty.slice(1);

    // Generate word after delay for effect
    setTimeout(async () => {
        await generateNewWord();

        if (spinner) spinner.style.display = 'none';
        if (wordSection) {
            wordSection.style.opacity = '1';
        }
        if (gameInfo) gameInfo.style.opacity = '1';

        // Show start game button instead of auto-starting
        if (startButton) {
            startButton.style.display = 'block';
            startButton.style.opacity = '1';
        }
    }, 1500);
}

function finalizeGameSetup() {
    // Transfer setup data to main game
    players.available = [];
    players.team1 = [];
    players.team2 = [];

    // Get team 1 data
    const team1LeaderElement = document.querySelector('#team1-leader-container .player');
    if (team1LeaderElement) {
        players.team1Leader = team1LeaderElement.dataset.playerName;
    }

    const team1PlayerElements = document.querySelectorAll('#team1-players-setup .player');
    team1PlayerElements.forEach(el => {
        players.team1.push(el.dataset.playerName);
    });

    // Get team 2 data
    const team2LeaderElement = document.querySelector('#team2-leader-container .player');
    if (team2LeaderElement) {
        players.team2Leader = team2LeaderElement.dataset.playerName;
    }

    const team2PlayerElements = document.querySelectorAll('#team2-players-setup .player');
    team2PlayerElements.forEach(el => {
        players.team2.push(el.dataset.playerName);
    });

    // Hide setup screens and transition to game
    const wordScreen = document.getElementById('word-generation-screen');
    const gameContainer = document.getElementById('game-container');
    const progressIndicator = document.querySelector('.setup-progress');

    // Hide progress indicator
    if (progressIndicator) {
        progressIndicator.style.opacity = '0';
        setTimeout(() => progressIndicator.remove(), 500);
    }

    // Smooth transition to game
    wordScreen.style.transform = 'translateX(-100%)';
    wordScreen.style.opacity = '0';

    setTimeout(() => {
        wordScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        gameContainer.style.opacity = '0';
        gameContainer.style.transform = 'translateX(100%)';

        // Animate game container in
        setTimeout(() => {
            gameContainer.style.transition = 'all 0.5s ease';
            gameContainer.style.opacity = '1';
            gameContainer.style.transform = 'translateX(0)';

            // Start the game after transition
            setTimeout(() => {
                startGame();
            }, 500);
        }, 50);
    }, 500);
}

// --- Team Setup Drag and Drop ---
function initializeTeamSetupDragDrop() {
    const dropZones = document.querySelectorAll('#team1-leader-container, #team2-leader-container, #team1-players-setup, #team2-players-setup, #available-players-setup');

    dropZones.forEach(zone => {
        // Desktop drag and drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('drag-over');
            }
        });

        // Mobile touch support
        if (isMobileDevice()) {
            zone.style.touchAction = 'none';
            zone.style.webkitUserSelect = 'none';
            zone.style.userSelect = 'none';
        }

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const playerName = e.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector(`[data-player-name="${playerName}"]`);

            if (!draggedElement) return;

            // Remove from current location
            draggedElement.remove();

            // Add to new location
            if (zone.id.includes('leader') && zone.children.length > 0) {
                // Leader slot is full, move existing leader to available
                const existingLeader = zone.children[0];
                document.getElementById('available-players-setup').appendChild(existingLeader);
            }

            zone.appendChild(draggedElement);
        });
    });
}

// Initialize team setup drag and drop when the screen becomes active
function initializeTeamSetup() {
    initializeTeamSetupDragDrop();

    // Focus on player name input (but not on mobile to prevent keyboard issues)
    const playerNameInput = document.getElementById('player-name-input');
    if (playerNameInput && !isMobileDevice()) {
        setTimeout(() => playerNameInput.focus(), 100);
    }

    // Ensure mobile input works properly
    if (playerNameInput && isMobileDevice()) {
        playerNameInput.style.fontSize = '16px';
        playerNameInput.style.webkitAppearance = 'none';
        playerNameInput.style.appearance = 'none';
        playerNameInput.style.touchAction = 'manipulation';
        playerNameInput.style.webkitUserSelect = 'text';
        playerNameInput.style.userSelect = 'text';
    }
}

// --- Team Setup Specific Drag and Drop Handlers ---
function handleTeamSetupDropToLeader(playerName, teamNumber) {
    const leaderContainer = document.getElementById(`team${teamNumber}-leader-container`);
    const availableContainer = document.getElementById('available-players-setup');
    const draggedElement = document.querySelector(`[data-player-name="${playerName}"]`);

    if (!draggedElement || !leaderContainer || !availableContainer) return;

    // Check if leader slot is already occupied
    if (leaderContainer.children.length > 0) {
        // Move existing leader back to available
        const existingLeader = leaderContainer.children[0];
        availableContainer.appendChild(existingLeader);
    }

    // Remove dragged element from its current location
    draggedElement.remove();

    // Add to leader slot
    leaderContainer.appendChild(draggedElement);
}

function handleTeamSetupDropToTeam(playerName, teamNumber) {
    const playersContainer = document.getElementById(`team${teamNumber}-players-setup`);
    const draggedElement = document.querySelector(`[data-player-name="${playerName}"]`);

    if (!draggedElement || !playersContainer) return;

    // Check team size limit
    const currentTeamSize = getTeamSize(teamNumber);
    if (currentTeamSize >= maxTeamSize) {
        showErrorModal(`Team ${teamNumber} is full!`);
        return;
    }

    // Remove dragged element from its current location
    draggedElement.remove();

    // Add to team players
    playersContainer.appendChild(draggedElement);
}

function handleTeamSetupDropToAvailable(playerName) {
    const availableContainer = document.getElementById('available-players-setup');
    const draggedElement = document.querySelector(`[data-player-name="${playerName}"]`);

    if (!draggedElement || !availableContainer) return;

    // Remove dragged element from its current location
    draggedElement.remove();

    // Add to available players
    availableContainer.appendChild(draggedElement);
}
