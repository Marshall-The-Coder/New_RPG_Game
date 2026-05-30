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
        this.speed = 5;
    }

    snapX(world, dx) {
        if (dx > 0) {
            const tileX = Math.floor((this.x + this.width + dx - 1) / world.tileSize);
            this.x = tileX * world.tileSize - this.width;
        } else if (dx < 0) {
            const tileX = Math.floor((this.x + dx) / world.tileSize);
            this.x = (tileX + 1) * world.tileSize;
        }
    }

    snapY(world, dy) {
        if (dy > 0) {
            const tileY = Math.floor((this.y + this.height + dy - 1) / world.tileSize);
            this.y = tileY * world.tileSize - this.height;
        } else if (dy < 0) {
            const tileY = Math.floor((this.y + dy) / world.tileSize);
            this.y = (tileY + 1) * world.tileSize;
        }
    }

    update(world) {

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

        const nextX = this.x + dx;
        const nextY = this.y + dy;

        if (!world.isBlockingRect(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            this.y = nextY;
        } else {
            if (!world.isBlockingRect(nextX, this.y, this.width, this.height)) {
                this.x = nextX;
            } else if (dx !== 0) {
                this.snapX(world, dx);
            }

            if (!world.isBlockingRect(this.x, nextY, this.width, this.height)) {
                this.y = nextY;
            } else if (dy !== 0) {
                this.snapY(world, dy);
            }
        }
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
        this.tileCache = {};
    }

    getTileColor(x, y) {
        const key = `${x},${y}`;
        if (!this.tileCache[key]) {
            const isYellow = Math.random() < 0.1;
            this.tileCache[key] = isYellow
                ? 'yellow'
                : (x + y) % 2 === 0
                    ? '#1f4e03'
                    : '#36913f';
        }
        return this.tileCache[key];
    }

    isBlockingRect(x, y, width, height) {
        const startX = Math.floor(x / this.tileSize);
        const endX = Math.floor((x + width - 1) / this.tileSize);
        const startY = Math.floor(y / this.tileSize);
        const endY = Math.floor((y + height - 1) / this.tileSize);

        for (let ty = startY; ty <= endY; ty++) {
            for (let tx = startX; tx <= endX; tx++) {
                if (this.getTileColor(tx, ty) === 'yellow') {
                    return true;
                }
            }
        }
        return false;
    }

    draw(ctx, camera) {

        const renderDistanceX = Math.ceil(canvas.width / this.tileSize) + 2;
        const renderDistanceY = Math.ceil(canvas.height / this.tileSize) + 2;

        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);

        for (let y = startY; y < startY + renderDistanceY; y++) {
            for (let x = startX; x < startX + renderDistanceX; x++) {
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;

                ctx.fillStyle = this.getTileColor(x, y);
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }
    }
}
const world = new World();

const camera = new Camera();

const player = new Player(
    0, 
    0, 
    64, 
    64);


function gameLoop() {
    player.update(world);
    camera.flow(player);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    world.draw(ctx, camera);
    player.draw(ctx, camera);
    requestAnimationFrame(gameLoop);
}
gameLoop();