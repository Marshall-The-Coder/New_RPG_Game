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
        this.speed = 5;
    }

    update() {
        let dx = 0;
        let dy = 0;

        if (keys['w']) dy = -this.speed;
        if (keys['s']) dy = this.speed;
        if (keys['a']) dx = -this.speed;
        if (keys['d']) dx = this.speed;

        this.x += dx;
        this.y += dy;
    }

    draw(ctx, camera) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx, camera) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    }

    collidesWith(target) {
        if (target.x + target.width > this.x && target.x < this.x + this.width &&
            target.y + target.height > this.y && target.y < this.y + this.height) {
            
            let overlapleft = (target.x + target.width) - this.x;
            let overlapright = (this.x + this.width) - target.x;
            let overlaptop = (target.y + target.height) - this.y;
            let overlapbottom = (this.y + this.height) - target.y;

            let minoverlap = Math.min(overlapleft, overlapright, overlaptop, overlapbottom);
            
            if (minoverlap === overlapleft) {
                target.x = this.x - target.width;
            }
            if (minoverlap === overlapright) {
                target.x = this.x + this.width;
            }
            if (minoverlap === overlaptop) {
                target.y = this.y - target.height;
            }
            if (minoverlap === overlapbottom) {
                target.y = this.y + this.height;
            }
        }
    }
}

class Item {
    constructor(x, y, width, height, name) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.pickedUp = false;
    }

    draw(ctx, camera) {
        if (!this.pickedUp) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        }
    }

    collidesWith(target) {
        if (target.x + target.width > this.x - 25 && target.x - 25 < this.x + this.width &&
            target.y + target.height > this.y - 25 && target.y - 25 < this.y + this.height && !this.pickedUp && keys['e']) {
            inventory.addItem(this.name);
            this.pickedUp = true;
        }
    }
}

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    follow(player) {
        this.x = (player.x + player.width / 2) - canvas.width / 2;
        this.y = (player.y + player.height / 2) - canvas.height / 2;
    }
}

class World {
    constructor() {
        this.tileSize = 50;
    }

    draw(ctx, camera) {
        const renderDistance = 20;
        const startX = Math.floor(camera.x / this.tileSize) - renderDistance;
        const starty = Math.floor(camera.y / this.tileSize) - renderDistance;
        
        for (let x = startX; x < startX + renderDistance * 4; x++) {
            for (let y = starty; y < starty + renderDistance * 2; y++) {
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;
                ctx.fillStyle = (x + y) % 2 === 0 ? '#1f4e03' : '#2b6906';
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }
    }
}

class Cords {
    constructor() {
        this.cordsDiv = document.getElementById('cords');
        this.x = window.innerWidth - 150;
        this.y = 20;
    }

    update(ctx, camera, target) {
        this.x = camera.x + canvas.width / 2 - 150;
        this.y = camera.y + 20;
        this.cordsDiv.textContent = `X: ${Math.floor(Math.floor(((target.x + target.width) - canvas.width / 2) / 50))},
        Y: ${Math.floor(Math.floor((-((target.y + target.height) - canvas.height / 2)) / 50))}`;
    }
}

class Inventory {
    constructor(size) {
        this.size = size;

        this.slots = new Array(size).fill(null);

        this.inventoryDiv = document.getElementById('inventory');
    }

    addItem(item) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = item;
                this.render();
                return true;
            }
        }
        return false;
    }
    render() {
        this.inventoryDiv.innerHTML = '';
        for (let item of this.slots) {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('slot');
            if (item) {
                slotDiv.textContent = item;
            }
            this.inventoryDiv.appendChild(slotDiv);
        }
    }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 50, 50);
const camera = new Camera();
const block = new Block(300, 300, 100, 100);
const world = new World();
const inventory = new Inventory(5);
inventory.render();
const cords = new Cords();
const newItem = new Item(462.5, 162.5, 25, 25, 'Gold');

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    block.collidesWith(player);
    newItem.collidesWith(player);
    camera.follow(player);
    world.draw(ctx, camera);
    newItem.draw(ctx, camera);
    player.draw(ctx, camera);
    block.draw(ctx, camera);
    cords.update(ctx, camera, player);

    requestAnimationFrame(gameLoop);
}

gameLoop();