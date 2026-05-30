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
    update() {

        let dx = 0;
        let dy = 0;

        if (keys['w']) {
            dy -= this.speed;
        }
        if (keys['s']) {
            dy += this.speed;
        }
        if (keys['a']) {
            dx -= this.speed;
        }
        if (keys['d']) {
            dx += this.speed;
        }
        this.x += dx;
        this.y += dy;
    }
    draw(ctx, camera) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    }
}

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    flow(player) {
        this.x = player.x - canvas.width / 2;
        this.y = player.y - canvas.height / 2;
    }
}

class World {
    constructor() {
        this.tileSize = 64;
    }

    draw(ctx, camera) {

        const renderDistance = 20;

        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);

        for (let y = startY; y < startY + renderDistance; y++) {
            for (let x = startX; x < startX + renderDistance; x++) {
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;

                ctx.fillstyle =
                    (x + y) % 2 === 0 
                        ? '#1f4e03' 
                        : '#36913f';
                
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }
    }
}
const world = new World();

const camera = new Camera();

const player = new Player(
    canvas.width / 2, 
    canvas.height / 2, 
    50, 
    50);


function gameLoop() {
    player.update();
    camera.flow(player);
    world.draw(ctx, camera);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    requestAnimationFrame(gameLoop);
}
gameLoop();