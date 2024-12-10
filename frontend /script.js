const API_URL = 'http://localhost:5000/api/auth';

// User Registration
$('#registerButton').click(function() {
    const username = $('#registerUsername').val();
    const password = $('#registerPassword').val();
    $.post(`${API_URL}/register`, { username, password })
        .done(function(response) {
            alert('Registration successful!');
        })
        .fail(function(err) {
            alert('Registration failed: ' + err.responseText);
        });
});

// User Login
$('#loginButton').click(function() {
    const username = $('#loginUsername').val();
    const password = $('#loginPassword').val();
    $.post(`${API_URL}/login`, { username, password })
        .done(function(data) {
            alert('Login successful!');
            localStorage.setItem('jwt', data.accessToken); // Store access token
        })
        .fail(function(err) {
            alert('Login failed: ' + err.responseText);
        });
});

// Fetch User Profile
$('#getProfileButton').click(function() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert('Please log in first.');
    return;
}

$.ajax({
    url: `${API_URL}/profile`,
    type: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token // Include JWT in headers
    },
    success: function(data) {
        $('#profileInfo').html(`<p>ID: ${data.id}</p><p>Username: ${data.username}</p>`);
    },
    error: function(err) {
        alert('Failed to fetch profile: ' + err.responseText);
        localStorage.removeItem('jwt'); // Clear JWT if unauthorized
    }
});
});

// Update User Profile
$('#updateProfileButton').click(function() {
const newUsername = $('#updateUsername').val();
const token = localStorage.getItem('jwt');

$.ajax({
    url: `${API_URL}/profile`,
    type: 'PUT',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    data: { username: newUsername },
    success: function(data) {
        alert('Profile updated: ' + data.username);
    },
    error: function(err) {
        alert('Failed to update profile: ' + err.responseText);
    }
});
});

// Reset User Password
$('#resetPasswordButton').click(function() {
const newPassword = $('#resetPassword').val();
const token = localStorage.getItem('jwt');

$.ajax({
    url: `${API_URL}/reset-password`,
    type: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    data: { newPassword: newPassword },
    success: function() {
        alert('Password has been reset successfully.');
    },
    error: function(err) {
        alert('Failed to reset password: ' + err.responseText);
    }
});
});

// Handle User Logout
$('#logoutButton').click(function() {
$.post(`${API_URL}/logout`, {}, function() {
    alert('Logged out successfully!');
    localStorage.removeItem('jwt'); // Remove access token from local storage
    $('#profileInfo').html(''); // Clear profile info
}).fail(function(err) {
    alert('Failed to log out: ' + err.responseText);
});
});

// Crossword Puzzle
const puzzlesSets = [
[
    { word: 'CAT', hint: 'A small domesticated carnivorous mammal', position: { x: 0, y: 0 }, direction: 'horizontal' },
    { word: 'DOG', hint: 'A domesticated carnivorous mammal', position: { x: 0, y: 1 }, direction: 'vertical' },
    { word: 'FISH', hint: 'A limbless cold-blooded vertebrate animal', position: { x: 1, y: 1 }, direction: 'horizontal' }
],
// ... Other puzzle sets ...
];

const grid = Array.from({ length: 10 }, () => Array(10).fill(''));
let currentPuzzlesIndex = 0; // Current puzzle set index
let score = 0; // Initialize score
let timer = 60; // Timer for the game
const timerDisplay = $('#timerDisplay'); // Timer display element
const scoreDisplay = $('#scoreDisplay'); // Score display element

// Functions for the crossword game
function fillGridWithWords(grid, puzzles) {
puzzles.forEach(({ word, position, direction }) => {
    let { x, y } = position;
    for (let i = 0; i < word.length; i++) {
        if (direction === 'horizontal') {
            grid[y][x + i] = word[i]; // Fill horizontally
        } else if (direction === 'vertical') {
            grid[y + i][x] = word[i]; // Fill vertically
        }
    }
});
}

function renderGrid() {
$('#crosswordGrid').empty(); // Clear existing grid
for (let row = 0; row < grid.length; row++) {
    const rowDiv = $('<div>').css({ display: 'flex' });
    for (let col = 0; col < grid[row].length; col++) {
        const cellValue = grid[row][col];
        const cell = $('<div>').addClass('cell').css({
            width: '40px',
            height: '40px',
            border: '1px solid #ccc',
            textAlign: 'center',
            lineHeight: '40px',
            fontSize: '16px'
        }).text(cellValue ? cellValue : '');
        rowDiv.append(cell);
    }
    $('#crosswordGrid').append(rowDiv);
}
$('#crosswordGrid').append(rowDiv);
}

// Start the crossword game
function startCrosswordGame() {
fillGridWithWords(grid, puzzlesSets[currentPuzzlesIndex]); // Fill grid with the current puzzle set
renderGrid(); // Render the crossword grid
startTimer(); // Start the timer when the crossword starts
}

// Timer Functionality
function startTimer() {
timerDisplay.text(timer); // Set initial timer display
const timerInterval = setInterval(() => {
    if (timer > 0) {
        timer -= 1;
        timerDisplay.text(timer); // Update the timer display
    } else {
        clearInterval(timerInterval); // Stop timer
        alert('Time is up! Your final score is: ' + score); // Alert when time is up
        // You can also handle game end logic here.
    }
}, 1000);
}

// Score Tracking Function
function updateScore() {
score += 10; // Increment score by 10 (or any desired value)
scoreDisplay.text(score); // Update score display
}

// Handling Hints
$('#getHintButton').click(function() {
const selectedPuzzle = puzzlesSets[currentPuzzlesIndex][0]; // Adjust logic to select the right puzzle
$('#hintDisplay').text(selectedPuzzle.hint); // Display hint in the paragraph
});

// Initializing the Crossword Game on Document Ready
$(document).ready(function() {
startCrosswordGame(); // Start crossword game when document is ready
});