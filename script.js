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
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 50, 50);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
}

gameLoop();