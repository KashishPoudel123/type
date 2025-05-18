/**
 * MinimalTyping - minimaltyping.js
 * Main application entry point
 */

// DOM Elements
const starsContainer = document.getElementById('stars-container');
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const wpmCounter = document.getElementById('wpm-counter');
const accuracyCounter = document.getElementById('accuracy-counter');
const timeCounter = document.getElementById('time-counter');
const resultsContainer = document.getElementById('results');
const showCustomTextButton = document.getElementById('show-custom-text-button');
const customTextContainer = document.getElementById('custom-text-container');
const customTextInput = document.getElementById('custom-text-input');
const customTextButton = document.getElementById('custom-text-button');
const numbersToggle = document.getElementById('numbers-toggle');
const punctuationToggle = document.getElementById('punctuation-toggle');
const capitalsToggle = document.getElementById('capitals-toggle');
const textOptions = document.getElementById('text-options');

// Test state variables
let currentWordIndex = 0;
let currentCharIndex = 0;
let correctChars = 0;
let incorrectChars = 0;
let startTime = 0;
let timer = null;
let testMode = 'time'; // 'time', 'words', 'quote', 'custom'
let testDuration = 30; // Default 30 seconds
let wordCount = 25; // Default 25 words
let quoteLength = 'medium'; // 'short', 'medium', 'long'
let isTestActive = false;
let hasStartedTyping = false;
let currentText = [];

// Mistake tracking
let mistakenWords = 0;
let missedWords = 0;
let letterErrors = {};
let wordErrors = {};

// Word lists
const englishCommon = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

// Quotes
const quotes = [
    // Short quotes
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        length: "short"
    },
    {
        text: "Life is what happens when you're busy making other plans.",
        author: "John Lennon",
        length: "short"
    },
    {
        text: "The purpose of our lives is to be happy.",
        author: "Dalai Lama",
        length: "short"
    },
    // Medium quotes
    {
        text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking.",
        author: "Steve Jobs",
        length: "medium"
    },
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing.",
        author: "Nelson Mandela",
        length: "medium"
    },
    // Long quotes
    {
        text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
        author: "Ralph Waldo Emerson",
        length: "long"
    }
];

// Initialize the application
function init() {
    // Create stars background
    createStars();

    // Initialize results container
    initializeResultsContainer();

    // Add click handlers for option buttons
    const timeButtons = document.querySelectorAll('.time-option');
    const wordsButtons = document.querySelectorAll('.words-option');
    const quoteButtons = document.querySelectorAll('.quote-option');

    // Function to clear all active buttons
    function clearAllActiveButtons() {
        // Remove active class from all buttons in all groups
        timeButtons.forEach(btn => btn.classList.remove('active'));
        wordsButtons.forEach(btn => btn.classList.remove('active'));
        quoteButtons.forEach(btn => btn.classList.remove('active'));
        showCustomTextButton.classList.remove('active');
    }

    // Function to update the selected mode display
    function updateSelectedModeDisplay() {
        // Create or update the selected mode display
        let modeDisplay = document.getElementById('selected-mode-display');
        if (!modeDisplay) {
            modeDisplay = document.createElement('div');
            modeDisplay.id = 'selected-mode-display';
            modeDisplay.className = 'selected-mode-display';
            document.querySelector('.typing-stats').appendChild(modeDisplay);
        }

        // Update the content based on the current mode
        let modeText = '';
        if (testMode === 'time') {
            modeText = `Mode: Time (${testDuration}s)`;
        } else if (testMode === 'words') {
            modeText = `Mode: Words (${wordCount})`;
        } else if (testMode === 'quote') {
            modeText = `Mode: Quote (${quoteLength})`;
        } else if (testMode === 'custom') {
            modeText = 'Mode: Custom Text';
        } else if (testMode === 'practice') {
            // Get the top problem letters
            const problemLetters = Object.entries(letterErrors)
                .map(([letter, count]) => ({ letter, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(item => item.letter);

            if (problemLetters.length > 0) {
                modeText = `Mode: Practice (${problemLetters.join(', ')})`;
            } else {
                modeText = 'Mode: Practice';
            }
        }

        modeDisplay.textContent = modeText;
    }

    // Time buttons
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Clear all active buttons first
            clearAllActiveButtons();

            // Show options container
            textOptions.style.display = 'flex';
            // Hide custom text container
            customTextContainer.classList.remove('visible');

            // Add active class to clicked button
            this.classList.add('active');

            // Set test mode and duration
            testMode = 'time';
            testDuration = parseInt(this.dataset.time);

            // Update the selected mode display
            updateSelectedModeDisplay();

            // Start test
            resetTest();
            startTestWithRandomText();
        });
    });

    // Words buttons
    wordsButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Clear all active buttons first
            clearAllActiveButtons();

            // Show options container
            textOptions.style.display = 'flex';
            // Hide custom text container
            customTextContainer.classList.remove('visible');

            // Add active class to clicked button
            this.classList.add('active');

            // Set test mode and word count
            testMode = 'words';
            wordCount = parseInt(this.dataset.words);

            // Update the selected mode display
            updateSelectedModeDisplay();

            // Start test
            resetTest();
            startTestWithRandomText();
        });
    });

    // Quote buttons
    quoteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Clear all active buttons first
            clearAllActiveButtons();

            // Hide options container
            textOptions.style.display = 'none';
            // Hide custom text container
            customTextContainer.classList.remove('visible');

            // Add active class to clicked button
            this.classList.add('active');

            // Set test mode and quote length
            testMode = 'quote';
            quoteLength = this.dataset.quoteLength;

            // Update the selected mode display
            updateSelectedModeDisplay();

            // Start test
            resetTest();
            startTestWithQuote();
        });
    });

    // Custom text button
    showCustomTextButton.addEventListener('click', function() {
        // Clear all active buttons first
        clearAllActiveButtons();

        // Hide options container
        textOptions.style.display = 'none';
        // Show custom text container
        customTextContainer.classList.add('visible');
        customTextInput.focus();

        // Highlight the button
        this.classList.add('active');

        // Set test mode
        testMode = 'custom';

        // Update the selected mode display
        updateSelectedModeDisplay();
    });

    // Custom text submit button
    customTextButton.addEventListener('click', function() {
        // Get custom text
        const customText = customTextInput.value.trim();

        // Check if text is not empty
        if (customText.length > 0) {
            // Set test mode
            testMode = 'custom';

            // Update the selected mode display
            updateSelectedModeDisplay();

            // Start test
            resetTest();
            startTestWithCustomText(customText);

            // Hide custom text container
            customTextContainer.classList.remove('visible');
        }
    });

    // Add event listeners for option toggles
    numbersToggle.addEventListener('change', function() {
        // Regenerate text if test is active and mode is time or words
        if (isTestActive && (testMode === 'time' || testMode === 'words')) {
            resetTest();
            startTestWithRandomText();
        }
    });

    punctuationToggle.addEventListener('change', function() {
        // Regenerate text if test is active and mode is time or words
        if (isTestActive && (testMode === 'time' || testMode === 'words')) {
            resetTest();
            startTestWithRandomText();
        }
    });

    capitalsToggle.addEventListener('change', function() {
        // Regenerate text if test is active and mode is time or words
        if (isTestActive && (testMode === 'time' || testMode === 'words')) {
            resetTest();
            startTestWithRandomText();
        }
    });

    // Add event listener for restart button
    document.getElementById('restart-button').addEventListener('click', function() {
        // Hide results
        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
            resultsContainer.classList.remove('visible');
        }

        // Reset test based on current mode
        resetTest();

        if (testMode === 'time' || testMode === 'words') {
            startTestWithRandomText();
        } else if (testMode === 'quote') {
            startTestWithQuote();
        } else if (testMode === 'custom') {
            const customText = customTextInput.value.trim();
            if (customText.length > 0) {
                startTestWithCustomText(customText);
            } else {
                startTestWithRandomText();
            }
        } else if (testMode === 'practice') {
            startPracticeTest();
        }
    });

    // Add event listener for new test button
    document.getElementById('new-test-button').addEventListener('click', function() {
        // Hide results
        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
            resultsContainer.classList.remove('visible');
        }

        // Reset test
        resetTest();

        // Start with random text
        startTestWithRandomText();
    });

    // Add event listener for practice button
    document.getElementById('start-practice-button').addEventListener('click', function() {
        startPracticeTest();
    });

    // Add event listener for typing input
    typingInput.addEventListener('input', handleTyping);

    // Add event listener for keydown to handle space key
    typingInput.addEventListener('keydown', function(e) {
        if (!isTestActive) return;

        // If space key is pressed
        if (e.key === ' ') {
            // If the input is empty, prevent default to avoid adding a space
            if (this.value.trim() === '') {
                e.preventDefault();
                return;
            }

            // If the last character is already a space, prevent default
            if (this.value.slice(-1) === ' ') {
                e.preventDefault();
                return;
            }
        }
    });

    // Set default active button
    document.querySelector('[data-time="30"]').classList.add('active');

    // Start with random text
    resetTest();
    startTestWithRandomText();

    // Window resize event for stars
    window.addEventListener('resize', createStars);
}

// Start test with random text
function startTestWithRandomText() {
    const text = generateText(testMode === 'time' ? 100 : wordCount);
    startTest(text);
}

// Start test with a quote
function startTestWithQuote() {
    const quote = getRandomQuote(quoteLength);
    startTest(quote.text);
}

// Start test with custom text
function startTestWithCustomText(text) {
    startTest(text);
}

// Start test with the given text
function startTest(text) {
    // Reset state
    currentWordIndex = 0;
    currentCharIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    isTestActive = true;
    hasStartedTyping = false;

    // Reset mistake tracking
    mistakenWords = 0;
    missedWords = 0;
    letterErrors = {};
    wordErrors = {};

    // Clear any existing timer
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // Reset stats
    wpmCounter.textContent = '0';
    accuracyCounter.textContent = '—'; // Don't show accuracy until typing starts
    timeCounter.textContent = testMode === 'time' ? `${testDuration}s` : '0s';

    // Make sure typing area is visible
    document.getElementById('typing-area').classList.remove('hidden');

    // Display the text
    displayText(text);

    // Focus the input
    typingInput.value = '';
    typingInput.focus();

    // Don't record start time yet - wait for first keystroke
    startTime = 0;
}

// Generate random text with options
function generateText(wordCount) {
    const includeNumbers = numbersToggle.checked;
    const includePunctuation = punctuationToggle.checked;
    const includeCapitals = capitalsToggle.checked;

    // Generate text
    let text = [];
    for (let i = 0; i < wordCount; i++) {
        let word = englishCommon[Math.floor(Math.random() * englishCommon.length)];

        // Apply capitals if enabled (20% chance)
        if (includeCapitals && Math.random() < 0.2) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        // Add numbers if enabled (10% chance)
        if (includeNumbers && Math.random() < 0.1) {
            const number = Math.floor(Math.random() * 100);
            word = Math.random() < 0.5 ? `${number}${word}` : `${word}${number}`;
        }

        // Add punctuation if enabled (15% chance)
        if (includePunctuation && Math.random() < 0.15) {
            const punctuation = ['.', ',', '!', '?', ';', ':', '-'];
            const punct = punctuation[Math.floor(Math.random() * punctuation.length)];
            word = Math.random() < 0.8 ? `${word}${punct}` : `${punct}${word}`;
        }

        text.push(word);
    }

    return text.join(' ');
}

// Get random quote of specified length
function getRandomQuote(length) {
    const filteredQuotes = quotes.filter(quote => quote.length === length);
    if (filteredQuotes.length === 0) {
        return {
            text: "No quotes found for the specified length.",
            author: "System",
            length: length
        };
    }
    return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
}

// Display text in the text display
function displayText(text) {
    // Split text into words
    currentText = text.split(' ');

    // Clear text display
    textDisplay.innerHTML = '';

    // Create word elements
    currentText.forEach((word, wordIndex) => {
        const wordElement = document.createElement('span');
        wordElement.className = wordIndex === 0 ? 'word current-word' : 'word';
        wordElement.dataset.wordIndex = wordIndex;

        // Create character elements
        Array.from(word).forEach((char, charIndex) => {
            const charElement = document.createElement('span');
            charElement.className = wordIndex === 0 && charIndex === 0 ? 'char current-char' : 'char';
            charElement.dataset.charIndex = charIndex;
            charElement.textContent = char;
            wordElement.appendChild(charElement);
        });

        textDisplay.appendChild(wordElement);

        // Add space after word (except last word)
        if (wordIndex < currentText.length - 1) {
            textDisplay.appendChild(document.createTextNode(' '));
        }
    });

    // Reset scroll position
    textDisplay.scrollTop = 0;
}

// Handle typing input
function handleTyping(e) {
    if (!isTestActive) return;

    const inputValue = e.target.value;
    const lastChar = inputValue.slice(-1);

    // Check if space was pressed to move to next word
    if (lastChar === ' ') {
        // Get the word without the space
        const typedWord = inputValue.trim();

        // Get current word
        const currentWord = currentText[currentWordIndex];

        // Mark word as correct or incorrect
        if (typedWord === currentWord) {
            markWordAsCorrect(currentWordIndex);
        } else {
            markWordAsIncorrect(currentWordIndex);

            // Track errors for each character that was wrong
            for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
                if (typedWord[i] !== currentWord[i]) {
                    const correctChar = currentWord[i] || '';
                    if (correctChar) {
                        letterErrors[correctChar] = (letterErrors[correctChar] || 0) + 1;
                    }
                }
            }
        }

        // Move to next word
        currentWordIndex++;
        currentCharIndex = 0;

        // Clear input
        e.target.value = '';

        // Update current word and character
        updateCurrentWordAndChar();

        // Check if test is complete (for words mode)
        if (testMode === 'words' && currentWordIndex >= wordCount) {
            endTest();
            return;
        }

        // Check if test is complete (for quote, custom, or practice mode)
        if ((testMode === 'quote' || testMode === 'custom' || testMode === 'practice') && currentWordIndex >= currentText.length) {
            endTest();
            return;
        }

        // Update stats
        updateStats();
        return;
    }

    // Start timer on first keystroke
    if (!hasStartedTyping) {
        hasStartedTyping = true;
        startTime = Date.now();

        // Start timer for time mode
        if (testMode === 'time') {
            let timeLeft = testDuration;
            timeCounter.textContent = `${timeLeft}s`;

            timer = setInterval(() => {
                timeLeft--;
                timeCounter.textContent = `${timeLeft}s`;

                // Update WPM every second
                updateStats();

                if (timeLeft <= 0) {
                    endTest();
                }
            }, 1000);
        }
        // Start timer for words mode
        else if (testMode === 'words') {
            timer = setInterval(() => {
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                timeCounter.textContent = `${elapsedTime}s`;

                // Update WPM every second
                updateStats();
            }, 1000);
        }
        // Start timer for quote or custom mode
        else {
            timer = setInterval(() => {
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                timeCounter.textContent = `${elapsedTime}s`;

                // Update WPM every second
                updateStats();
            }, 1000);
        }
    }

    // Get current word
    const currentWord = currentText[currentWordIndex];

    // Word in progress
    const inputChars = Array.from(inputValue);

    // Check each character
    for (let i = 0; i < Math.max(inputChars.length, currentWord.length); i++) {
        const charElement = document.querySelector(`.word[data-word-index="${currentWordIndex}"] .char[data-char-index="${i}"]`);

        if (!charElement) continue;

        if (i < inputChars.length) {
            // Character typed
            if (inputChars[i] === currentWord[i]) {
                // Correct character
                charElement.className = 'char correct-char';
                if (i === currentCharIndex) {
                    correctChars++;
                    currentCharIndex++;
                }
            } else {
                // Incorrect character
                charElement.className = 'char incorrect-char';
                if (i === currentCharIndex) {
                    incorrectChars++;
                    currentCharIndex++;

                    // Track letter errors
                    const correctChar = currentWord[i] || '';
                    if (correctChar) {
                        letterErrors[correctChar] = (letterErrors[correctChar] || 0) + 1;
                    }
                }
            }
        } else {
            // Character not typed yet
            charElement.className = 'char';
        }
    }

    // Update current character
    updateCurrentChar();

    // Check if we need to scroll
    checkAndScroll();

    // Update stats
    updateStats();
}

// Mark a word as correct
function markWordAsCorrect(wordIndex) {
    const wordElement = document.querySelector(`.word[data-word-index="${wordIndex}"]`);
    if (wordElement) {
        wordElement.classList.add('correct-word');
    }
}

// Mark a word as incorrect
function markWordAsIncorrect(wordIndex) {
    const wordElement = document.querySelector(`.word[data-word-index="${wordIndex}"]`);
    if (wordElement) {
        wordElement.classList.add('incorrect-word');
    }
}

// Update the current word and character
function updateCurrentWordAndChar() {
    // Remove current-word class from all words
    document.querySelectorAll('.word').forEach(word => {
        word.classList.remove('current-word');
    });

    // Add current-word class to new current word
    const newCurrentWord = document.querySelector(`.word[data-word-index="${currentWordIndex}"]`);
    if (newCurrentWord) {
        newCurrentWord.classList.add('current-word');

        // Update current character
        updateCurrentChar();

        // Check if we need to scroll
        checkAndScroll();
    }
}

// Check if we need to scroll and scroll by one line if needed
function checkAndScroll() {
    console.log('checkAndScroll called');

    if (!textDisplay) {
        console.error('Text display element not found!');
        return;
    }

    const currentWord = document.querySelector('.current-word');
    if (!currentWord) {
        console.error('Current word element not found!');
        return;
    }

    // Get the text display dimensions
    const textDisplayRect = textDisplay.getBoundingClientRect();
    const currentWordRect = currentWord.getBoundingClientRect();

    console.log('Text display rect:', {
        top: textDisplayRect.top,
        height: textDisplayRect.height
    });

    console.log('Current word rect:', {
        top: currentWordRect.top,
        bottom: currentWordRect.bottom
    });

    // Calculate the line height
    const computedStyle = window.getComputedStyle(textDisplay);
    let lineHeight = parseInt(computedStyle.getPropertyValue('--line-height-px')) || 0;

    // If CSS variable is not available, calculate from line-height
    if (!lineHeight) {
        const fontSize = parseInt(computedStyle.fontSize);
        const lineHeightValue = computedStyle.lineHeight;

        if (lineHeightValue === 'normal') {
            lineHeight = Math.round(fontSize * 1.2); // Default browser line-height
        } else if (lineHeightValue.endsWith('px')) {
            lineHeight = parseInt(lineHeightValue);
        } else {
            // If line-height is a multiplier (e.g., 1.8)
            lineHeight = Math.round(fontSize * parseFloat(lineHeightValue));
        }
    }

    // Ensure we have a reasonable value (fallback to 40px if calculation fails)
    lineHeight = lineHeight || 40;
    console.log('Calculated line height:', lineHeight);

    // Calculate the height of the text display area
    const textDisplayHeight = textDisplayRect.height;

    // Calculate how many rows fit in the display area
    const rowsInDisplay = Math.floor(textDisplayHeight / lineHeight);
    console.log('Rows in display:', rowsInDisplay);

    // Calculate the position of the current word relative to the top of the text display
    const relativeTop = currentWordRect.top - textDisplayRect.top;

    // Calculate which row the current word is on (0-based)
    const currentRow = Math.floor(relativeTop / lineHeight);
    console.log('Current row:', currentRow);

    // If we're on the 4th row (index 3) or beyond, scroll up by one line
    if (currentRow >= 3) {
        console.log('Scrolling by one line:', lineHeight);
        // Scroll by one line height
        textDisplay.scrollBy({
            top: lineHeight,
            behavior: 'smooth'
        });
    } else {
        console.log('Not scrolling, current row < 3');
    }
}

// Update the current character
function updateCurrentChar() {
    // Remove current-char class from all characters
    document.querySelectorAll('.char').forEach(char => {
        char.classList.remove('current-char');
    });

    // Get current word
    const currentWord = currentText[currentWordIndex];

    // Add current-char class to new current character
    let newCurrentChar;

    // If we've reached the end of the word, highlight the last character
    if (currentCharIndex >= currentWord.length) {
        newCurrentChar = document.querySelector(`.word[data-word-index="${currentWordIndex}"] .char[data-char-index="${currentWord.length - 1}"]`);
    } else {
        newCurrentChar = document.querySelector(`.word[data-word-index="${currentWordIndex}"] .char[data-char-index="${currentCharIndex}"]`);
    }

    if (newCurrentChar) {
        newCurrentChar.classList.add('current-char');
    }
}

// Update stats during the test
function updateStats() {
    if (!hasStartedTyping) return;

    const elapsedTime = (Date.now() - startTime) / 1000;
    const minutes = elapsedTime / 60;
    const totalChars = correctChars + incorrectChars;

    // Calculate WPM (5 characters = 1 word)
    const wpm = Math.round((correctChars / 5) / minutes);

    // Calculate accuracy
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    // Update counters
    wpmCounter.textContent = wpm;
    accuracyCounter.textContent = `${accuracy}%`;

    // Update time counter for words, quote, or custom mode
    if (testMode !== 'time') {
        timeCounter.textContent = `${Math.round(elapsedTime)}s`;
    }
}

// End the test and show results
function endTest() {
    // Stop the test
    isTestActive = false;

    // Clear any existing timer
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // Calculate final stats
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000;
    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    // Calculate WPM (5 characters = 1 word)
    const minutes = elapsedTime / 60;
    const wpm = Math.round((correctChars / 5) / minutes);

    // Update result elements
    document.getElementById('result-wpm').textContent = wpm;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;
    document.getElementById('result-time').textContent = `${Math.round(elapsedTime)}s`;
    document.getElementById('result-characters').textContent = totalChars;

    // Generate details text
    const detailsText = `You typed at ${wpm} WPM with ${accuracy}% accuracy.
    You typed ${correctChars} correct characters and ${incorrectChars} incorrect characters
    in ${Math.round(elapsedTime)} seconds.`;

    document.getElementById('result-details-text').textContent = detailsText;

    // Display problem letters
    displayProblemLetters();

    // Show results container
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('visible');
        console.log('Results container shown');
    } else {
        console.error('Results container not found!');
    }
}

// Display problem letters in the results
function displayProblemLetters() {
    const problemLettersContainer = document.getElementById('problem-letters-container');
    problemLettersContainer.innerHTML = '';

    // Convert letter errors object to array and sort by error count
    const letterErrorsArray = Object.entries(letterErrors)
        .map(([letter, count]) => ({ letter, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Show top 10 problem letters

    if (letterErrorsArray.length === 0) {
        const noErrorsElement = document.createElement('p');
        noErrorsElement.textContent = 'No letter errors detected. Great job!';
        problemLettersContainer.appendChild(noErrorsElement);
        return;
    }

    // Create a graph container
    const graphContainer = document.createElement('div');
    graphContainer.className = 'problem-letters-graph';
    problemLettersContainer.appendChild(graphContainer);

    // Create the graph
    createProblemLettersGraph(graphContainer, letterErrorsArray);
}

// Create a bar graph for problem letters
function createProblemLettersGraph(container, letterErrorsArray) {
    // Create the graph structure
    container.innerHTML = `
        <div class="graph-container">
            <div class="graph-title">Problem Letters Analysis</div>
            <div class="y-axis-label">Error Count</div>
            <div class="y-axis"></div>
            <div class="x-axis"></div>
            <div class="axis-labels">Letters</div>
            <div class="graph-grid"></div>
            <div class="graph-bars"></div>
        </div>
    `;

    // Get the graph elements
    const yAxis = container.querySelector('.y-axis');
    const xAxis = container.querySelector('.x-axis');
    const graphBars = container.querySelector('.graph-bars');
    const graphGrid = container.querySelector('.graph-grid');

    // Find the maximum error count for scaling
    const maxErrorCount = Math.max(...letterErrorsArray.map(item => item.count));

    // Calculate a nice rounded maximum for the y-axis (ensure it's at least 5)
    const yAxisMax = Math.max(5, Math.ceil(maxErrorCount / 5) * 5);

    // Create y-axis labels and grid lines
    const yAxisSteps = 5; // Number of steps on the y-axis
    for (let i = yAxisSteps; i >= 0; i--) {
        const value = Math.round((i / yAxisSteps) * yAxisMax);
        const label = document.createElement('div');
        label.textContent = value;
        yAxis.appendChild(label);

        // Add grid line (except for the bottom line which is the x-axis)
        if (i > 0) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line';
            gridLine.style.bottom = `${(i / yAxisSteps) * 100}%`;
            graphGrid.appendChild(gridLine);
        }
    }

    // Create x-axis labels and bars
    letterErrorsArray.forEach((item, index) => {
        // Create x-axis label
        const xLabel = document.createElement('div');
        xLabel.textContent = item.letter;
        xLabel.style.fontWeight = 'bold';
        xAxis.appendChild(xLabel);

        // Create bar
        const bar = document.createElement('div');
        bar.className = 'graph-bar';

        // Add tooltip with more information
        bar.title = `Letter: ${item.letter} - ${item.count} errors`;

        // Add label with error count on top of the bar
        const barLabel = document.createElement('div');
        barLabel.className = 'graph-bar-label';
        barLabel.textContent = item.count;
        bar.appendChild(barLabel);

        // Add a visual indicator inside the bar
        const barInner = document.createElement('div');
        barInner.style.position = 'absolute';
        barInner.style.bottom = '0';
        barInner.style.left = '0';
        barInner.style.right = '0';
        barInner.style.height = '100%';
        barInner.style.background = 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 5px, transparent 5px, transparent 10px)';
        bar.appendChild(barInner);

        // Add animation delay for a staggered effect
        bar.style.animation = `barGrow 0.6s ease-out ${index * 0.1}s forwards`;
        bar.style.opacity = '0';
        bar.style.height = '0';

        // Set a different color for the top 3 problem letters
        if (index < 3) {
            bar.style.background = 'linear-gradient(to top, #e06c75, #ff9b9b)';
            bar.style.boxShadow = '0 0 15px rgba(224, 108, 117, 0.4)';
            barLabel.style.backgroundColor = 'rgba(224, 108, 117, 0.3)';
        }

        graphBars.appendChild(bar);
    });

    // Add animation keyframes for the bars
    const style = document.createElement('style');
    style.textContent = `
        @keyframes barGrow {
            0% {
                opacity: 0;
                height: 0;
                transform: scaleY(0.5);
            }
            50% {
                opacity: 1;
                transform: scaleY(1.1);
            }
            70% {
                transform: scaleY(0.95);
            }
            100% {
                opacity: 1;
                height: var(--final-height);
                transform: scaleY(1);
            }
        }
    `;
    document.head.appendChild(style);

    // Set the final height for each bar after a small delay
    setTimeout(() => {
        const bars = graphBars.querySelectorAll('.graph-bar');
        bars.forEach(bar => {
            // Calculate height as a percentage of the container height (ensure minimum height for visibility)
            const index = Array.from(bars).indexOf(bar);
            const item = letterErrorsArray[index];
            const heightPercentage = Math.max(2, (item.count / yAxisMax) * 100);
            bar.style.setProperty('--final-height', `${heightPercentage}%`);
            bar.style.height = 'var(--final-height)';
            bar.style.opacity = '1';
        });
    }, 50);
}

// Start a practice test focusing on problem letters
function startPracticeTest() {
    // Get the top problem letters
    const problemLetters = Object.entries(letterErrors)
        .map(([letter, count]) => ({ letter, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => item.letter);

    if (problemLetters.length === 0) {
        // No problem letters, start a regular test
        alert("No problem letters detected. Try completing a test first to identify your problem letters.");
        resetTest();
        startTestWithRandomText();
        return;
    }

    // Set test mode to practice
    testMode = 'practice';

    // Update the selected mode display
    let modeDisplay = document.getElementById('selected-mode-display');
    if (modeDisplay) {
        modeDisplay.textContent = `Mode: Practice (${problemLetters.join(', ')})`;
    }

    // Generate practice text with problem letters
    const practiceText = generatePracticeText(problemLetters);

    // Hide results
    resultsContainer.classList.remove('visible');

    // Start test with practice text
    resetTest();
    startTest(practiceText);

    // Show a message to the user
    const messageElement = document.createElement('div');
    messageElement.className = 'practice-message';
    messageElement.textContent = `Practice mode: Focusing on problem letters: ${problemLetters.join(', ')}`;
    messageElement.style.position = 'absolute';
    messageElement.style.top = '10px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.backgroundColor = 'rgba(77, 120, 204, 0.8)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '8px 16px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.zIndex = '1000';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';

    document.body.appendChild(messageElement);

    // Remove the message after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 5000);
}

// Generate practice text focusing on problem letters
function generatePracticeText(problemLetters) {
    // Get words containing problem letters
    const wordsWithProblemLetters = englishCommon.filter(word =>
        problemLetters.some(letter => word.includes(letter))
    );

    if (wordsWithProblemLetters.length === 0) {
        return generateText(50); // Fallback to random text
    }

    // Create a message to show which letters are being practiced
    const practiceMessage = `Practice mode: focusing on problem letters: ${problemLetters.join(', ')}`;
    console.log(practiceMessage);

    // Highlight the problem letters in each word
    const highlightedWords = wordsWithProblemLetters.map(word => {
        // Create a version of the word with problem letters highlighted for display
        let displayWord = '';
        for (let i = 0; i < word.length; i++) {
            if (problemLetters.includes(word[i])) {
                displayWord += word[i].toUpperCase(); // Uppercase problem letters
            } else {
                displayWord += word[i];
            }
        }
        return {
            original: word,
            display: displayWord,
            problemLetterCount: word.split('').filter(char => problemLetters.includes(char)).length
        };
    });

    // Sort words by the number of problem letters they contain (descending)
    highlightedWords.sort((a, b) => b.problemLetterCount - a.problemLetterCount);

    // Generate text with 50 words, prioritizing words with more problem letters
    let text = [];
    for (let i = 0; i < 50; i++) {
        // Use modulo to cycle through the sorted words
        const wordIndex = i % highlightedWords.length;
        text.push(highlightedWords[wordIndex].original);
    }

    return text.join(' ');
}

// Reset the test
function resetTest() {
    // Reset state
    currentWordIndex = 0;
    currentCharIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    isTestActive = false;
    hasStartedTyping = false;

    // Reset mistake tracking
    mistakenWords = 0;
    missedWords = 0;
    letterErrors = {};
    wordErrors = {};

    // Clear any existing timer
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // Reset stats
    wpmCounter.textContent = '0';
    accuracyCounter.textContent = '—';
    timeCounter.textContent = testMode === 'time' ? `${testDuration}s` : '0s';

    // Clear input
    typingInput.value = '';

    // Hide results
    if (resultsContainer) {
        resultsContainer.classList.add('hidden');
        resultsContainer.classList.remove('visible');
    }
}

// Create stars background
function createStars() {
    // Clear existing stars
    starsContainer.innerHTML = '';

    // Create stars
    const starCount = Math.floor(window.innerWidth * window.innerHeight / 1000);
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random size (0.5px to 2px)
        const size = Math.random() * 1.5 + 0.5;

        // Random opacity and duration for twinkling
        const opacity = Math.random() * 0.7 + 0.3;
        const duration = Math.random() * 5 + 3;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--opacity', opacity);
        star.style.setProperty('--duration', `${duration}s`);

        starsContainer.appendChild(star);
    }

    // Create shooting stars
    const shootingStarCount = 5;
    for (let i = 0; i < shootingStarCount; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');

        // Random position, angle, and delay
        const top = Math.random() * 70;
        const angle = Math.random() * 20 - 10;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 10;

        shootingStar.style.setProperty('--top', `${top}%`);
        shootingStar.style.setProperty('--angle', `${angle}deg`);
        shootingStar.style.setProperty('--delay', `${delay}s`);
        shootingStar.style.setProperty('--duration', `${duration}s`);

        starsContainer.appendChild(shootingStar);
    }
}

// Initialize the results container
function initializeResultsContainer() {
    if (!resultsContainer) {
        console.error('Results container not found!');
        return;
    }

    // Create the basic structure for the results container
    resultsContainer.innerHTML = `
        <div class="results-container">
            <div class="results-header">
                <h2 class="results-title">Test Results</h2>
                <div class="results-actions">
                    <button id="restart-button" class="option-button highlight-button">Restart Test</button>
                    <button id="new-test-button" class="option-button">New Test</button>
                </div>
            </div>
            <div class="results-main">
                <div class="result-card">
                    <div class="result-value" id="result-wpm">0</div>
                    <div class="result-label">WPM</div>
                </div>
                <div class="result-card">
                    <div class="result-value" id="result-accuracy">0%</div>
                    <div class="result-label">Accuracy</div>
                </div>
                <div class="result-card">
                    <div class="result-value" id="result-time">0s</div>
                    <div class="result-label">Time</div>
                </div>
                <div class="result-card">
                    <div class="result-value" id="result-characters">0</div>
                    <div class="result-label">Characters</div>
                </div>
            </div>
            <div class="results-details">
                <h3 class="results-section-title">Details</h3>
                <p id="result-details-text">Complete a test to see your results.</p>
            </div>
            <div class="results-problem-letters">
                <h3 class="results-section-title">Problem Letters</h3>
                <div id="problem-letters-container">
                    <p>Complete a test to see your problem letters.</p>
                </div>
            </div>
            <div class="results-practice">
                <h3 class="results-section-title">Practice</h3>
                <p>Practice your problem letters to improve your typing speed and accuracy.</p>
                <button id="start-practice-button" class="highlight-button">Practice Problem Letters</button>
            </div>
        </div>
    `;

    console.log('Results container initialized');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);