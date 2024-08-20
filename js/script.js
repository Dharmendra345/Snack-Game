// Game Constants & Variables
let soundEnabled = true;
let inputDir = { x: 1, y: 1 };
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
let speed = 8; // you can change the speed
let score = 0;
let highScore = 0;
let lastPaintTime = 0;
let snakeArr = [
  { x: 13, y: 15 }
];

food = { x: 6, y: 7 };

// Variable to track if the game has started
let gameStarted = false;

// Swipe Variables
let startX = null;
let startY = null;

document.addEventListener('DOMContentLoaded', function () {
  confirmSoundPreference();

  // fetch the high score from php file
  fetch("deal_with_db.php")
    .then(response => response.text())
    .then(data => {
      if(!isNaN(data)) {

        highScore = data;
        // Data is numeric, display it as is
        document.getElementById("hiscoreBox").textContent = "HiScore: " + data;
      } else {
        // Data is not numeric, set it to "0"
        document.getElementById("hiscoreBox").textContent = "HiScore: 0";
      }
    })
    .catch(error => {
      console.error("Error fetching highscore:", error);
    });
});

// Game Functions
function main(ctime) {
  window.requestAnimationFrame(main);
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
    return;
  }
  lastPaintTime = ctime;

  // Check if the game has started before executing gameEngine
  if (gameStarted) {
    gameEngine();
  }
}

function toggleSoundPreference() {
  soundEnabled = !soundEnabled;
  if (!soundEnabled) {
    // Mute all sounds
    foodSound.muted = true;
    gameOverSound.muted = true;
    moveSound.muted = true;
  } else {
    // Unmute all sounds
    foodSound.muted = false;
    gameOverSound.muted = false;
    moveSound.muted = false;
  }
}

// Function to confirm sound preference
function confirmSoundPreference() {
  const allowSound = confirm("Do you want to allow sound?");
  if (!allowSound) {
    toggleSoundPreference(); // Mute sounds if user disallows
  }
}

// Modify your sound functions to check soundEnabled before playing
function playSound(audio) {
  if (soundEnabled) {
    audio.play();
  }
}

function hideMessage() {
  // Function to hide the message
  const board = document.getElementById('board');
  board.classList.add('hide-message');
}

function isCollide(snake) {
  // If you bump into yourself
  for (let i = 1; i < snakeArr.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
  // If you bump into the wall
  if (snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0) {
    return true;
  }

  return false;
}

function gameEngine() {
  // Part 1: Updating the snake array & Food
  if (isCollide(snakeArr)) {
    playSound(gameOverSound);
    inputDir = { x: 0, y: 0 };
    alert("Game Over. Press any key to play again!");
    snakeArr = [{ x: 13, y: 15 }];

    // Send the score to the PHP script
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "deal_with_db.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("High score retrieved from php: " + xhr.responseText); // This will show the response from the PHP script
        }
    };
    xhr.send("score=" + score); // Send the score to PHP

    score = 0;
    scoreBox.innerHTML = "Score: " + score;
  }

  // If you have eaten the food, increment the score and regenerate the food
  if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
    playSound(foodSound);
    score += 1;
    if (score > highScore) {
      highScore = score;
      hiscoreBox.innerHTML = "HiScore: " + highScore;
    }
    scoreBox.innerHTML = "Score: " + score;
    snakeArr.unshift({ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y });
    let a = 2;
    let b = 16;
    food = { x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) };
  }

  // Moving the snake
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }

  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  // Part 2: Display the snake and Food
  // Display the snake
  board.innerHTML = "";
  snakeArr.forEach((e, index) => {
    snakeElement = document.createElement('div');
    snakeElement.style.gridRowStart = e.y;
    snakeElement.style.gridColumnStart = e.x;

    if (index === 0) {
      snakeElement.classList.add('head');
      updateHeadDirection(snakeElement);
    } else {
      snakeElement.classList.add('snake');
    }
    board.appendChild(snakeElement);
  });
  // Display the food
  foodElement = document.createElement('div');
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add('food');
  board.appendChild(foodElement);
}

// Function to handle swipe events
function handleSwipe(event) {
  if (startX === null || startY === null) {
    return;
  }

  const deltaX = event.changedTouches[0].pageX - startX;
  const deltaY = event.changedTouches[0].pageY - startY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (deltaX > 0) {
      // Right swipe
      inputDir = { x: 1, y: 0 };
    } else {
      // Left swipe
      inputDir = { x: -1, y: 0 };
    }
  } else {
    // Vertical swipe
    if (deltaY > 0) {
      // Down swipe
      inputDir = { x: 0, y: 1 };
    } else {
      // Up swipe
      inputDir = { x: 0, y: -1 };
    }
  }

  // Start the game if it hasn't started
  if (!gameStarted) {
    gameStarted = true;
    main(0); // Trigger the game loop immediately
  }

}

// Event listeners for swipe events
board.addEventListener('touchstart', function(event) {
  event.preventDefault();
  startX = event.touches[0].pageX;
  startY = event.touches[0].pageY;
});

board.addEventListener('touchend', function(event) {
  event.preventDefault();
  handleSwipe(event);
  startX = null;
  startY = null;
  hideMessage();
});

// Function to update snake head's direction class
function updateHeadDirection(headElement) {
  headElement.classList.remove('up', 'down', 'left', 'right');

  if (inputDir.x === 0 && inputDir.y === -1) {
    headElement.classList.add('up');
  } else if (inputDir.x === 0 && inputDir.y === 1) {
    headElement.classList.add('down');
  } else if (inputDir.x === -1 && inputDir.y === 0) {
    headElement.classList.add('left');
  } else if (inputDir.x === 1 && inputDir.y === 0) {
    headElement.classList.add('right');
  }
}

// Main logic starts here

// Add an event listener to start the game when a key is pressed
window.addEventListener('keydown', e => {
  // Check if the game has started, and if not, start it
  if (!gameStarted) {
    gameStarted = true;
  }

  // Log information about the key press
  console.log("Key pressed:", e.key);

  // Check if the pressed key is in the opposite direction of the current movement
  if (
    (e.key === "ArrowUp" && inputDir.y === 1) ||
    (e.key === "ArrowDown" && inputDir.y === -1) ||
    (e.key === "ArrowLeft" && inputDir.x === 1) ||
    (e.key === "ArrowRight" && inputDir.x === -1)
  ) {
    // Ignore the keypress, as it's in the opposite direction
    e.preventDefault();
    return;
  }

  inputDir = { x: 0, y: 1 }; // Start the game
  playSound(moveSound);
  hideMessage();

  switch (e.key) {
    case "ArrowUp":
      console.log("ArrowUp key pressed");
      inputDir.x = 0;
      inputDir.y = -1;
      break;
    case "ArrowDown":
      console.log("ArrowDown key pressed");
      inputDir.x = 0;
      inputDir.y = 1;
      break;
    case "ArrowLeft":
      console.log("ArrowLeft key pressed");
      inputDir.x = -1;
      inputDir.y = 0;
      break;
    case "ArrowRight":
      inputDir.x = 1;
      inputDir.y = 0;
      break;
    default:
      break;
  }
});

// Start the game loop
window.requestAnimationFrame(main);