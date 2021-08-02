document.querySelector("#soundBtn").addEventListener("click", function () {
  general.play();
  console.log("hello");
});
let game = null;
let bestScore = 0;
const scoreDiv = document.getElementById("score");
const bestScoreDiv = document.getElementById("bestScore");
const addDiv = document.getElementById("add");
const endDiv = document.getElementById("end");
const size = 4;
let nextId = 1;
let score = 0;
let mute = false;
let audioObj = new Audio("./assets/merge.wav");
let gameOverSound = new Audio("./assets/over.mp3");
let general = new Audio("./assets/btn-click.wav");
var myAudio = new Audio("./assets/game.mp3");
myAudio.volume = 0.2;
gameOverSound.volume = 0.2;
general.volume = 0.2;
myAudio.addEventListener(
  "ended",
  function () {
    this.currentTime = 0;
    this.play();
  },
  false
);

gameOverSound.addEventListener(
  "ended",
  function () {
    this.currentTime = 0;
    this.play();
  },
  false
);

function initGame() {
  game = Array(size * size).fill(null); // 4 x 4 grid, represented as an array
  initBestScore();
}

function initBestScore() {
  bestScore = localStorage.getItem("bestScore") || 0;
  bestScoreDiv.innerHTML = `<p class='rainbow-text'>${bestScore}</p>`;
}

function updateDOM(before, after) {
  const newElements = getNewElementsDOM(before, after);
  const existingElements = getExistingElementsDOM(before, after);
  const mergedTiles = getMergedTiles(after);
  removeElements(mergedTiles);
  drawGame(newElements, true);
  drawGame(existingElements);
}

function removeElements(mergedTiles) {
  for (let tile of mergedTiles) {
    for (let id of tile.mergedIds) {
      const currentElm = document.getElementById(id);
      positionTile(tile, currentElm);
      if (!mute) {
        audioObj.play();
      }
      setTimeout(() => {
        currentElm.remove();
      }, 100);
    }
  }
}

function getMergedTiles(after) {
  return after.filter((tile) => tile && tile.mergedIds);
}

function getNewElementsDOM(before, after) {
  const beforeIds = before.filter((tile) => tile).map((tile) => tile.id);
  const newElements = after.filter((tile) => {
    return tile && beforeIds.indexOf(tile.id) === -1;
  });
  return newElements;
}

function getExistingElementsDOM(before, after) {
  const beforeIds = before.filter((tile) => tile).map((tile) => tile.id);
  const existingElements = after.filter((tile) => {
    return tile && beforeIds.indexOf(tile.id) !== -1;
  });
  return existingElements;
}

function drawBackground() {
  const tileContainer = document.getElementById("tile-container");
  tileContainer.innerHTML = "";
  for (let i = 0; i < game.length; i++) {
    const tile = game[i];
    const tileDiv = document.createElement("div");
    const x = i % size;
    const y = Math.floor(i / size);
    tileDiv.style.top = `${y * 100}px`;
    tileDiv.style.left = `${x * 100}px`;

    tileDiv.classList.add("background");
    tileContainer.appendChild(tileDiv);
  }
}

function positionTile(tile, elm) {
  const x = tile.index % size;
  const y = Math.floor(tile.index / size);
  elm.style.top = `${y * 100}px`;
  elm.style.left = `${x * 100}px`;
}

function drawGame(tiles, isNew) {
  const tileContainer = document.getElementById("tile-container");
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (tile) {
      if (isNew) {
        const tileDiv = document.createElement("div");
        positionTile(tile, tileDiv);
        tileDiv.classList.add("tile", `tile--${tile.value}`);
        tileDiv.id = tile.id;
        setTimeout(
          () => {
            tileDiv.classList.add("tile--pop");
          },
          tile.mergedIds ? 1 : 150
        );
        tileDiv.innerHTML = `<p>${tile.value}</p>`;
        tileContainer.appendChild(tileDiv);
      } else {
        const currentElement = document.getElementById(tile.id);
        positionTile(tile, currentElement);
      }
    }
  }
}

function gameOver() {
  // return true;
  if (game.filter((number) => number === null).length === 0) {
    const sameNeighbors = game.find((tile, i) => {
      const isRightSame =
        game[i + 1] && (i + 1) % 4 !== 0
          ? tile.value === game[i + 1].value
          : false;
      const isDownSame = game[i + 4] ? tile.value === game[i + 4].value : false;
      if (isRightSame || isDownSame) {
        return true;
      }
      return false;
    });
    return !sameNeighbors;
  }
}

function generateNewNumber() {
  // 0.9 probability of 2, 0.1 probability of 4
  const p = Math.random() * 100;
  return p <= 90 ? 2 : 4;
}

function addRandomNumber() {
  // Adds either a 2 or a 4 to an empty position in the game array
  const emptyCells = game
    .map((_, index) => index)
    .filter((index) => game[index] === null);
  if (emptyCells.length === 0) {
    return;
  }
  const newPos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newObj = {
    id: nextId++,
    index: newPos,
    value: generateNewNumber(),
  };
  game.splice(newPos, 1, newObj);
}

function getIndexForPoint(x, y) {
  return y * size + x;
}

function reflectGrid(grid) {
  let reflectedGame = Array(size * size).fill(0);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const index1 = getIndexForPoint(col, row);
      const index2 = getIndexForPoint(size - col - 1, row);
      reflectedGame[index1] = grid[index2];
    }
  }
  return reflectedGame;
}

function rotateLeft90Deg(grid) {
  let rotatedGame = Array(size * size).fill(0);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const index1 = getIndexForPoint(col, row);
      const index2 = getIndexForPoint(size - 1 - row, col);
      rotatedGame[index1] = grid[index2];
    }
  }
  return rotatedGame;
}

function rotateRight90Deg(grid) {
  let rotatedGame = Array(size * size).fill(0);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const index1 = getIndexForPoint(col, row);
      const index2 = getIndexForPoint(row, size - 1 - col);
      rotatedGame[index1] = grid[index2];
    }
  }
  return rotatedGame;
}

/*
For any cell whose neighbor to the right is empty, move that cell
to the right. For any cell whose neighbor to the right is equal
to the same value, combine the values together (e.g. 2+2 = 4)
*/
function shiftGameRight(gameGrid) {
  // reflect game grid
  let reflectedGame = reflectGrid(gameGrid);
  // shift left
  reflectedGame = shiftGameLeft(reflectedGame);
  // reflect back
  return reflectGrid(reflectedGame);
}

function shiftGameLeft(gameGrid) {
  let newGameState = [];
  let totalAdd = 0;
  // for rows
  for (let i = 0; i < size; i++) {
    // for columns
    const firstPos = 4 * i;
    const lastPos = size + 4 * i;
    const currentRow = gameGrid.slice(firstPos, lastPos);
    const filteredRow = currentRow.filter((row) => row);
    for (let row of filteredRow) {
      delete row.mergedIds;
    }

    for (let j = 0; j < filteredRow.length - 1; j++) {
      if (filteredRow[j].value === filteredRow[j + 1].value) {
        const sum = filteredRow[j].value * 2;
        filteredRow[j] = {
          id: nextId++,
          mergedIds: [filteredRow[j].id, filteredRow[j + 1].id],
          value: sum,
        };
        filteredRow.splice(j + 1, 1);
        score += sum;
        totalAdd += sum;
      }
    }
    while (filteredRow.length < size) {
      filteredRow.push(null);
    }
    newGameState = [...newGameState, ...filteredRow];
  }

  if (totalAdd > 0) {
    scoreDiv.innerHTML = `<p class='rainbow-text'>${score}</p>`;
    addDiv.innerHTML = `+${totalAdd}`;
    addDiv.classList.add("active");
    let div = document.createElement("div");
    div.classList.add("bubble");
    div.classList.add("x10");
    div.classList.add("add");
    div.innerText = totalAdd;
    div.style.position = "absolute";
    // div.style.backgroundImage = "url('./assets/bubble.png')";
    div.style.left = `${getPosition()}px`;
    // div.style.zIndex = "-1";
    setTimeout(function () {
      div.remove();
    }, 7000);
    document.body.appendChild(div);
    setTimeout(function () {
      addDiv.classList.remove("active");
    }, 800);
    if (score > bestScore) {
      localStorage.setItem("bestScore", score);
      initBestScore();
    }
  }
  return newGameState;
}

function getPosition() {
  let l = document.querySelector(".game").getBoundingClientRect().x;
  let r = l + document.querySelector(".game").getBoundingClientRect().width;

  let pos = Math.floor(Math.random() * window.innerWidth);

  if (pos > l - 150 && pos < r + 100) pos = Math.floor(Math.random() * 200);

  return pos;
}

function shiftGameUp(gameGrid) {
  let rotatedGame = rotateLeft90Deg(gameGrid);
  rotatedGame = shiftGameLeft(rotatedGame);
  return rotateRight90Deg(rotatedGame);
}

function shiftGameDown(gameGrid) {
  let rotatedGame = rotateRight90Deg(gameGrid);
  rotatedGame = shiftGameLeft(rotatedGame);
  return rotateLeft90Deg(rotatedGame);
}

const buttons = document.querySelectorAll(".js-restart-btn");
const length = buttons.length;
for (let i = 0; i < length; i++) {
  if (document.addEventListener) {
    buttons[i].addEventListener("click", function () {
      newGameStart();
    });
  } else {
    buttons[i].attachEvent("onclick", function () {
      newGameStart();
    });
  }
}

document.addEventListener("keydown", handleKeypress);
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
  const prevGame = [...game];
  if (!xDown || !yDown) {
    return;
  }
  const xUp = evt.touches[0].clientX;
  const yUp = evt.touches[0].clientY;

  const xDiff = xDown - xUp;
  const yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      game = shiftGameLeft(game);
    } else {
      game = shiftGameRight(game);
    }
  } else {
    if (yDiff > 0) {
      game = shiftGameUp(game);
    } else {
      game = shiftGameDown(game);
    }
  }
  game = game.map((tile, index) => {
    if (tile) {
      return {
        ...tile,
        index,
      };
    } else {
      return null;
    }
  });
  if (_.isEqual(prevGame, game)) return;
  addRandomNumber();
  updateDOM(prevGame, game);
  if (gameOver()) {
    if (!mute) {
      gameOverSound.play();
      myAudio.pause();
    }
    setTimeout(() => {
      endDiv.classList.add("active");
    }, 800);
    return;
  }
  xDown = null;
  yDown = null;
}

function handleKeypress(evt) {
  var modifiers =
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  var whichKey = event.which;

  const prevGame = [...game];

  if (!modifiers) {
    event.preventDefault();
    switch (whichKey) {
      case 37:
        game = shiftGameLeft(game);
        break;
      case 38:
        game = shiftGameUp(game);
        break;
      case 39:
        game = shiftGameRight(game);
        break;
      case 40:
        game = shiftGameDown(game);
        break;
    }
    game = game.map((tile, index) => {
      if (tile) {
        return {
          ...tile,
          index,
        };
      } else {
        return null;
      }
    });
    if (_.isEqual(prevGame, game)) return;
    addRandomNumber();
    updateDOM(prevGame, game);
    if (gameOver()) {
      if (!mute) {
        gameOverSound.play();
        myAudio.pause();
      }
      setTimeout(() => {
        endDiv.classList.add("active");
      }, 800);
      return;
    }
  }
}

function newGameStart() {
  document.getElementById("tile-container").innerHTML = "";
  endDiv.classList.remove("active");
  score = 0;
  scoreDiv.innerHTML = `<p class='rainbow-text'>${score}</p>`;
  initGame();
  drawBackground();
  const previousGame = [...game];
  addRandomNumber();
  addRandomNumber();
  updateDOM(previousGame, game);
  gameOverSound.pause();
  if (!mute) myAudio.play();
}

newGameStart();

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
  if (!mute) general.play();
  if (!mute) myAudio.play();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    if (!mute) myAudio.play();
  }
};

window.onload = function (e) {
  modal.style.display = "block";
};

function changeSoundSettings() {
  // console.log(document.querySelector("#soundBtn").innerHTML);
  // document.querySelector("#soundBtn").innerHTML = `${
  //   document.querySelector("#soundBtn").innerHTML ===
  //   '<i class="fas fa-volume-mute"></i>'
  //     ? '<i class="fas fa-volume-down"></i>'
  //     : '<i class="fas fa-volume-mute"></i>'
  // }`;

  if (mute) {
    document.querySelector("#soundBtn").innerHTML =
      '<i class="fas fa-volume-down"></i>';
    if (gameOver()) gameOverSound.play();
    else myAudio.play();
    mute = !mute;
  } else {
    document.querySelector("#soundBtn").innerHTML =
      '<i class="fas fa-volume-mute"></i>';
    gameOverSound.pause();
    myAudio.pause();
    mute = !mute;
  }

  // if (
  //   document.querySelector("#soundBtn").innerHTML ===
  //   '<i class="fas fa-volume-mute"></i>'
  // )
  //   mute = true;
  // else mute = false;

  // mute = !mute;
}

function playGeneralMusic() {
  if (!mute) general.play();
}

document.querySelector("#myBtn").addEventListener("click", function () {
  if (!mute) general.play();
});
document.querySelector("#soundBtn").addEventListener("click", function () {
  general.play();
});
