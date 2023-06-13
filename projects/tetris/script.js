const canvas = document.getElementById("main");
const scoreDisp = document.getElementById("score");

/**@type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");


const fieldWidth = 12;
const fieldHeight = 18;
canvas.width = 360; // 30 * 12
canvas.height = 540; // 30 * 18

const SPACE = 0;
const BLOCK = 1;
const BLOCK_LOCKED = 2;
const BORDER = 3;
const FULL_LINE = 4;

const shapes = [
  "  x " +
  "  x " +
  "  x " +
  "  x ",

  "  x " +
  " xx " +
  " x " +
  "    ",

  " x  " +
  " xx " +
  "  x " +
  "    ",

  "    " +
  " xx " +
  " xx " +
  "    ",

  "  x " +
  " xx " +
  "  x " +
  "    ",

  "    " +
  " xx " +
  "  x " +
  "  x ",

  "    " +
  "  xx" +
  "  x " +
  "  x ",
]

const field = Array(fieldHeight * fieldWidth);


function getShapeSymbolIdx(x, y, r = 4) {
  /*
  each shape is defined as a 4x4 16 char string
  instead of using 2d arrays, each char can be indexed in a continous way
  0  1  2  3
  4  5  6  7
  8  9  10 11
  12 13 14 15
  the index is current_row * cols + current_col
  eg. the 10th element is on row 2 col 2, the idx is 2 * 4 + 2 = 10

  when the whole 4x4 space is rotated, the indexes can be gotten
  using the formulas
  90deg: rows * (col - 1) + current_row - (4 * current_col)
  180deg: (rows * cols - 1) - (current_row * cols) - current_col
  290deg: (rows - 1) - current_col + current_row * cols
  */

  switch (r % 4) {
    case 0:
      return y * 4 + x;
    case 1: // 90deg
      return 12 + y - (4 * x);
    case 2: // 180deg
      return 15 - (y * 4) - x
    case 3: // 270deg
      return 3 - y + (4 * x)
  }
}

function getFieldIdx(x, y) {
  return y * fieldWidth + x;
}

function shapeFits(shapeIdx, rotation, posX, posY) {
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      const symbolIdx = getShapeSymbolIdx(x, y, rotation);
      const shapeIdxInField = getFieldIdx(posX + x, posY + y);
      // in bounds, ofc it can equal to 0 
      if (posX + x >= 0 && posX + x < fieldWidth &&
          posY + y >= 0 && posY + y < fieldHeight) {
        if (shapes[shapeIdx][symbolIdx] === 'x' && field[shapeIdxInField] !== SPACE) {
          return false;
        }
      }
    }
  }
  return true;
}


// init field
for (let x = 0; x < fieldWidth; x++) {
  for (let y = 0; y < fieldHeight; y++) {
    if (x === 0 || x === fieldWidth - 1 || y === fieldHeight - 1) {
      field[getFieldIdx(x, y)] = BORDER;
    } else {
      field[getFieldIdx(x, y)] = SPACE;
    }
  }
}


// keys A S D F: left right down rotate
const keyPressed = {a: false, s: false, d: false, f: false};
document.addEventListener("keydown", e => {
  if (e.key in keyPressed) {
    keyPressed[e.key] = true;
  }
})
document.addEventListener("keyup", e => {
  if (e.key in keyPressed) {
    keyPressed[e.key] = false;
  }
})


let gameRunning = true;

let currentPiece = 0;
let currentRotation = 0;
let currentX = fieldWidth / 2;
let currentY = 0;

// only rotate onece per f key press so it won't spin very fast
let isRotateHeld = false;

let interval = 20
let tickCount = 0
let movingDown = false;
let piecesFallen = 0;

const lines = [];

let score = 0;

async function main() {
  // reset field
  for (let i = 0; i < field.length; i++) {
    if (field[i] === BLOCK) {
      field[i] = SPACE;
    }
  }

  // timing 
  await new Promise(res => setTimeout(res, 50));
  tickCount++;
  movingDown = tickCount == interval;


  // controls
  if (keyPressed.a) {
    if (shapeFits(currentPiece, currentRotation, currentX - 1, currentY)) {
      currentX -= 1;
    }
  }
  if (keyPressed.d) {
    if (shapeFits(currentPiece, currentRotation, currentX + 1, currentY)) {
      currentX += 1;
    }
  }
  if (keyPressed.s) {
    if (shapeFits(currentPiece, currentRotation, currentX, currentY + 1)) {
      currentY += 1;
    }
  }
  if (keyPressed.f) {
    if (!isRotateHeld && shapeFits(currentPiece, currentRotation + 1, currentX, currentY)) {
      currentRotation += 1;
      isRotateHeld = true;
    }
  } else {
    isRotateHeld = false;
  }

  // moving pieces down
  if (movingDown) {
    if (shapeFits(currentPiece, currentRotation, currentX, currentY + 1)) {
      currentY += 1;
    } else {
      // lock piece
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          if (shapes[currentPiece][getShapeSymbolIdx(x, y, currentRotation)] == 'x') {
            field[getFieldIdx(currentX + x, currentY + y)] = BLOCK_LOCKED;
          }
        }
      }

      // make it faster after each 10 drops
      piecesFallen++;
      if (piecesFallen % 10 === 0 && interval > 3) {
        interval--;
      }

      // check for full lines
      for (let y = 0; y < 4; y++) {
        if (currentY + y < fieldHeight - 1) {
          let hasLine = true;
          for (let x = 1; x < fieldWidth - 1; x++) {
            if (field[getFieldIdx(x, currentY + y)] === SPACE) {
              hasLine = false;
            }
          }

          if (hasLine) {
            for (let x = 1; x < fieldWidth - 1; x++) {
              field[getFieldIdx(x, currentY + y)] = FULL_LINE;
            }
            lines.push(currentY + y);
          }
        }
      }

      // increase score, give more score for completed lines
      score += 25;
      if (lines.length > 0) {
        score += 100 * (2 ** (lines.length - 1));
      }

      // choose next piece
      currentX = fieldWidth / 2;
      currentY = 0;
      currentRotation = 0;
      currentPiece = Math.floor(Math.random() * shapes.length);

      // game over check
      if (!shapeFits(currentPiece, currentRotation, currentX, currentY)) {
        gameRunning = false;
      }
    }

    tickCount = 0;
  }


  // put current piece to the field
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (shapes[currentPiece][getShapeSymbolIdx(x, y, currentRotation)] === "x") {
        field[getFieldIdx(currentX + x, currentY + y)] = BLOCK;
      }
    }
  }
  
  // draw field
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(128, 128, 128, 0.9)";
  for (let x = 0; x < fieldWidth; x++) {
    for (let y = 0; y < fieldHeight; y++) {
      switch (field[getFieldIdx(x, y)]) {
        case SPACE:
          ctx.fillStyle = "lightgray";
          break;
        case BLOCK:
        case BLOCK_LOCKED:
          ctx.fillStyle = "#ff0000";
          break;
        case BORDER:
          ctx.fillStyle = "gray";
          break;
        case FULL_LINE:
          ctx.fillStyle = "green";
          break;
        default:
          ctx.fillStyle = "black";
      }
      ctx.beginPath();
      ctx.rect(x * 30, y * 30, 30, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // draw score
  scoreDisp.value = score;

  // animate fulll line disappearing
  if (lines.length > 0) {
    await new Promise(res => setTimeout(res, 300));
    // move all the pixels down
    for (let l of lines) {
      for (let x = 1; x < fieldWidth - 1; x++) {
        for (let y = l; y > 0; y--) {
          field[getFieldIdx(x, y)] = field[getFieldIdx(x, y - 1)];
        }
        field[x] = SPACE;
      }
    }
    lines.length = 0;
  }

  // game over
  if (!gameRunning) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", 100, 100);
    ctx.fillText(`Score: ${score}`, 100, 150);
    return; 
  }

  requestAnimationFrame(main);
}

main();
