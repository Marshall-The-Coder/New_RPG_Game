const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let playerxmovement = 0;
let playerymovement = 0;

const keys = {};
const mouse = {
    x: 0,
    y: 0,
    clicked: false
};

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

});

window.addEventListener('mousedown', () => {
    mouse.clicked = true;
});

window.addEventListener('mouseup', () => {
    mouse.clicked = false;
});

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
        ctx.fillStyle = '#00008B';
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    }
}

class Chest {
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
    clicked() {
        const worldMouseX = mouse.x + camera.x;
        const worldMouseY = mouse.y + camera.y;

        if (
            worldMouseX > this.x &&
            worldMouseX < this.x + this.width &&
            worldMouseY > this.y &&
            worldMouseY < this.y + this.height &&
            !ChestOpen &&
            mouse.clicked
        ) {
            ChestOpen = true;
            if (ChestOpen && !this.openedOnce) {
                chestInventory.setVisible(true);
                chestInventory.render();
                this.openedOnce = true;
            }
        }
    }

    Open() {
        if (ChestOpen && !this.openedOnce) {
            chestInventory.render();
            this.openedOnce = true;
        }
        if (!ChestOpen) {
            this.openedOnce = false;
        }
    }
}

class Item {

    constructor(x, y, width, height, name, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.pickedUp = false;
        this.color = color;
    }

    draw(ctx, camera) {
        if (!this.pickedUp) {
            ctx.fillStyle = this.color;

            ctx.fillRect(
                this.x - camera.x,
                this.y - camera.y,
                this.width,
                this.height
            );
        }
    }

    clicked() {

        const worldMouseX = mouse.x + camera.x;
        const worldMouseY = mouse.y + camera.y;

        if (
            worldMouseX > this.x &&
            worldMouseX < this.x + this.width &&
            worldMouseY > this.y &&
            worldMouseY < this.y + this.height &&
            !this.pickedUp &&
            mouse.clicked
        ) {
            if (inventory.addItem(this.name)) {
                this.pickedUp = true;
            }
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
        this.cordsDiv.textContent = `X: ${Math.floor(Math.floor(((target.x + target.width / 2) - 500) / 50))},
        Y: ${Math.floor(Math.floor((-((target.y + target.height / 2) - 500)) / 50)) + 1}`;
    }
}

class Inventory {

    constructor(size, x, y, name, slot_per_row) {
        this.size = size;
        this.slots = new Array(size).fill(null);
        this.name = name;
        this.inventoryDiv = document.getElementById(this.name);
        this.inventoryDiv.style.position = 'fixed';
        this.inventoryDiv.style.left = `${x}px`;
        this.inventoryDiv.style.top = `${y}px`;
        this.inventoryDiv.style.gridTemplateColumns = `repeat(${slot_per_row}, 50px)`
    }

    addItem(itemName) {

        for (let i = 0; i < this.slots.length; i++) {

            let slot = this.slots[i];

            if (
                slot &&
                slot.name === itemName &&
                slot.amount < 5
            ) {

                slot.amount++;

                this.render();

                return true;
            }
        }

        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {

                this.slots[i] = {
                    name: itemName,
                    amount: 1
                };

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
                slotDiv.textContent =
                    `${item.amount} ${item.name}`;
            }
            this.inventoryDiv.appendChild(slotDiv);
        }
    }
    setVisible(isVisible) {
        this.inventoryDiv.style.display = isVisible ? 'grid' : 'none';
    }
}

class ExitChest {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        if (ChestOpen) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    clicked(target) {
        const worldMouseX = mouse.x;
        const worldMouseY = mouse.y;

        if (
            worldMouseX > this.x &&
            worldMouseX < this.x + this.width &&
            worldMouseY > this.y &&
            worldMouseY < this.y + this.height &&
            ChestOpen &&
            mouse.clicked
        ) {
            ChestOpen = false;
            if (!ChestOpen) {
                chestInventory.setVisible(false);
                target.openedOnce = false;
            }
            chestInventory.render()
        }
    }
}

const player = new Player(500, 500, 50, 50);
let ChestOpen = false;
const camera = new Camera();
const block = new Chest(300, 300, 100, 50);
const world = new World();
const inventory = new Inventory(5, 20, window.innerHeight - 70, 'inventory', 5);
inventory.render();
const cords = new Cords();
const gold = [];
const wood = new Item(412.5, 412.5, 25, 25, 'Wood', 'saddleBrown');
const chestInventory = new Inventory(30, window.innerWidth / 2 - (10 * 54 / 2) - 4, window.innerHeight / 2 - (3 * 52), 'chestInventory', 10);
const LeaveChest = new ExitChest(window.innerWidth / 2 + (10 * 54 / 2) + 15, window.innerHeight / 2 - 2 * (3 * 52) + 120, 20, 20);

for (let i = 0; i < 6; i++) {
    let maxFactor = 6;
    gold.push(new Item(462.5 + (Math.round((Math.random() * maxFactor)) - maxFactor / 2) * 50, 162.5 + (Math.round((Math.random() * maxFactor)) - maxFactor / 2) * 50, 25, 25, 'Gold', 'yellow'));
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    block.collidesWith(player);
    gold.forEach(item => item.clicked());
    wood.clicked();
    block.clicked();
    camera.follow(player);
    world.draw(ctx, camera);
    gold.forEach(item => item.draw(ctx, camera));
    wood.draw(ctx, camera);
    player.draw(ctx, camera);
    block.draw(ctx, camera);
    cords.update(ctx, camera, player);
    LeaveChest.clicked(block);
    block.Open();
    LeaveChest.draw();
    mouse.clicked = false;
    requestAnimationFrame(gameLoop);
}

gameLoop();