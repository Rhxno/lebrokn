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

// At the top of your script, outside any function:
let draggedItem = null;
let originalParent = null;
let originalNextSibling = null;
let offsetX = 0;
let offsetY = 0;

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
    const availablePlayersElement = document.getElementById('available-players');
    availablePlayersElement.innerHTML = '';
    players.available.forEach(playerId => {
        const playerElement = document.getElementById(playerId);
        availablePlayersElement.appendChild(playerElement);
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

// --- Drag and Drop ---
function allowDrop(event) {
    event.preventDefault();
}

// --- Touch Drag-and-Drop Handlers ---

// offsetX/Y will store the distance from the element's top-left corner
// to the initial touch point, calculated using PAGE coordinates.
function handleTouchStart(event) {
    if (gameStarted) return;
    event.preventDefault();
    console.log("Touch Start:", event.target.textContent);

    draggedItem = event.target;
    originalParent = draggedItem.parentNode;
    originalNextSibling = draggedItem.nextSibling;

    const touch = event.touches[0];
    const rect = draggedItem.getBoundingClientRect();

    // --- Calculate offset using PAGE coordinates ---
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const elementPageX = rect.left + scrollX;
    const elementPageY = rect.top + scrollY;
    offsetX = touch.pageX - elementPageX;
    offsetY = touch.pageY - elementPageY;
    // --- End offset calculation ---

    // Apply dragging styles and fixed positioning
    draggedItem.classList.add('dragging');
    draggedItem.style.position = 'fixed';
    draggedItem.style.zIndex = '1000';
    draggedItem.style.left = '';
    draggedItem.style.top = '';
    draggedItem.style.transform = '';

    // --- Defer initial positioning ---
    requestAnimationFrame(() => {
        if (!draggedItem) return;
        const initialX = touch.pageX - offsetX - window.pageXOffset;
        const initialY = touch.pageY - offsetY - window.pageYOffset;
        draggedItem.style.left = `${initialX}px`;
        draggedItem.style.top = `${initialY}px`;
        console.log("Initial Position Applied (RAF):", `left: ${initialX}px, top: ${initialY}px`);
        console.log(`  Touch PageY: ${touch.pageY}, ScrollY: ${window.pageYOffset}, OffsetY (page-based): ${offsetY}`);
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
    // Restore position in original parent
    if (draggedItem && originalParent) {
        // Remove fixed positioning BEFORE re-inserting
        draggedItem.style.position = '';
        // *** Clear top/left instead of transform ***
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem.style.zIndex = '';
        // draggedItem.style.transform = ''; // Not using transform
        draggedItem.classList.remove('dragging');

        // Re-insert into original position
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
            originalParent.insertBefore(draggedItem, originalNextSibling);
        } else {
            originalParent.appendChild(draggedItem);
        }
    }

    // Clear state variables
    draggedItem = null;
    originalParent = null;
    originalNextSibling = null;
    removeDropTargetHighlight(); // Ensure highlight is cleared
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.textContent);
    console.log("Dragging player:", event.target.textContent);
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
            updatePlayerDropdowns();
        });
    }
}

function dropLeader(ev, teamNumber) {
    ev.preventDefault();
    if (gameStarted) return;

    const playerName = ev.dataTransfer.getData("text");
    const leaderElement = document.getElementById(`team${teamNumber}-leader`);

    const team = `team${teamNumber}`;

    if (players[team].length >= maxTeamSize) {
        showErrorModal(`Team ${team} is already full (max ${maxTeamSize} players)!`);
        return;
    }

    showConfirmationDialog(`Are you sure you want to make ${playerName} the leader of Team ${teamNumber}?`, () => {
        removePlayerFromAllGroups(playerName);
        leaderElement.textContent = playerName;
        players[team] = [playerName];
        updateTeamPlayersDisplay();
        updateAvailablePlayersDisplay();
        updatePlayerDropdowns();
    });
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

function handleTeamDrop(event, teamNumber, isLeaderSlot) {
    event.preventDefault();
    if (gameStarted) return false;

    const playerName = event.dataTransfer.getData("text/plain");
    if (!playerName) {
        console.error("No player name found in drag data during handleTeamDrop");
        return false;
    }

    const team = `team${teamNumber}`;

    // --- Leader Slot Logic ---
    if (isLeaderSlot) {
        const existingLeader = teamNumber === 1 ? players.team1Leader : players.team2Leader;

        if (existingLeader === playerName) {
            showErrorModal("Cannot switch a player with themselves!");
            return false;
        }

        if (existingLeader) {
            showConfirmationDialog(
                `Switch positions between ${existingLeader} (Leader) and ${playerName}?`,
                () => {
                    const currentTeamOfPlayer = getPlayerCurrentTeam(playerName);
                    removePlayerFromAllGroups(playerName);
                    removePlayerFromAllGroups(existingLeader);

                    if (teamNumber === 1) players.team1Leader = playerName;
                    else players.team2Leader = playerName;

                    if (currentTeamOfPlayer === 1) players.team1.push(existingLeader);
                    else if (currentTeamOfPlayer === 2) players.team2.push(existingLeader);
                    else players.available.push(existingLeader);

                    updateTeamPlayersDisplay();
                    updateAvailablePlayersDisplay();
                },
                () => {
                    resetDraggedItem();
                }
            );
            return true;
        } else {
            if (players[team].length + (players[`team${teamNumber}Leader`] ? 0 : 1) > maxTeamSize) {
                showErrorModal(`Team ${teamNumber} is already full (max ${maxTeamSize} players)!`);
                return false;
            }
            showConfirmationDialog(
                `Make ${playerName} the leader of Team ${teamNumber}?`,
                () => {
                    removePlayerFromAllGroups(playerName);
                    if (teamNumber === 1) players.team1Leader = playerName;
                    else players.team2Leader = playerName;
                    updateTeamPlayersDisplay();
                    updateAvailablePlayersDisplay();
                },
                () => {
                    resetDraggedItem();
                }
            );
            return true;
        }
    } else {
        if (players[team].length + (players[`team${teamNumber}Leader`] ? 1 : 0) >= maxTeamSize) {
            showErrorModal(`Team ${teamNumber} is already full (max ${maxTeamSize} players)!`);
            return false;
        }

        const sourceTeam = getPlayerCurrentTeam(playerName);
        const sourceIsAvailable = players.available.includes(playerName);

        if (
            (sourceTeam === teamNumber && !isLeaderSlot) ||
            (sourceIsAvailable && event.target.closest('#available-players')) ||
            (sourceTeam === 1 && players.team1Leader === playerName && isLeaderSlot && teamNumber === 1) ||
            (sourceTeam === 2 && players.team2Leader === playerName && isLeaderSlot && teamNumber === 2)
        ) {
            return false;
        }

        if (sourceTeam !== null || sourceIsAvailable) {
            showConfirmationDialog(
                `Move ${playerName} to Team ${teamNumber}?`,
                () => {
                    removePlayerFromAllGroups(playerName);
                    players[team].push(playerName);
                    updateTeamPlayersDisplay();
                    updateAvailablePlayersDisplay();
                },
                () => {
                    resetDraggedItem();
                }
            );
            return true;
        } else {
            console.warn(`Player ${playerName} not found in any list during drop.`);
            return false;
        }
    }
}

// --- Touch Drag-and-Drop Handlers ---

function createPlayerElement(playerName, isLeader = false) {
    const playerElement = document.createElement('div');
    playerElement.className = isLeader ? 'player leader locked' : 'player';
    playerElement.draggable = !isLeader;
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
                    const targetTeamNumber = teamContainer
                        ? parseInt(teamContainer.id.replace('team', ''))
                        : (leaderSlot ? parseInt(leaderSlot.closest('.team').id.replace('team', '')) : null);

                    if (targetTeamNumber) {
                        droppedInValidZone = true;
                        const simulatedEvent = {
                            preventDefault: () => {},
                            dataTransfer: {
                                getData: (format) => (format === "text/plain" ? draggedItem.textContent : null)
                            },
                            target: dropTargetElement
                        };
                        requiresConfirmation = handleTeamDrop(simulatedEvent, targetTeamNumber, !!leaderSlot);
                    }
                } else if (availablePlayersContainer && originalParent !== availablePlayersContainer) {
                    droppedInValidZone = true;
                    const sourceTeam = getPlayerCurrentTeam(draggedItem.textContent);
                    if (sourceTeam) {
                        requiresConfirmation = true;
                        showConfirmationDialog(
                            `Move ${draggedItem.textContent} back to Available Players?`,
                            () => {
                                removePlayerFromAllGroups(draggedItem.textContent);
                                players.available.push(draggedItem.textContent);
                                updateTeamPlayersDisplay();
                                updateAvailablePlayersDisplay();
                            },
                            () => {
                                resetDraggedItem();
                            }
                        );
                    } else {
                        droppedInValidZone = false;
                        requiresConfirmation = false;
                    }
                }
            }

            if (!droppedInValidZone || (droppedInValidZone && !requiresConfirmation)) {
                resetDraggedItem();
            }
        }, { passive: false });

        playerElement.addEventListener('dragstart', drag);
    }

    if (isLeader) {
        playerElement.classList.add('locked');
    }

    return playerElement;
}

function resetDraggedItem() {
    if (draggedItem && originalParent) {
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
            originalParent.insertBefore(draggedItem, originalNextSibling);
        } else {
            originalParent.appendChild(draggedItem);
        }
    }
    if (draggedItem) {
        draggedItem.style.position = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem.style.zIndex = '';
        draggedItem.style.transform = ''; // *** Clear the transform ***
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
    originalParent = null;
    originalNextSibling = null;
    removeDropTargetHighlight();
}

function removeDropTargetHighlight() {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
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
            wordElement.style.backgroundColor = 'transparent';
            wordElement.style.color = 'var(--text-color-light)';
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

    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('referee-controls').style.display = 'block';

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

    // Hide setup sections, show game controls
    document.querySelector('.game-setup').style.display = 'none';
    document.querySelector('.setup-section').style.display = 'none';
    document.querySelector('.game-controls').style.display = 'block';
    document.querySelector('.word-section').style.display = 'block';

    console.log("Game started successfully with word:", currentWord);
}

async function generateNewWord() {
    try {
        currentWord = await fetchRandomWord();
        const wordElement = document.getElementById('current-word');
        const toggleButton = document.getElementById('toggle-word-btn');
        
        if (wordElement && currentWord) {
            wordElement.textContent = currentWord;
            isWordVisible = true;
            wordElement.style.backgroundColor = 'transparent';
            wordElement.style.color = 'var(--text-color-light)';
            toggleButton.textContent = 'Hide Word';
        }
    } catch (error) {
        console.error('Error generating word:', error);
    }
}

function toggleWordVisibility() {
    if (!currentWord) return;
    
    const wordElement = document.getElementById('current-word');
    const toggleButton = document.getElementById('toggle-word-btn');
    
    isWordVisible = !isWordVisible;
    
    if (isWordVisible) {
        wordElement.style.backgroundColor = 'transparent';
        wordElement.style.color = 'var(--text-color-light)';
        toggleButton.textContent = 'Hide Word';
    } else {
        wordElement.style.backgroundColor = '#000';
        wordElement.style.color = '#000';
        toggleButton.textContent = 'Show Word';
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
    document.getElementById('referee-controls').style.display = 'none';

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

// --- Screen Transitions and Difficulty Selection ---
let selectedPlayerCount = 0;

function selectPlayerCount(playerCount) {
    numberOfPlayers = playerCount;
    const playerSelectScreen = document.getElementById('player-select-screen');
    const difficultySelectScreen = document.getElementById('difficulty-select-screen');
    
    playerSelectScreen.style.opacity = '0';
    playerSelectScreen.style.visibility = 'hidden';
    
    setTimeout(() => {
        difficultySelectScreen.classList.add('active');
    }, 500);
}

function selectRounds(rounds) {
    totalRounds = rounds;
    // Update the round input field visually (optional)
    const roundsInput = document.getElementById('rounds');
    if (roundsInput) roundsInput.value = rounds;

    const roundScreen = document.getElementById('round-select-screen');
    const gameContainer = document.getElementById('game-container');

    roundScreen.style.opacity = '0';
    roundScreen.style.visibility = 'hidden';
    roundScreen.style.display = 'none';

    setTimeout(() => {
        gameContainer.style.opacity = '1';
        gameContainer.style.visibility = 'visible';
        gameContainer.style.display = 'block';

        document.querySelector('.game-setup').style.display = 'block';
        document.querySelector('.setup-section').style.display = 'block';
        document.querySelector('.game-controls').style.display = 'block';

        // --- Generate the INITIAL word when this screen appears ---
        if (!currentWord) {
            generateNewWord();
        }
        // -----------------------------------------------------------
    }, 300);
}

function selectDifficulty(difficulty) {
    gameDifficulty = difficulty;
    const difficultyScreen = document.getElementById('difficulty-select-screen');
    const roundScreen = document.getElementById('round-select-screen');

    difficultyScreen.style.opacity = '0';
    difficultyScreen.style.visibility = 'hidden';

    setTimeout(() => {
        roundScreen.style.opacity = '1';
        roundScreen.style.visibility = 'visible';
        roundScreen.style.display = 'flex';
    }, 300);
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
            maxTeamSize = Math.ceil(numberOfPlayers / 2); // <-- ADD THIS LINE
            teamsConfig.team1.maxPlayers = maxTeamSize;
            teamsConfig.team2.maxPlayers = maxTeamSize;
            console.log("Number of players confirmed:", numberOfPlayers);

            // Example modification in your script.js
            // Inside confirmPlayerCountBtn click listener:
            playerSelectScreen.classList.remove('active'); // Hide current

            // Show next screen
            const difficultySelectScreen = document.getElementById('difficulty-select-screen');
            if (difficultySelectScreen) {
                difficultySelectScreen.classList.add('active');
            }
        });
    }

    const difficultySelectScreen = document.getElementById('difficulty-select-screen');
    if (difficultySelectScreen) {
        // Initially hide it if it's not the first screen.
    }

    document.getElementById('player-select-screen').style.opacity = '1';
    document.getElementById('player-select-screen').style.visibility = 'visible';
    document.getElementById('difficulty-select-screen').classList.remove('active');
    
    updateAvailablePlayersDisplay();
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    const toggleButton = document.getElementById('toggle-word-btn');
    toggleButton.replaceWith(toggleButton.cloneNode(true));
    
    document.getElementById('toggle-word-btn').addEventListener('click', toggleWordVisibility);

    document.querySelectorAll('.team-log').forEach(log => {
        log.style.display = 'none';
    });
    document.getElementById('team1-word-log').closest('.team-log').style.display = 'block';

    initializeSpeechRecognition();
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
    const availablePlayersDiv = document.getElementById('available-players');
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