// Simple error checking script for script.js
// This will help identify any remaining JavaScript errors

console.log('🔍 Starting JavaScript Error Check...');

// Check for common JavaScript errors
const errorChecks = {
    syntaxErrors: [],
    referenceErrors: [],
    typeErrors: [],
    warnings: []
};

// Test 1: Check if all global variables are properly declared
try {
    if (typeof spaceBackground !== 'undefined') {
        console.log('✅ spaceBackground is defined');
    } else {
        errorChecks.referenceErrors.push('spaceBackground is not defined');
    }
} catch (e) {
    errorChecks.referenceErrors.push('spaceBackground: ' + e.message);
}

try {
    if (typeof compatibilityManager !== 'undefined') {
        console.log('✅ compatibilityManager is defined');
    } else {
        errorChecks.referenceErrors.push('compatibilityManager is not defined');
    }
} catch (e) {
    errorChecks.referenceErrors.push('compatibilityManager: ' + e.message);
}

try {
    if (typeof spaceErrorHandler !== 'undefined') {
        console.log('✅ spaceErrorHandler is defined');
    } else {
        errorChecks.referenceErrors.push('spaceErrorHandler is not defined');
    }
} catch (e) {
    errorChecks.referenceErrors.push('spaceErrorHandler: ' + e.message);
}

try {
    if (typeof spaceLoadingSystem !== 'undefined') {
        console.log('✅ spaceLoadingSystem is defined');
    } else {
        errorChecks.referenceErrors.push('spaceLoadingSystem is not defined');
    }
} catch (e) {
    errorChecks.referenceErrors.push('spaceLoadingSystem: ' + e.message);
}

try {
    if (typeof performanceMonitor !== 'undefined') {
        console.log('✅ performanceMonitor is defined');
    } else {
        errorChecks.referenceErrors.push('performanceMonitor is not defined');
    }
} catch (e) {
    errorChecks.referenceErrors.push('performanceMonitor: ' + e.message);
}

// Test 2: Check if all onclick functions are defined
const onclickFunctions = [
    'selectDifficulty',
    'selectRounds', 
    'addPlayer',
    'generateNewWord',
    'toggleWordVisibility',
    'logWord',
    'confirmSwitch',
    'closeErrorModal'
];

onclickFunctions.forEach(funcName => {
    try {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} function is defined`);
        } else {
            errorChecks.referenceErrors.push(`${funcName} function is not defined`);
        }
    } catch (e) {
        errorChecks.referenceErrors.push(`${funcName}: ` + e.message);
    }
});

// Test 3: Check if all required DOM elements exist
const requiredElements = [
    'player-select-screen',
    'difficulty-select-screen', 
    'round-select-screen',
    'game-container',
    'current-word',
    'start-btn'
];

requiredElements.forEach(elementId => {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ Element #${elementId} exists`);
        } else {
            errorChecks.referenceErrors.push(`Element #${elementId} not found`);
        }
    } catch (e) {
        errorChecks.referenceErrors.push(`Element #${elementId}: ` + e.message);
    }
});

// Test 4: Check for any console errors
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
    errorChecks.syntaxErrors.push(args.join(' '));
    originalError.apply(console, args);
};

console.warn = function(...args) {
    errorChecks.warnings.push(args.join(' '));
    originalWarn.apply(console, args);
};

// Generate error report
setTimeout(() => {
    console.log('\n🚀 JavaScript Error Check Report:');
    console.log('=====================================');
    
    if (errorChecks.syntaxErrors.length > 0) {
        console.log('❌ Syntax/Runtime Errors:');
        errorChecks.syntaxErrors.forEach(error => console.log('  - ' + error));
    }
    
    if (errorChecks.referenceErrors.length > 0) {
        console.log('❌ Reference Errors:');
        errorChecks.referenceErrors.forEach(error => console.log('  - ' + error));
    }
    
    if (errorChecks.typeErrors.length > 0) {
        console.log('❌ Type Errors:');
        errorChecks.typeErrors.forEach(error => console.log('  - ' + error));
    }
    
    if (errorChecks.warnings.length > 0) {
        console.log('⚠️ Warnings:');
        errorChecks.warnings.forEach(warning => console.log('  - ' + warning));
    }
    
    const totalErrors = errorChecks.syntaxErrors.length + 
                       errorChecks.referenceErrors.length + 
                       errorChecks.typeErrors.length;
    
    if (totalErrors === 0) {
        console.log('✅ No JavaScript errors detected!');
    } else {
        console.log(`❌ Total errors found: ${totalErrors}`);
    }
    
    console.log('=====================================');
}, 1000);

console.log('🔍 Error check script loaded. Report will be generated in 1 second...');