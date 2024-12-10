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
            alert('Registration failed: ' + err.responseText);
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
            alert('Login failed: ' + err.responseText);
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
            alert('Failed to fetch profile: ' + err.responseText);
            localStorage.removeItem('jwt'); // Clear JWT if unauthorized
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

// Crossword Puzzles
const puzzlesSets = [
    [
        { word: 'CAT', position: { x: 0, y: 0 }, direction: 'horizontal' },
        { word: 'DOG', position: { x: 0, y: 1 }, direction: 'vertical' },
        { word: 'FISH', position: { x: 1, y: 1 }, direction: 'horizontal' }
    ],
    [
        { word: 'CAR', position: { x: 3, y: 0 }, direction: 'horizontal' },
        { word: 'BIRD', position: { x: 3, y: 1 }, direction: 'vertical' },
        { word: 'BEAR', position: { x: 5, y: 1 }, direction: 'horizontal' }
    ]
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
}

$(document).ready(function() {
    // Initially, start the crossword game when the document is ready
    startCrosswordGame(); // Start crossword game when document is ready
});