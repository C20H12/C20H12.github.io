const canvas = document.querySelector('#main');
canvas.height = 500;
canvas.width = 500;
const ctx = canvas.getContext('2d');

const scoreDisp = document.querySelector('#score');
const statusDisp = document.querySelector("#status");

const snake = [
  [100, 100],
  [90, 100],
  [80, 100],
  [70, 100],
  [60, 100],
];

let playing = true;

let dir;
document.addEventListener('keydown', (e) => {
  if (
    (dir == 'w' && e.key == 's') ||
    (dir == 's' && e.key == 'w') ||
    (dir == 'a' && e.key == 'd') ||
    (dir == 'd' && e.key == 'a')
  )
    return;
  if (['w', 'a', 's', 'd'].includes(e.key)) {
    dir = e.key;
  }
});

let randCoord = [
  Math.random() * (canvas.width - 20),
  Math.random() * (canvas.height - 20),
];

async function animate() {
  ctx.clearRect(0, 0, canvas.height, canvas.width);
  ctx.fillStyle = 'black';

  if (!playing) {
    statusDisp.value = "GAME OVER"
    return;
  }

  if (dir != undefined) {
    snake.pop();
    const newCoord = [snake[0][0], snake[0][1]];
    switch (dir) {
      case 'w':
        newCoord[1] = snake[0][1] - 10;
        break;
      case 'a':
        newCoord[0] = snake[0][0] - 10;
        break;
      case 's':
        newCoord[1] = snake[0][1] + 10;
        break;
      case 'd':
        newCoord[0] = snake[0][0] + 10;
        break;
    }
    snake.unshift(newCoord);
    // console.log(snake);

    const head = snake[0];
    if (
      snake.some((s, i) => i > 0 && s[0] == head[0] && s[1] == head[1]) ||
      head[0] <= 0 ||
      head[1] <= 0 ||
      head[0] >= canvas.width ||
      head[1] >= canvas.height
    ) {
      playing = false;
    }

    if (
      head[0] >= randCoord[0] - 10 &&
      head[0] <= randCoord[0] + 10 &&
      head[1] >= randCoord[1] - 10 &&
      head[1] <= randCoord[1] + 10
    ) {
      console.log(head, randCoord);
      snake.unshift(newCoord);
      randCoord = [
        Math.random() * canvas.width - 20,
        Math.random() * canvas.height - 20,
      ];

      scoreDisp.value++;
    }
  }

  for (let s of snake) {
    ctx.beginPath();
    ctx.rect(s[0], s[1], 10, 10);
    ctx.fill();
  }

  const apple = new Path2D();
  apple.rect(randCoord[0], randCoord[1], 10, 10);
  apple.closePath();
  ctx.fillStyle = 'red';
  ctx.fill(apple);

  await new Promise((res, _) => setTimeout(res, 50));
  requestAnimationFrame(animate);
}

animate();
