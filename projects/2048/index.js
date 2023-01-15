

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const gameBoardRenderer = document.querySelectorAll('.game .cell');
const scoreOutput = document.querySelector('[data-score]');
const undoBtn = document.querySelector('[data-undo]');

function main() {
  let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const undoStack = [board.map((arr) => arr.slice())];

  function insertRandom() {
    let randPosX = randint(0, 3);
    let randPosY = randint(0, 3);

    while (board[randPosY][randPosX] !== 0) {
      randPosX = randint(0, 3)
      randPosY = randint(0, 3)
    }
    
    const num = Math.random() < 0.9 ? 2 : 4;
    board[randPosY][randPosX] = num;
  }

  function printBoard() {
    let sum = 0;
    for (let i = 0; i < gameBoardRenderer.length; i++) {
      gameBoardRenderer[i].className = 'cell';
      gameBoardRenderer[i].innerHTML = '';
      const num = board[Math.floor(i / 4)][i % 4];
      if (num != 0) {
        gameBoardRenderer[i].value = num;
        gameBoardRenderer[i].classList.add('_' + num);
        sum += num;
      }
    }
    scoreOutput.value = sum;
  }

  function compareBoard() {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (board[y][x] != undoStack[undoStack.length - 1][y][x]) {
          return false;
        }
      }
    }
    return true;
  }

  insertRandom();
  insertRandom();
  printBoard();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'ArrowRight') {
      for (let y = 0; y < 4; y++) {
        for (let x = 3; x >= 0; x--) {
          if (board[y][x] !== 0) {
            let alreadyFused = false;
            for (let x1 = x + 1; x1 < 4; x1++) {
              if (board[y][x1] === 0) {
                board[y][x1] = board[y][x1 - 1];
                board[y][x1 - 1] = 0;
              } else if (board[y][x1 - 1] === board[y][x1] && !alreadyFused) {
                board[y][x1] *= 2;
                board[y][x1 - 1] = 0;
                alreadyFused = true;
              }
            }
          }
        }
      }
    } else if (e.key === 'a' || e.key === 'ArrowLeft') {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (board[y][x] !== 0) {
            let alreadyFused = false;
            for (let x1 = x - 1; x1 >= 0; x1--) {
              if (board[y][x1] === 0) {
                board[y][x1] = board[y][x1 + 1];
                board[y][x1 + 1] = 0;
              } else if (board[y][x1 + 1] === board[y][x1] && !alreadyFused) {
                board[y][x1] *= 2;
                board[y][x1 + 1] = 0;
                alreadyFused = true;
              }
            }
          }
        }
      }
    } else if (e.key === 's' || e.key === 'ArrowDown') {
      for (let x = 0; x < 4; x++) {
        for (let y = 3; y >= 0; y--) {
          if (board[y][x] !== 0) {
            let alreadyFused = false;
            for (let y1 = y + 1; y1 < 4; y1++) {
              if (board[y1][x] === 0) {
                board[y1][x] = board[y1 - 1][x];
                board[y1 - 1][x] = 0;
              } else if (board[y1 - 1][x] === board[y1][x] && !alreadyFused) {
                board[y1][x] *= 2;
                board[y1 - 1][x] = 0;
                alreadyFused = true;
              }
            }
          }
        }
      }
    } else if (e.key === 'w' || e.key === 'ArrowUp') {
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          if (board[y][x] !== 0) {
            let alreadyFused = false;
            for (let y1 = y - 1; y1 >= 0; y1--) {
              if (board[y1][x] === 0) {
                board[y1][x] = board[y1 + 1][x];
                board[y1 + 1][x] = 0;
              } else if (board[y1 + 1][x] === board[y1][x] && !alreadyFused) {
                board[y1][x] *= 2;
                board[y1 + 1][x] = 0;
                alreadyFused = true;
              }
            }
          }
        }
      }
    }

    console.log(board, undoStack)
    if (!compareBoard()) {
      insertRandom();
      if (undoStack.length > 10) {
        undoStack.shift();
      }
      undoStack.push(board.map((arr) => arr.slice()));
    }
    printBoard();
  });

  undoBtn.addEventListener('click', () => {
    if (undoStack.length <= 2) return;
    undoStack.pop();
    board = undoStack.pop();
    printBoard();
  });
}

main();
