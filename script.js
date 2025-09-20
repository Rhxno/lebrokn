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
// Removed unused variables: currentGuesser, currentHintGiver
let gameLog = [];
let totalRounds = 1;
let currentRound = 0;
let numberOfPlayers = 0; // To store selected number of players
let gameDifficulty = 'easy'; // Default difficulty
let isWordVisible = true; // Track word visibility state - INITIAL STATE IS NOW TRUE (VISIBLE)
let selectedRoundsCount = 1; // Track selected rounds count globally
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
                const currentLeaderName = teamNumber === 1 ? players.team1Leader : players.team2Leader;
                const teamName = currentLeaderName ? `${currentLeaderName}'s team` : `Team ${teamNumber}`;
                showErrorModal(`It's not ${teamName}'s turn!`);
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
// Removed deprecated addPlayer() function - using DOM-based team setup system

// Removed deprecated player management functions - using DOM-based system

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
        event.stopPropagation();
        return false;
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
    if (gameStarted) {
        clearDropZoneHighlights();
        resetDraggedElement();
        return;
    }

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

function showConfirmationDialog(message, onConfirmCallback, onCancelCallback = resetDraggedElement) {
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
            resetDraggedElement();
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
        if (gameStarted) {
            e.preventDefault();
            return;
        }
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
        if (gameStarted) {
            e.preventDefault();
            return;
        }
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
        if (gameStarted) {
            e.preventDefault();
            return;
        }
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
    if (gameStarted) {
        return;
    }

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
    // Prevent drag and drop during game
    if (gameStarted) {
        cleanupTouchDrag(element);
        clearDropZoneHighlights();
        resetDraggedElement();
        return;
    }

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
    playerElement.setAttribute('data-player-name', playerName);
    playerElement.dataset.playerName = playerName;

    if (!isLeader && !gameStarted) {
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

    // Disable all 'Generate Word' buttons after game starts
    const generateWordButtons = document.querySelectorAll('button[onclick*="generateNew"]');
    generateWordButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
        button.title = 'Word generation disabled during gameplay';
    });

    // Hide setup screens and show game container
    document.querySelectorAll('.setup-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'block';
    gameContainer.style.visibility = 'visible';
    gameContainer.style.opacity = '1';

    // Update team log headers with leader names
    updateTeamLogHeaders();

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
    // Prevent word generation during active gameplay
    if (gameStarted) {
        showErrorModal('Cannot generate new word during gameplay! The word has already been chosen.');
        return;
    }

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

            // Adjust font size for long words on mobile
            adjustWordFontSize(wordElement, currentWord);

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

            // Adjust font size for long words on mobile
            adjustWordFontSize(gameWordElement, currentWord);
        }
    } catch (error) {
        console.error('Error generating word:', error);
    }
}

// Function to adjust font size based on word length
function adjustWordFontSize(element, word) {
    if (!element || !word) return;

    const isMobile = window.innerWidth <= 768;
    const wordLength = word.length;

    if (isMobile) {
        if (wordLength <= 6) {
            element.style.fontSize = '1.3rem';
        } else if (wordLength <= 10) {
            element.style.fontSize = '1.1rem';
        } else if (wordLength <= 14) {
            element.style.fontSize = '0.9rem';
        } else {
            element.style.fontSize = '0.8rem';
        }
    } else {
        if (wordLength <= 6) {
            element.style.fontSize = '1.8rem';
        } else if (wordLength <= 10) {
            element.style.fontSize = '1.5rem';
        } else if (wordLength <= 14) {
            element.style.fontSize = '1.2rem';
        } else {
            element.style.fontSize = '1rem';
        }
    }
}

// Function to update team log headers with leader names
function updateTeamLogHeaders() {
    const team1LogHeader = document.querySelector('.team-log:first-child h3');
    const team2LogHeader = document.querySelector('.team-log:last-child h3');

    if (team1LogHeader && players.team1Leader) {
        team1LogHeader.textContent = `${players.team1Leader}'s Team Log`;
    }

    if (team2LogHeader && players.team2Leader) {
        team2LogHeader.textContent = `${players.team2Leader}'s Team Log`;
    }

    // Also update placeholders and aria labels
    const team1Input = document.getElementById('team1-word-log');
    const team2Input = document.getElementById('team2-word-log');
    const team1MicBtn = document.getElementById('mic-btn-1');
    const team2MicBtn = document.getElementById('mic-btn-2');

    if (team1Input && players.team1Leader) {
        team1Input.placeholder = `Enter word for ${players.team1Leader}'s team`;
    }

    if (team2Input && players.team2Leader) {
        team2Input.placeholder = `Enter word for ${players.team2Leader}'s team`;
    }

    if (team1MicBtn && players.team1Leader) {
        team1MicBtn.setAttribute('aria-label', `Use Microphone for ${players.team1Leader}'s team`);
    }

    if (team2MicBtn && players.team2Leader) {
        team2MicBtn.setAttribute('aria-label', `Use Microphone for ${players.team2Leader}'s team`);
    }
}

// Function for generating new word during game
async function generateNewGameWord() {
    // This function should not be called during gameplay
    if (gameStarted) {
        showErrorModal('Cannot generate new word during gameplay! The word has already been chosen.');
        return;
    }
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

    const currentLeaderName = currentTeam === 1 ? players.team1Leader : players.team2Leader;
    // Fix null team leader issue
    const currentTeamName = currentLeaderName ? `${currentLeaderName}'s Team` : `Team ${currentTeam}`;
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
        const teamLeaderName = teamNumber === 1 ? players.team1Leader : players.team2Leader;
        const teamName = teamLeaderName ? `${teamLeaderName}'s team` : `Team ${teamNumber}`;
        showErrorModal(`It's not ${teamName}'s turn!`);
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
        const teamLeaderName = teamNumber === 1 ? players.team1Leader : players.team2Leader;
        showErrorModal(`${teamLeaderName}'s team guessed the password!`);
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
    const currentLeaderName = currentTeam === 1 ? players.team1Leader : players.team2Leader;
    const victoryMessage = `
        ${currentLeaderName}'s Team Wins Round ${currentRound + 1}!
    `;

    showErrorModal(victoryMessage, true);
    currentRound++;

    if (currentRound >= totalRounds) {
        setTimeout(() => {
            const finalMessage = `
                Game Over!<br>
                <span class="final-score">Final Score: ${currentLeaderName}'s Team Wins!</span>
            `;
            showErrorModal(finalMessage, true);
            endGame();
        }, 2000);
    } else {
        setTimeout(() => {
            // Continue with the same word for the next round
            // No new word generation - teams continue guessing the same word
            switchTeams();
            showTurnOverlay();
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

    // Calculate game statistics
    const correctGuesses = gameLog.filter(entry => entry.type === 'correct-guess');
    const totalWords = gameLog.filter(entry => entry.type === 'word-generated').length;
    const team1Correct = correctGuesses.filter(guess => guess.team === 1).length;
    const team2Correct = correctGuesses.filter(guess => guess.team === 2).length;
    const team1Hints = gameLog.filter(entry => entry.type === 'hint' && entry.team === 1).length;
    const team2Hints = gameLog.filter(entry => entry.type === 'hint' && entry.team === 2).length;
    const successRate = totalWords > 0 ? Math.round((correctGuesses.length / totalWords) * 100) : 0;

    // Update summary statistics
    document.getElementById('total-words').textContent = totalWords;
    document.getElementById('correct-count').textContent = correctGuesses.length;
    document.getElementById('success-rate').textContent = `${successRate}%`;

    // Update team statistics
    document.getElementById('team1-correct').textContent = team1Correct;
    document.getElementById('team1-hints').textContent = team1Hints;
    document.getElementById('team2-correct').textContent = team2Correct;
    document.getElementById('team2-hints').textContent = team2Hints;

    // Determine and display winner
    const winningTeam = document.getElementById('winning-team');
    const winnerText = document.getElementById('winner-text');
    const winnerMessage = document.getElementById('winner-message');

    if (team1Correct > team2Correct) {
        winnerText.textContent = '🏆 Team 1 Wins!';
        winnerMessage.textContent = `Team 1 guessed ${team1Correct} words correctly!`;
        document.getElementById('team1-result').classList.add('winner');
        winningTeam.style.display = 'block';
    } else if (team2Correct > team1Correct) {
        winnerText.textContent = '🏆 Team 2 Wins!';
        winnerMessage.textContent = `Team 2 guessed ${team2Correct} words correctly!`;
        document.getElementById('team2-result').classList.add('winner');
        winningTeam.style.display = 'block';
    } else {
        winnerText.textContent = '🤝 It\'s a Tie!';
        winnerMessage.textContent = `Both teams guessed ${team1Correct} words correctly!`;
        document.getElementById('team1-result').classList.add('tie');
        document.getElementById('team2-result').classList.add('tie');
        winningTeam.style.display = 'block';
    }

    // Display detailed game log
    const detailedLog = document.getElementById('detailed-log');
    const logEntries = gameLog.filter(entry => entry.type === 'correct-guess' || entry.type === 'hint');

    detailedLog.innerHTML = logEntries.map(entry => {
        const icon = entry.type === 'correct-guess' ? '✅' : '💡';
        const typeText = entry.type === 'correct-guess' ? 'Guessed' : 'Hinted';
        return `
            <div class="log-entry ${entry.type}">
                <span class="log-icon">${icon}</span>
                <span class="log-text">
                    <strong>${entry.player}</strong> (Team ${entry.team}) ${typeText}: 
                    <em>"${entry.word}"</em>
                </span>
            </div>
        `;
    }).join('');
}

// Removed hint effectiveness calculation functions - no longer needed

// New game control functions
function startNewGame() {
    // Reset game state but keep teams
    gameLog = [];
    currentRound = 0;
    currentWord = '';
    gameStarted = false;

    // Reset team result classes
    document.getElementById('team1-result').classList.remove('winner', 'tie');
    document.getElementById('team2-result').classList.remove('winner', 'tie');

    // Hide results and show game container properly
    const resultsSection = document.getElementById('results');
    const gameContainer = document.getElementById('game-container');

    resultsSection.style.display = 'none';
    resultsSection.classList.remove('show');

    // Show game container with proper visibility
    gameContainer.style.display = 'flex';
    gameContainer.style.visibility = 'visible';
    gameContainer.style.opacity = '1';

    // Clear team logs
    document.getElementById('team1-word-display').innerHTML = '';
    document.getElementById('team2-word-display').innerHTML = '';

    // Reset current team and player indices
    currentTeam = 1;
    currentPlayerIndex = { 1: 0, 2: 0 };

    // Generate new word and start game
    generateNewWord().then(() => {
        startGame();
    });

    console.log('Starting new game with same teams');
}

function backToSetup() {
    // Reset everything and go back to player selection
    gameLog = [];
    currentRound = 0;
    currentWord = '';
    gameStarted = false;
    numberOfPlayers = 0;
    gameDifficulty = 'easy';
    totalRounds = 1;

    // Reset players
    players = {
        available: [],
        team1: [],
        team2: [],
        team1Leader: null,
        team2Leader: null
    };

    // Reset team result classes
    document.getElementById('team1-result').classList.remove('winner', 'tie');
    document.getElementById('team2-result').classList.remove('winner', 'tie');

    // Hide game and results completely
    const gameContainer = document.getElementById('game-container');
    const resultsSection = document.getElementById('results');

    gameContainer.style.display = 'none';
    gameContainer.style.visibility = 'hidden';
    gameContainer.style.opacity = '0';

    resultsSection.style.display = 'none';
    resultsSection.classList.remove('show');

    // Reset all setup screens
    document.querySelectorAll('.setup-screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
        screen.style.opacity = '0';
        screen.style.transform = 'translateX(100%)';
    });

    // Show first setup screen properly
    const playerSelectScreen = document.getElementById('player-select-screen');
    playerSelectScreen.classList.add('active');
    playerSelectScreen.style.display = 'flex';
    playerSelectScreen.style.opacity = '1';
    playerSelectScreen.style.transform = 'translateX(0)';
    playerSelectScreen.style.visibility = 'visible';

    // Reset slider values
    const playerSlider = document.getElementById('player-slider-input');
    const sliderValue = document.getElementById('slider-value');
    if (playerSlider && sliderValue) {
        playerSlider.value = 4;
        sliderValue.textContent = '4';
    }

    const roundSlider = document.getElementById('round-slider-input');
    const roundSliderValue = document.getElementById('round-slider-value');
    if (roundSlider && roundSliderValue) {
        roundSlider.value = 1;
        roundSliderValue.textContent = '1';
    }

    // Clear team setup containers
    const containers = [
        'available-players-setup',
        'team1-leader-container',
        'team2-leader-container',
        'team1-players-setup',
        'team2-players-setup'
    ];

    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    });

    console.log('Returning to setup');
}

// Removed incomplete calculateSimilarity function - no longer needed

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

function selectDifficulty(difficulty, event) {
    console.log('Difficulty selected:', difficulty);
    gameDifficulty = difficulty;

    // Clear previous selections
    document.querySelectorAll('.difficulty-slot-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.transform = '';
        btn.style.background = '';
        btn.style.color = '';
    });

    // Add visual feedback for selected difficulty
    const selectedBtn = event ? event.target : document.querySelector(`[onclick*="${difficulty}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        selectedBtn.style.transform = 'scale(0.95)';
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

    // Note: updateAvailablePlayersDisplay() removed as we use DOM-based team setup now

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
    // Clear any leftover particles if the modal wasn't closed properly
    const existingParticles = modalContent.querySelector('.code-particles');
    if (existingParticles) {
        existingParticles.innerHTML = '';
    }

    if (isVictory) {
        modalContent.classList.add('victory');
        errorMessage.innerHTML = `
            <div class="victory-message">
                <h2>System.Victory.Execute()</h2>
                <div class="victory-stats">
                     ${message}
                </div>
            </div>
        `;
        setTimeout(triggerCodeParticles, 100);
    } else {
        errorMessage.innerHTML = `
            <div style="font-family: 'Courier New', monospace; color: #ff6b6b;">
                <strong>// Error:</strong><br>
                ${message}
            </div>
        `;
    }

    modal.classList.add('show');
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    const modalContent = modal.querySelector('.modal-content');

    if (modalContent.classList.contains('victory')) {
        const particlesContainer = modalContent.querySelector('.code-particles');
        if (particlesContainer) {
            particlesContainer.innerHTML = '';
        }
    }

    modal.classList.remove('show');
}

function triggerCodeParticles() {
    const container = document.querySelector('.modal-content.victory .victory-message');
    if (!container) return;

    // Create a dedicated particles container if it doesn't exist
    let particlesContainer = container.querySelector('.code-particles');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.className = 'code-particles';
        container.appendChild(particlesContainer);
    }

    particlesContainer.innerHTML = '';

    const codeSymbols = [
        '{ }', '[ ]', '( )', '< >',
        '++', '--', '==', '!=',
        '=>', '&&', '||', '??',
        'fn', 'if', 'for', 'let',
        '0x', '1.0', 'true', 'null',
        '//', '/*', '*/', ';'
    ];

    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'code-particle';
        particle.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];

        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        // Random timing
        const duration = Math.random() * 2 + 3; // 3-5 seconds
        const delay = Math.random() * 2; // 0-2 seconds delay

        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        // Random colors from coding theme
        const colors = ['#00ff88', '#0088ff', '#ff8800', '#888'];
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];

        particlesContainer.appendChild(particle);
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
    // Completely reset all player data
    players.available = [];
    players.team1 = [];
    players.team2 = [];
    players.team1Leader = null;
    players.team2Leader = null;

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

    // Debug: Log final player setup
    console.log('Final player setup:', {
        team1Leader: players.team1Leader,
        team1: players.team1,
        team2Leader: players.team2Leader,
        team2: players.team2
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


// --- Missing Functions ---
function removePlayerFromAllGroups(playerName) {
    // Remove from available players
    players.available = players.available.filter(name => name !== playerName);

    // Remove from team 1
    players.team1 = players.team1.filter(name => name !== playerName);
    if (players.team1Leader === playerName) {
        players.team1Leader = null;
    }

    // Remove from team 2
    players.team2 = players.team2.filter(name => name !== playerName);
    if (players.team2Leader === playerName) {
        players.team2Leader = null;
    }
}

function updateAvailablePlayersDisplay() {
    const container = document.getElementById('available-players-setup');
    if (!container) return;

    container.innerHTML = '';
    players.available.forEach(playerName => {
        const playerElement = createPlayerElement(playerName);
        container.appendChild(playerElement);
    });
}

function updateTeamPlayersDisplay() {
    // Update team 1
    const team1Container = document.getElementById('team1-players-setup');
    const team1LeaderContainer = document.getElementById('team1-leader-container');

    if (team1Container) {
        team1Container.innerHTML = '';
        players.team1.forEach(playerName => {
            const playerElement = createPlayerElement(playerName);
            team1Container.appendChild(playerElement);
        });
    }

    if (team1LeaderContainer) {
        team1LeaderContainer.innerHTML = '';
        if (players.team1Leader) {
            const leaderElement = createPlayerElement(players.team1Leader, true);
            team1LeaderContainer.appendChild(leaderElement);
        }
    }

    // Update team 2
    const team2Container = document.getElementById('team2-players-setup');
    const team2LeaderContainer = document.getElementById('team2-leader-container');

    if (team2Container) {
        team2Container.innerHTML = '';
        players.team2.forEach(playerName => {
            const playerElement = createPlayerElement(playerName);
            team2Container.appendChild(playerElement);
        });
    }

    if (team2LeaderContainer) {
        team2LeaderContainer.innerHTML = '';
        if (players.team2Leader) {
            const leaderElement = createPlayerElement(players.team2Leader, true);
            team2LeaderContainer.appendChild(leaderElement);
        }
    }
}

function showErrorModal(message) {
    const modal = document.getElementById('error-modal');
    const messageElement = document.getElementById('error-message');

    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'block';

        // Auto-close after 3 seconds
        setTimeout(() => {
            closeErrorModal();
        }, 3000);
    } else {
        // Fallback to alert if modal not found
        alert(message);
    }
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// --- Event Listeners and Initialization ---
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing game...');

    // Initialize speech recognition
    initializeSpeechRecognition();

    // Initialize drag and drop
    initializeDragAndDrop();

    // Player count slider
    const playerSlider = document.getElementById('player-slider-input');
    const sliderValue = document.getElementById('slider-value');

    if (playerSlider && sliderValue) {
        playerSlider.addEventListener('input', function () {
            numberOfPlayers = parseInt(this.value);
            sliderValue.textContent = numberOfPlayers;
            maxTeamSize = Math.floor(numberOfPlayers / 2);
        });

        // Initialize values
        numberOfPlayers = parseInt(playerSlider.value);
        sliderValue.textContent = numberOfPlayers;
        maxTeamSize = Math.floor(numberOfPlayers / 2);
    }

    // Round count slider
    const roundSlider = document.getElementById('round-slider-input');
    const roundSliderValue = document.getElementById('round-slider-value');

    if (roundSlider && roundSliderValue) {
        roundSlider.addEventListener('input', function () {
            selectedRoundsCount = parseInt(this.value);
            roundSliderValue.textContent = selectedRoundsCount;
        });

        // Initialize values
        selectedRoundsCount = parseInt(roundSlider.value);
        roundSliderValue.textContent = selectedRoundsCount;
    }

    // Confirm player count button
    const confirmPlayerBtn = document.getElementById('confirm-player-count-btn');
    if (confirmPlayerBtn) {
        confirmPlayerBtn.addEventListener('click', function () {
            transitionToScreen('player-select-screen', 'difficulty-select-screen');
        });
    }

    // Confirm round count button
    const confirmRoundBtn = document.getElementById('confirm-round-count-btn');
    if (confirmRoundBtn) {
        confirmRoundBtn.addEventListener('click', function () {
            totalRounds = selectedRoundsCount;
            transitionToScreen('round-select-screen', 'team-setup-screen');
        });
    }

    // Add player button
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerNameInput = document.getElementById('player-name-input');

    if (addPlayerBtn && playerNameInput) {
        addPlayerBtn.addEventListener('click', function () {
            const playerName = playerNameInput.value.trim();
            if (playerName && !players.available.includes(playerName)) {
                players.available.push(playerName);
                updateAvailablePlayersDisplay();
                playerNameInput.value = '';
            }
        });

        playerNameInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addPlayerBtn.click();
            }
        });
    }

    // Confirm teams button
    const confirmTeamsBtn = document.getElementById('confirm-teams-btn');
    if (confirmTeamsBtn) {
        confirmTeamsBtn.addEventListener('click', function () {
            // Validate teams
            if (!players.team1Leader || !players.team2Leader) {
                showErrorModal('Both teams need a leader!');
                return;
            }

            const team1Size = getTeamSize(1);
            const team2Size = getTeamSize(2);

            if (team1Size === 0 || team2Size === 0) {
                showErrorModal('Both teams need at least one player!');
                return;
            }

            transitionToScreen('team-setup-screen', 'word-generation-screen');

            // Update final game info
            document.getElementById('final-player-count').textContent = numberOfPlayers;
            document.getElementById('final-round-count').textContent = totalRounds;
            document.getElementById('final-difficulty').textContent = gameDifficulty;

            // Generate initial word
            generateNewWord();
        });
    }

    // Word visibility toggle buttons
    const toggleWordBtn = document.getElementById('toggle-word-btn');
    const gameToggleWordBtn = document.getElementById('game-toggle-word-btn');

    if (toggleWordBtn) {
        toggleWordBtn.addEventListener('click', toggleWordVisibility);
    }

    if (gameToggleWordBtn) {
        gameToggleWordBtn.addEventListener('click', toggleWordVisibility);
    }

    // Final start game button
    const finalStartBtn = document.getElementById('final-start-game-btn');
    if (finalStartBtn) {
        finalStartBtn.addEventListener('click', function () {
            document.getElementById('word-generation-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            startGame();
        });
    }

    console.log('Game initialization complete');
});

// Difficulty selection function
function selectDifficulty(difficulty, event) {
    gameDifficulty = difficulty;

    // Update button states
    document.querySelectorAll('.difficulty-slot-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');

    // Auto-advance after selection
    setTimeout(() => {
        transitionToScreen('difficulty-select-screen', 'round-select-screen');
    }, 500);
}

// --- Error Handling and Validation ---
function validateGameState() {
    const errors = [];

    if (!players.team1Leader) {
        errors.push('Team 1 needs a leader');
    }

    if (!players.team2Leader) {
        errors.push('Team 2 needs a leader');
    }

    if (getTeamSize(1) < 2) {
        errors.push('Team 1 needs at least 2 players (including leader)');
    }

    if (getTeamSize(2) < 2) {
        errors.push('Team 2 needs at least 2 players (including leader)');
    }

    if (numberOfPlayers < 4) {
        errors.push('Need at least 4 players total');
    }

    return errors;
}

// --- Performance Optimizations ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced version of updateAllDisplays for better performance
const debouncedUpdateDisplays = debounce(updateAllDisplays, 100);

// --- Memory Management ---
function cleanupEventListeners() {
    // Remove all drag event listeners when game starts
    document.querySelectorAll('.player').forEach(player => {
        player.removeEventListener('dragstart', handleDragStart);
        player.removeEventListener('dragend', handleDragEnd);
    });
}

// --- Browser Compatibility Checks ---
function checkBrowserSupport() {
    const issues = [];

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        issues.push('Speech recognition not supported');
    }

    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
        console.log('Touch events not supported - desktop mode');
    }

    if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
        console.log('Backdrop filter not supported - using fallback');
    }

    return issues;
}

// --- Utility Functions ---
function sanitizeInput(input) {
    return input.trim().replace(/[<>\"'&]/g, '');
}

function generateUniqueId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// --- Enhanced Error Reporting ---
window.addEventListener('error', function (e) {
    console.error('Game Error:', e.error);
    showErrorModal('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showErrorModal('A network or loading error occurred.');
});

// --- Initialize on load ---
console.log('Password Game Script Loaded Successfully');
console.log('Browser Support Check:', checkBrowserSupport());
