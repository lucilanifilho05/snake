const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");
const overlay    = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySub   = document.getElementById("overlaySub");
const startBtn   = document.getElementById("startBtn");
const scoreEl    = document.getElementById("score");
const bestEl     = document.getElementById("best");

const GRID = 15;
const TILES = canvas.width / GRID; // 20
const HEAD_COLOR  = "#00E5FF";
const BODY_COLOR  = "#1A6FFF";
const BODY_COLOR2 = "#0D3B8C";
const FOOD_COLOR  = "#FF4060";
const GRID_LINE   = "rgba(26,111,255,0.06)";

let snake, food, dx, dy, score, best, gameLoop, running;

function init() {
  snake   = [{ x: 10, y: 10 }];
  dx = 0; dy = 0;
  score   = 0;
  running = false;
  scoreEl.textContent = 0;
  best    = parseInt(localStorage.getItem("snakeBest") || "0");
  bestEl.textContent  = best;
  placeFood();
  drawFrame();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * TILES),
      y: Math.floor(Math.random() * TILES)
    };
  } while (snake.some(p => p.x === food.x && p.y === food.y));
}

function drawGrid() {
  ctx.strokeStyle = GRID_LINE;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= TILES; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID, 0); ctx.lineTo(i * GRID, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID); ctx.lineTo(canvas.width, i * GRID);
    ctx.stroke();
  }
}

function drawFood() {
  const cx = food.x * GRID + GRID / 2;
  const cy = food.y * GRID + GRID / 2;
  const r  = GRID / 2 - 1;
  // Glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
  grd.addColorStop(0, "rgba(255,64,96,0.5)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2, 0, Math.PI * 2);
  ctx.fill();
  // Dot
  ctx.fillStyle = FOOD_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Shine
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, i) => {
    const x = part.x * GRID + 1;
    const y = part.y * GRID + 1;
    const s = GRID - 2;
    const isHead = i === 0;

    if (isHead) {
      // Glow behind head
      ctx.shadowColor = HEAD_COLOR;
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = HEAD_COLOR;
    } else {
      ctx.shadowBlur = 0;
      const t = i / snake.length;
      ctx.fillStyle = t < 0.5 ? BODY_COLOR : BODY_COLOR2;
    }

    const r = isHead ? 4 : 3;
    roundRect(ctx, x, y, s, s, r);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#060F1F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function step() {
  if (!running) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem("snakeBest", best);
    }
    placeFood();
  } else {
    snake.pop();
  }

  const hitWall = head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES;
  const hitSelf = snake.slice(1).some(p => p.x === head.x && p.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  drawFrame();
}

function startGame() {
  overlay.classList.add("hidden");
  init();
  running = true;
  clearInterval(gameLoop);
  const speed = Math.max(80, 150 - Math.floor(score / 50) * 10);
  gameLoop = setInterval(step, 150);
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  overlayTitle.textContent = "FIM DE JOGO";
  overlaySub.textContent   = `Sua pontuação: ${score} pts`;
  startBtn.textContent     = "JOGAR NOVAMENTE";
  overlay.classList.remove("hidden");
}

// ── Input ──
document.addEventListener("keydown", e => {
  if (!running && (e.key.startsWith("Arrow") || e.key === " ")) { startGame(); return; }
  if (e.key === "ArrowUp"    && dy === 0) { dx = 0; dy = -1; }
  if (e.key === "ArrowDown"  && dy === 0) { dx = 0; dy =  1; }
  if (e.key === "ArrowLeft"  && dx === 0) { dx = -1; dy = 0; }
  if (e.key === "ArrowRight" && dx === 0) { dx =  1; dy = 0; }
});

startBtn.addEventListener("click", startGame);

function addDpad(id, ndx, ndy) {
  const btn = document.getElementById(id);
  const act = (e) => {
    e.preventDefault();
    btn.classList.add("pressed");
    if (!running) return;
    if (ndx !== 0 && dx === 0) { dx = ndx; dy = 0; }
    if (ndy !== 0 && dy === 0) { dy = ndy; dx = 0; }
  };
  const rel = () => btn.classList.remove("pressed");
  btn.addEventListener("touchstart", act, { passive: false });
  btn.addEventListener("mousedown",  act);
  btn.addEventListener("touchend",   rel);
  btn.addEventListener("mouseup",    rel);
}

addDpad("up",    0, -1);
addDpad("down",  0,  1);
addDpad("left", -1,  0);
addDpad("right", 1,  0);

// ── Boot ──
init();
