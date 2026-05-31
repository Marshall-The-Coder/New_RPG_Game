const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

        if (keys['w']) dy -= this.speed;
        if (keys['s']) dy += this.speed;
        if (keys['a']) dx -= this.speed;
        if (keys['d']) dx += this.speed;

        this.x += dx;
        this.y += dy;
    }

    draw(ctx, camera) {

        ctx.fillStyle = '#00008B';

        ctx.fillRect(
            this.x - camera.x,
            this.y - camera.y,
            this.width,
            this.height
        );
    }
}

class Camera {

    constructor() {
        this.x = 0;
        this.y = 0;
    }

    follow(target) {

        this.x =
            (target.x + target.width / 2) -
            canvas.width / 2;

        this.y =
            (target.y + target.height / 2) -
            canvas.height / 2;
    }
}

class World {

    constructor() {
        this.tileSize = 50;
    }

    draw(ctx, camera) {

        const renderDistance = 20;

        const startX =
            Math.floor(camera.x / this.tileSize) -
            renderDistance;

        const startY =
            Math.floor(camera.y / this.tileSize) -
            renderDistance;

        for (
            let x = startX;
            x < startX + renderDistance * 4;
            x++
        ) {

            for (
                let y = startY;
                y < startY + renderDistance * 2;
                y++
            ) {

                const screenX =
                    x * this.tileSize - camera.x;

                const screenY =
                    y * this.tileSize - camera.y;

                ctx.fillStyle =
                    (x + y) % 2 === 0
                        ? '#1f4e03'
                        : '#2b6906';

                ctx.fillRect(
                    screenX,
                    screenY,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
    }
}

class Inventory {

    constructor(
        size,
        x,
        y,
        elementId,
        slotsPerRow
    ) {

        this.size = size;

        this.slots =
            new Array(size).fill(null);

        this.inventoryDiv =
            document.getElementById(elementId);

        this.inventoryDiv.style.position = 'fixed';

        this.inventoryDiv.style.left =
            `${x}px`;

        this.inventoryDiv.style.top =
            `${y}px`;

        this.inventoryDiv.style.display = 'grid';

        this.inventoryDiv.style.gridTemplateColumns =
            `repeat(${slotsPerRow}, 50px)`;
    }

    addItem(itemName) {

        for (let slot of this.slots) {

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

            const slotDiv =
                document.createElement('div');

            slotDiv.classList.add('slot');

            if (item) {

                slotDiv.textContent =
                    `${item.amount} ${item.name}`;
            }

            this.inventoryDiv.appendChild(slotDiv);
        }
    }

    setVisible(isVisible) {

        this.inventoryDiv.style.display =
            isVisible ? 'grid' : 'none';
    }
}

class Item {

    constructor(
        x,
        y,
        width,
        height,
        name,
        color) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.name = name;
        this.color = color;

        this.pickedUp = false;
    }

    draw(ctx, camera) {

        if (this.pickedUp) return;

        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x - camera.x,
            this.y - camera.y,
            this.width,
            this.height
        );
    }

    clicked() {

        if (this.pickedUp) return;

        const worldMouseX =
            mouse.x + game.camera.x;

        const worldMouseY =
            mouse.y + game.camera.y;

        const hovering =
            worldMouseX > this.x &&
            worldMouseX < this.x + this.width &&
            worldMouseY > this.y &&
            worldMouseY < this.y + this.height;

        if (hovering && mouse.clicked) {

            if (
                game.inventory.addItem(this.name)
            ) {

                this.pickedUp = true;
            }
        }
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

        ctx.fillRect(
            this.x - camera.x,
            this.y - camera.y,
            this.width,
            this.height
        );
    }

    collidesWith(target) {

        if (
            target.x + target.width > this.x &&
            target.x < this.x + this.width &&
            target.y + target.height > this.y &&
            target.y < this.y + this.height
        ) {

            let overlapLeft =
                (target.x + target.width) - this.x;

            let overlapRight =
                (this.x + this.width) - target.x;

            let overlapTop =
                (target.y + target.height) - this.y;

            let overlapBottom =
                (this.y + this.height) - target.y;

            let minOverlap = Math.min(
                overlapLeft,
                overlapRight,
                overlapTop,
                overlapBottom
            );

            if (minOverlap === overlapLeft) {
                target.x = this.x - target.width;
            }

            if (minOverlap === overlapRight) {
                target.x = this.x + this.width;
            }

            if (minOverlap === overlapTop) {
                target.y = this.y - target.height;
            }

            if (minOverlap === overlapBottom) {
                target.y = this.y + this.height;
            }
        }
    }

    clicked() {

        const worldMouseX =
            mouse.x + game.camera.x;

        const worldMouseY =
            mouse.y + game.camera.y;

        const hovering =
            worldMouseX > this.x &&
            worldMouseX < this.x + this.width &&
            worldMouseY > this.y &&
            worldMouseY < this.y + this.height;

        if (
            hovering &&
            mouse.clicked &&
            !game.chestOpen
        ) {

            game.chestOpen = true;

            game.chestInventory.setVisible(true);

            game.chestInventory.render();
        }
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

        if (!game.chestOpen) return;

        ctx.fillStyle = 'red';

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    clicked() {

        if (!game.chestOpen) return;

        const hovering =
            mouse.x > this.x &&
            mouse.x < this.x + this.width &&
            mouse.y > this.y &&
            mouse.y < this.y + this.height;

        if (hovering && mouse.clicked) {

            game.chestOpen = false;

            game.chestInventory.setVisible(false);
        }
    }
}

class Cords {

    constructor() {

        this.cordsDiv =
            document.getElementById('cords');
    }

    update(camera, target) {

        this.cordsDiv.textContent =
            `X: ${
                Math.floor(
                    ((target.x + target.width / 2) - 500) / 50
                )
            }, Y: ${
                Math.floor(
                    (-((target.y + target.height / 2) - 500)) / 50
                ) + 1
            }`;
    }
}

class GameData {

    constructor() {

        this.player =
            new Player(500, 500, 50, 50);

        this.camera =
            new Camera();

        this.world =
            new World();

        this.cords =
            new Cords();

        this.chestOpen = false;

        this.inventory =
            new Inventory(
                5,
                20,
                window.innerHeight - 70,
                'inventory',
                5
            );

        this.chestInventory =
            new Inventory(
                30,
                window.innerWidth / 2 - (10 * 54 / 2) - 4,
                window.innerHeight / 2 - (3 * 52),
                'chestInventory',
                10
            );

        this.chestInventory.setVisible(false);

        this.chest =
            new Chest(300, 300, 100, 50);

        this.exitChest =
            new ExitChest(
                window.innerWidth / 2 + (10 * 54 / 2) + 15,
                window.innerHeight / 2 - 2 * (3 * 52) + 120,
                20,
                20
            );

        this.wood =
            new Item(
                412.5,
                412.5,
                25,
                25,
                'Wood',
                'saddlebrown'
            );

        this.gold = [];

        for (let i = 0; i < 6; i++) {

            let maxFactor = 6;

            this.gold.push(

                new Item(

                    462.5 +
                    (
                        Math.round(
                            Math.random() * maxFactor
                        ) -
                        maxFactor / 2
                    ) * 50,

                    162.5 +
                    (
                        Math.round(
                            Math.random() * maxFactor
                        ) -
                        maxFactor / 2
                    ) * 50,

                    25,
                    25,
                    'Gold',
                    'yellow'
                )
            );
        }

        this.inventory.render();
    }
}

const game = new GameData();

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    game.player.update();

    game.chest.collidesWith(game.player);

    game.gold.forEach(item => item.clicked());

    game.wood.clicked();

    game.chest.clicked();

    game.exitChest.clicked();

    game.camera.follow(game.player);

    game.world.draw(ctx, game.camera);

    game.gold.forEach(item =>
        item.draw(ctx, game.camera)
    );

    game.wood.draw(ctx, game.camera);

    game.player.draw(ctx, game.camera);

    game.chest.draw(ctx, game.camera);

    game.exitChest.draw();

    game.cords.update(
        game.camera,
        game.player
    );

    mouse.clicked = false;

    requestAnimationFrame(gameLoop);
}

gameLoop();