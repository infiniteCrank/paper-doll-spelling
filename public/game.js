window.onload = function () {
  class CrosswordGame extends Phaser.Scene {
    constructor() {
      super({ key: "CrosswordGame" });
      this.puzzlesSets = this.initializePuzzleSets();
      this.grid = Array.from({ length: 10 }, () => Array(10).fill("")); // Create a 10x10 grid
      this.currentPuzzlesIndex = 0; // Start with the first set of puzzles
      this.wordInputs = [];
      this.score = 0; // Player's score
      this.timer = 60; // Countdown timer in seconds
    }

    initializePuzzleSets() {
      return [
        // Define your puzzles here
        [
          {
            word: "CAT",
            position: { x: 0, y: 0 },
            direction: "horizontal",
            hint: "A small domesticated carnivorous mammal",
          },
          {
            word: "DOG",
            position: { x: 0, y: 1 },
            direction: "vertical",
            hint: "A domesticated carnivorous mammal that typically has a long snout",
          },
          {
            word: "FISH",
            position: { x: 1, y: 1 },
            direction: "horizontal",
            hint: "A limbless cold-blooded vertebrate animal",
          },
        ],
        // Add more puzzle sets as necessary
      ];
    }

    preload() {
      // this.load.image("rainbow", "path_to_rainbow_particle_image.png");
      // this.load.image("explosion", "path_to_explosion_particle_image.png");
      // this.load.audio("correctSound", "path_to_correct_sound.mp3");
      // this.load.audio("incorrectSound", "path_to_incorrect_sound.mp3");
      this.load.scenePlugin({
        key: "rexuiplugin",
        url: "http://localhost:8080/js/rexuiplugin.min.js",
        sceneKey: "rexUI",
      });

      this.load.plugin(
        "rextexteditplugin",
        "http://localhost:8080/js/rextexteditplugin.min.js",
        true
      );
    }

    create() {
      // this.correctSound = this.sound.add("correctSound");
      // this.incorrectSound = this.sound.add("incorrectSound");
      // Initial setup (score, timer, etc.)
      this.score = 0;
      this.timer = 60; // Set initial timer value
      this.timerText = this.createText(50, 80, `Time: ${this.timer}`);
      this.scoreText = this.createText(50, 50, "Score: 0");

      this.addSwitchPuzzleButton();
      this.addSaveProgressButton();
      this.loadProgress();
      this.loadPuzzles(this.currentPuzzlesIndex);

      // Start the countdown timer
      this.startTimer();
    }

    createText(x, y, text) {
      return this.add.text(x, y, text, { font: "20px Arial", fill: "#000000" });
    }

    addSwitchPuzzleButton() {
      const switchButton = this.add
        .text(650, 50, "Switch Puzzle", { font: "20px Arial", fill: "#0000FF" })
        .setInteractive()
        .on("pointerdown", () => {
          this.currentPuzzlesIndex =
            (this.currentPuzzlesIndex + 1) % this.puzzlesSets.length;
          this.loadPuzzles(this.currentPuzzlesIndex);
        });
    }

    addSaveProgressButton() {
      const saveButton = this.add
        .text(650, 80, "Save Progress", { font: "20px Arial", fill: "#008800" })
        .setInteractive()
        .on("pointerdown", () => this.saveProgress());
    }

    loadPuzzles(index) {
      this.clearPreviousInputs();
      const currentPuzzles = this.puzzlesSets[index];
      this.fillGridWithWords(currentPuzzles);
      this.renderGrid();
      this.createInputFields(currentPuzzles);
    }

    clearPreviousInputs() {
      this.children.each((child) => {
        if (
          child.type === "rexInputText" ||
          child instanceof Phaser.GameObjects.Text
        ) {
          child.destroy();
        }
      });
    }

    fillGridWithWords(puzzles) {
      puzzles.forEach(({ word, position, direction }) => {
        let { x, y } = position;

        for (let i = 0; i < word.length; i++) {
          if (direction === "horizontal") {
            this.grid[y][x + i] = word[i];
          } else if (direction === "vertical") {
            this.grid[y + i][x] = word[i];
          }
        }
      });
    }

    renderGrid() {
      const startX = 100;
      const startY = 100;
      const cellSize = 40;

      for (let row = 0; row < this.grid.length; row++) {
        for (let col = 0; col < this.grid[row].length; col++) {
          const cellValue = this.grid[row][col];
          const x = startX + col * cellSize;
          const y = startY + row * cellSize;

          // Visual representation of the cells
          if (cellValue) {
            this.add.text(x, y, cellValue, {
              font: "32px Arial",
              fill: "#000000",
            });
          } else {
            this.add
              .rectangle(x, y, cellSize, cellSize, 0xdddddd)
              .setStrokeStyle(1, 0x000000);
          }
        }
      }
    }

    // In createInputFields method
    createInputFields(puzzles) {
      const startX = this.cameras.main.width * 0.05; // 5% padding
      const startY = this.cameras.main.height * 0.75; // Positioned towards the bottom of the screen

      puzzles.forEach((puzzle, index) => {
        const input = this.createInputField(
          startX,
          startY + 50 * index,
          puzzle
        );
        this.wordInputs.push(input);

        // Create the hint button and it's already added to the scene through the method
        this.createHintButton(startX, startY + 50 * index, puzzle);

        // Display the actual word (optional, depending on your game design)
        this.add.text(
          startX + this.cameras.main.width * 0.55,
          startY + 50 * index,
          puzzle.word,
          { font: "4vw Arial", fill: "#000000", fontStyle: "italic" }
        );
      });
    }

    createInputField(x, y, puzzle) {
      // Make the HTML input field visible and position it
      const inputField = document.getElementById("inputField");
      inputField.style.left = `${x}px`;
      inputField.style.top = `${y}px`;
      inputField.style.display = "block"; // Show the input field
      inputField.value = ""; // Clear previous input

      inputField.oninput = () => {
        if (inputField.value.length === puzzle.word.length) {
          this.checkGuess(inputField.value, puzzle.word);
          inputField.value = ""; // Reset input after guess
        }
      };

      return inputField;
    }

    createHintButton(x, y, puzzle) {
      // Create the hint button and automatically add it to the scene
      return this.add
        .text(x + this.cameras.main.width * 0.45, y, "Hint", {
          font: "2.5vw Arial",
          fill: "#0000FF",
        })
        .setInteractive() // Make it interactive
        .on("pointerdown", () => {
          alert(puzzle.hint); // Show hint in an alert
        });
    }

    checkGuess(userInput, correctWord, inputField) {
      if (userInput.toUpperCase() === correctWord) {
        this.score++;
        this.correctSound.play();
        inputField.setStyle({ backgroundColor: "#a0e1a0" }); // Green for correct guess
      } else {
        inputField.setStyle({ backgroundColor: "#e1a0a0" }); // Red for incorrect guess
        this.incorrectSound.play();
      }
      this.scoreText.setText("Score: " + this.score); // Update score display
    }

    startTimer() {
      this.time.addEvent({
        delay: 1000, // 1 second
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      });
    }

    updateTimer() {
      if (this.timerText) { // Check if timerText is valid
        if (this.timer > 0) {
          this.timer--;
          this.timerText.setText(`Time: ${this.timer}`);
        } else {
          this.scene.pause(); // Pause game when time runs out
          this.time.removeAllEvents(); // Remove timer events to prevent further updates
          alert("Time is up! Your final score is: " + this.score); // Show final score
        }
      } else {
        console.error("timerText is not initialized");
      }
    }

    saveProgress() {
      const progress = {
        score: this.score,
        timer: this.timer,
        currentPuzzlesIndex: this.currentPuzzlesIndex,
      };
      localStorage.setItem("crosswordGameProgress", JSON.stringify(progress));
    }

    loadProgress() {
      const progressString = localStorage.getItem("crosswordGameProgress");
      if (progressString) {
        const progress = JSON.parse(progressString);
        this.score = progress.score;
        this.timer = progress.timer;
        this.currentPuzzlesIndex = progress.currentPuzzlesIndex;
        this.scoreText.setText("Score: " + this.score);
        this.timerText.setText(`Time: ${this.timer}`);
      }
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: "phaser-container",
    dom: {
      createContainer: true,
    },
    scene: CrosswordGame,
  };

  // Start the Phaser game
  const game = new Phaser.Game(config);
};
