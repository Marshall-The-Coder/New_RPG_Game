const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let playerxmovement = 0;
let playerymovement = 0;

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const player = new Player(
    canvas.width / 2, 
    canvas.height / 2, 
    50, 
    50);

function handleKeyboardInput() {
    if (keys['w'] || keys['ArrowUp']) {
        playerymovement = 5;
    } 
    if (keys['s'] || keys['ArrowDown']) {
        playerymovement = -5;
    } 
    if (keys['a'] || keys['ArrowLeft']) {
        playerxmovement = -5;
    } 
    if (keys['d'] || keys['ArrowRight']) {
        playerxmovement = 5;
    }
    if (!keys['w'] && !keys['ArrowUp'] && !keys['s'] && !keys['ArrowDown']) {
        playerymovement = 0;
    }
    if (!keys['a'] && !keys['ArrowLeft'] && !keys['d'] && !keys['ArrowRight']) {
        playerxmovement = 0;
    }
}

function PlayerMovement() {
    player.move(playerxmovement, -playerymovement);
}

function gameLoop() {

    handleKeyboardInput();
    PlayerMovement();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    requestAnimationFrame(gameLoop);
}
gameLoop();