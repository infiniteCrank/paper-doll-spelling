import "phaser";

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * 0.9, // 90% of the window width
    height: window.innerHeight * 0.9, // 90% of the window height
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const puzzlesSets = [
    [
        { word: 'CAT', position: { x: 0, y: 0 }, direction: 'horizontal', hint: 'A small domesticated carnivorous mammal' },
        { word: 'DOG', position: { x: 0, y: 1 }, direction: 'vertical', hint: 'A domesticated carnivorous mammal that typically has a long snout' },
        { word: 'FISH', position: { x: 1, y: 1 }, direction: 'horizontal', hint: 'A limbless cold-blooded vertebrate animal' }
    ],
    [
        { word: 'CAR', position: { x: 3, y: 0 }, direction: 'horizontal', hint: 'A road vehicle, typically with four wheels' },
        { word: 'BIRD', position: { x: 3, y: 1 }, direction: 'vertical', hint: 'A warm-blooded egg-laying vertebrate characterized by feathers' },
        { word: 'BEAR', position: { x: 5, y: 1 }, direction: 'horizontal', hint: 'A large, heavy mammal' }
    ]
];

const grid = Array.from({ length: 10 }, () => Array(10).fill("")); // Create a 10x10 grid
let currentPuzzlesIndex = 0; // Start with the first set of puzzles
let wordInputs = [];
let score = 0; // Player's score
let timer = 60; // Countdown timer in seconds
let timerText; // Reference to the timer display
let correctSound;
let incorrectSound;


function preload() {
    this.load.image('rainbow', 'path_to_rainbow_particle_image.png'); // Load rainbow particle image
    this.load.image('explosion', 'path_to_explosion_particle_image.png'); // Load explosion particle image
    this.load.audio('correctSound', 'path_to_correct_sound.mp3'); // Load sound for correct guess
    this.load.audio('incorrectSound', 'path_to_incorrect_sound.mp3'); // Load sound for incorrect guess
}

// In the create function, replace the direct call to render
function create() {
    loadPuzzles(currentPuzzlesIndex);
    loadProgress(); // Load any saved progress upon creation
    correctSound = this.sound.add('correctSound'); // Add correct sound
    incorrectSound = this.sound.add('incorrectSound'); // Add incorrect sound
    
    // Add a button to switch puzzle sets
    const switchButton = this.add.text(650, 50, 'Switch Puzzle', { font: '20px Arial', fill: '#0000FF' })
        .setInteractive()
        .on('pointerdown', () => {
            currentPuzzlesIndex = (currentPuzzlesIndex + 1) % puzzlesSets.length; // Cycle through puzzles
            loadPuzzles(currentPuzzlesIndex); // Load the new set of puzzles
        });
         // Create score display
    this.add.text(50, 50, 'Score: 0', { font: '20px Arial', fill: '#000000' }).setName('scoreText');

    // Create timer display
    timerText = this.add.text(50, 80, `Time: ${timer}`, { font: '20px Arial', fill: '#000000' }).setName('timerText');

    // Start the countdown timer
    this.time.addEvent({
        delay: 1000, // 1 second
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });

    // Create a button to save progress
    const saveButton = this.add.text(650, 80, 'Save Progress', { font: '20px Arial', fill: '#008800' })
        .setInteractive()
        .on('pointerdown', saveProgress); // Bind save function to click
}

function update() {
  // Game update logic
  if (timer <= 0) {
    // Stop the game if the timer runs out
    this.scene.pause(); // Pause the game or you can implement an end screen
    alert('Time is up! Your final score is: ' + score);
}
}

function loadPuzzles(index) {
    // Clear existing inputs and grid
    this.children.each(child => {
        if (child.type === 'rexInputText' || child instanceof Phaser.GameObjects.Text) {
            child.destroy(); // Remove previous text and input fields
        }
    });
    
    // Get the current puzzle set
    const currentPuzzles = puzzlesSets[index];
    fillGridWithWords(grid, currentPuzzles); // Fill the grid with new words
    renderGrid(this, grid); // Render the new grid
    createInputFields(this, currentPuzzles); // Create input fields for new puzzles
}

function fillGridWithWords(grid, puzzles) {
  puzzles.forEach(({ word, position, direction }) => {
    let { x, y } = position;

    for (let i = 0; i < word.length; i++) {
      if (direction === "horizontal") {
        grid[y][x + i] = word[i]; // Fill horizontally
      } else if (direction === "vertical") {
        grid[y + i][x] = word[i]; // Fill vertically
      }
    }
  });
}

function renderGrid(scene, grid) {
  const startX = 100; // Starting x position for rendering
  const startY = 100; // Starting y position for rendering
  const cellSize = 40; // Size of each cell

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cellValue = grid[row][col];
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      // Visual representation of the cells
      if (cellValue) {
        scene.add.text(x, y, cellValue, {
          font: "32px Arial",
          fill: "#000000",
        });
      } else {
        scene.add
          .rectangle(x, y, cellSize, cellSize, 0xdddddd)
          .setStrokeStyle(1, 0x000000);
      }
    }
  }
}

function createInputFields(scene, puzzles) {
    const startX = scene.cameras.main.width * 0.05; // 5% padding
    const startY = scene.cameras.main.height * 0.75; // Positioned towards the bottom of the screen
    
    puzzles.forEach((puzzle, index) => {
        const input = scene.add.rexInputText(startX, startY + (50 * index), {
            width: scene.cameras.main.width * 0.4, // 40% width
            height: 40,
            type: 'text',
            text: '',
            fontSize: '4vw', // Responsive font size, adjust based on viewport width
            backgroundColor: '#ffffff',
            color: '#000000',
            borderRadius: 10,
            stroke: '#000000',
            strokeThickness: 2
        });

        input.on('textchange', function (textInput) {
            if (textInput.text.length === puzzle.word.length) {
                checkGuess(textInput.text, puzzle.word, textInput);
                textInput.text = ''; // Reset input after guess
            }
        });

        wordInputs.push(input);

        const hintButton = scene.add.text(startX + scene.cameras.main.width * 0.45, startY + (50 * index), 
            'Hint', { font: '2.5vw Arial', fill: '#0000FF' })
            .setInteractive()
            .on('pointerdown', () => {
                alert(puzzle.hint); // Show hint in an alert
            });

        scene.add.text(startX + scene.cameras.main.width * 0.55, startY + (50 * index),
            puzzle.word, { font: '4vw Arial', fill: '#000000', fontStyle: 'italic' });

    });
}

function checkGuess(userInput, correctWord, inputField) {
  if (userInput.toUpperCase() === correctWord) {
    inputField.setStyle({ backgroundColor: "#a0e1a0" }); // Green for correct guess
    handleCorrectGuess(inputField); // Trigger correct guess effects// Update score dis
  } else {
    // Change input background color based on the guess
    inputField.setStyle({ backgroundColor: "#e1a0a0" }); // Red for incorrect guess
    handleIncorrectGuess(inputField); // Trigger incorrect guess effects

    // Optionally, you can provide more feedback, such as highlighting letters when guessed correctly
    provideFeedback(correctWord, userInput);
  }
}

// Function to handle correct guesses
function handleCorrectGuess(inputField) {
    // Play sound for correct guess
    correctSound.play();

    // Create rainbow particles for correct guess
    const particles = this.add.particles('rainbow'); // Create a particle emitter

    const emitter = particles.createEmitter({
        speed: { min: 100, max: 200 },
        scale: { start: 1, end: 0 },
        lifespan: 3000,
        on: true,
        quantity: 10, // Number of particles emitted
        gravityY: 200,
        blendMode: 'ADD'
    });

    // Position particles at the input field's position
    emitter.setPosition(inputField.x + inputField.width / 2, inputField.y + inputField.height / 2); 
}

// Function to handle incorrect guesses
function handleIncorrectGuess(inputField) {
    // Play sound for incorrect guess
    incorrectSound.play();

    // Create explosion particles for incorrect guess
    const particles = this.add.particles('explosion'); // Create a particle emitter

    const emitter = particles.createEmitter({
        speed: { min: 50, max: 100 },
        scale: { start: 0.5, end: 0 },
        lifespan: 500, // Short lifespan for quick explosions
        on: true,
        quantity: 15, // Number of particles emitted
        gravityY: 150,
        blendMode: 'SCREEN' // Change blend mode to 'SCREEN' for explosion effect
    });

    // Position particles at the input field's position
    emitter.setPosition(inputField.x + inputField.width / 2, inputField.y + inputField.height / 2); 
}

// Function to update the timer and handle end of time
function updateTimer() {
    if (timer > 0) {
        timer -= 1; // Decrease timer by 1 second
        const timerText = this.children.getByName('timerText'); // Get the timer display
        timerText.setText(`Time: ${timer}`); // Update timer display
    } else {
        this.scene.pause(); // Pause the game when time runs out
        alert('Time is up! Your final score is: ' + score); // Show final score
    }
}

// Save player progress (score and timer) to localStorage
function saveProgress() {
    const progress = {
        score: score,
        timer: timer,
        currentPuzzlesIndex: currentPuzzlesIndex
    };
    localStorage.setItem('crosswordGameProgress', JSON.stringify(progress)); // Save progress as a JSON string
}

// Load player progress from localStorage
function loadProgress() {
    const progressString = localStorage.getItem('crosswordGameProgress'); // Get saved progress
    if (progressString) {
        const progress = JSON.parse(progressString); // Parse JSON string to object
        score = progress.score; // Load score
        timer = progress.timer; // Load timer
        currentPuzzlesIndex = progress.currentPuzzlesIndex; // Load current puzzle set index
        
        // Update the score and timer text displays
        this.children.getByName('scoreText').setText('Score: ' + score);
        timerText.setText(`Time: ${timer}`);
    }
}

function provideFeedback(correctWord, userInput) {
  for (let i = 0; i < correctWord.length; i++) {
    if (correctWord[i] === userInput[i].toUpperCase()) {
      // Example: highlight the letter in the grid or add special effects
      // You could store the positions and change their styles
      // This is just a simple console log for demonstration
      console.log(`Correct letter: ${correctWord[i]} at position ${i}`);
    }
  }
}

// Start the Phaser game
const game = new Phaser.Game(config);