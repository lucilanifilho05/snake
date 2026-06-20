const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 15;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 150;
let loop;

function drawGame() {
    // Move a cobra
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Verifica se comeu a maçã
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = score;
        generateFood();
    } else {
        snake.pop(); // Remove o rabo se não comeu
    }

    // Verifica colisão (Paredes ou próprio corpo)
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || checkCollision(head)) {
        alert("Fim de Jogo! Pontuação: " + score);
        resetGame();
        return;
    }

    // Limpa a tela
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a maçã
    ctx.fillStyle = "#E3000F";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Desenha a cobra
    ctx.fillStyle = "#00FF00";
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function checkCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // Garante que a maçã não nasça em cima da cobra
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    document.getElementById("score").innerText = score;
    generateFood();
}

// Controles pelo Teclado (Para testes no PC)
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
    if (event.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
    if (event.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
    if (event.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

// Controles pelos Botões na Tela (Para o Celular dos Calouros)
document.getElementById("up").addEventListener("touchstart", (e) => { e.preventDefault(); if (dy === 0) { dx = 0; dy = -1; }});
document.getElementById("down").addEventListener("touchstart", (e) => { e.preventDefault(); if (dy === 0) { dx = 0; dy = 1; }});
document.getElementById("left").addEventListener("touchstart", (e) => { e.preventDefault(); if (dx === 0) { dx = -1; dy = 0; }});
document.getElementById("right").addEventListener("touchstart", (e) => { e.preventDefault(); if (dx === 0) { dx = 1; dy = 0; }});

// Click normal caso alguém teste com o mouse
document.getElementById("up").addEventListener("mousedown", () => { if (dy === 0) { dx = 0; dy = -1; }});
document.getElementById("down").addEventListener("mousedown", () => { if (dy === 0) { dx = 0; dy = 1; }});
document.getElementById("left").addEventListener("mousedown", () => { if (dx === 0) { dx = -1; dy = 0; }});
document.getElementById("right").addEventListener("mousedown", () => { if (dx === 0) { dx = 1; dy = 0; }});

// Inicia o jogo
generateFood();
setInterval(drawGame, gameSpeed);