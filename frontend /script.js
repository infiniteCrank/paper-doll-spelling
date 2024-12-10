const API_URL = 'http://localhost:5000/api/auth';

// Handle user registration
$('#registerButton').click(function() {
    const username = $('#registerUsername').val();
    const password = $('#registerPassword').val();
    $.post(`${API_URL}/register`, { username, password })
        .done(function(response) {
            alert('Registration successful!');
        })
        .fail(function(err) {
            //alert('Registration failed: ' + err.responseText);
            $('#errorMessage').text('');
            $('#errorMessage').text('Error: ' + err.responseText); // Update the error display area
        });
});

// Handle user login
$('#loginButton').click(function() {
    const username = $('#loginUsername').val();
    const password = $('#loginPassword').val();
    $.post(`${API_URL}/login`, { username, password })
        .done(function(data) {
            alert('Login successful! Token: ' + data.accessToken);
            localStorage.setItem('jwt', data.accessToken); // Store access token in local storage
        })
        .fail(function(err) {
            //alert('Login failed: ' + err.responseText);
            $('#errorMessage').text('');
            $('#errorMessage').text('Error: ' + err.responseText); // Update the error display area
        });
});

// Handle fetching the user profile
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
            //alert('Failed to fetch profile: ' + err.responseText);
            localStorage.removeItem('jwt'); // Clear JWT if unauthorized
            $('#errorMessage').text('');
            $('#errorMessage').text('Error: ' + err.responseText); // Update the error display area
        }
    });
});

// Handle user logout
$('#logoutButton').click(function() {
    $.post(`${API_URL}/logout`, {}, function() {
        alert('Logged out successfully!');
        localStorage.removeItem('jwt'); // Remove access token from local storage
        $('#profileInfo').html(''); // Clear profile info
    }).fail(function(err) {
        alert('Failed to log out: ' + err.responseText);
    });
});

$('#getHintButton').click(function() {
    const selectedPuzzle = puzzlesSets[currentPuzzlesIndex][0]; // Adjust logic to select the right puzzle
    $('#hintDisplay').text(selectedPuzzle.hint); // Display the hint in the paragraph
});

// Update user profile
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

// Reset user password
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

let timer = 60; // Starting time
const timerDisplay = $('#timerDisplay');

function startTimer() {
    const interval = setInterval(() => {
        if (timer > 0) {
            timer -= 1;
            timerDisplay.text(timer);
        } else {
            clearInterval(interval);
            alert('Time is up!');
            // Optionally handle the end of the game
        }
    }, 1000);
}

let score = 0;

function updateScoreDisplay() {
    $('#scoreDisplay').text(score);
}

// Crossword Puzzles
const puzzlesSets = [
    [
        { word: 'CAT', hint: 'A small domesticated carnivorous mammal', position: { x: 0, y: 0 }, direction: 'horizontal' },
        { word: 'DOG', hint: 'A domesticated carnivorous mammal that typically has a long snout', position: { x: 0, y: 1 }, direction: 'vertical' },
        { word: 'FISH', hint: 'A limbless cold-blooded vertebrate animal', position: { x: 1, y: 1 }, direction: 'horizontal' }
    ],
    // Other puzzles...
];

const grid = Array.from({ length: 10 }, () => Array(10).fill(''));
let currentPuzzlesIndex = 0; // Current puzzle set index

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
            const cell = $('<div>').css({
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
}

// Start the crossword game
function startCrosswordGame() {
    fillGridWithWords(grid, puzzlesSets[currentPuzzlesIndex]); // Fill grid with the current puzzle set
    renderGrid(); // Render the crossword grid
    startTimer();
}

$(document).ready(function() {
    // Initially, start the crossword game when the document is ready
    startCrosswordGame(); // Start crossword game when document is ready
});