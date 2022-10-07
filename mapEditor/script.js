const cavas = document.getElementById('canvas');

let w = canvas.width = 1920;
let h = canvas.height = 1080;

let fps = 1
let frame = 0;
let frameStart = 0;
let lastFrames = [];

let username = 'Editor';

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
}

window.addEventListener('keydown', e => {
    if (e.key == 'Enter') login();
    if (e.key == '-') player.reset();

    let actualKey = e.key;
    if (e.key === 'W' || e.key === 'A' || e.key === 'S' || e.key === 'D') actualKey = e.key.toLowerCase();
    if (actualKey == 'w' || e.key == ' ') keys.w = true;
    if (actualKey == 's') keys.s = true;
    if (actualKey == 'a') keys.a = true;
    if (actualKey == 'd') keys.d = true;
    if (actualKey == 'Shift') keys.shift = true;
})

window.addEventListener('keyup', e => {
    let actualKey = e.key;
    if (e.key === 'W' || e.key === 'A' || e.key === 'S' || e.key === 'D') actualKey = e.key.toLowerCase();
    if (actualKey == 'w' || e.key == ' ') keys.w = false;
    if (actualKey == 's') keys.s = false;
    if (actualKey == 'a') keys.a = false;
    if (actualKey == 'd') keys.d = false;
    if (actualKey == 'Shift') keys.shift = false;
})

const movePlayer = keys => {
    if (keys.w && player.onGround) player.vy = -7;
    if (keys.s) if (player.vy < 3) player.vy += 0.2;
    if (keys.a) if (player.vx > -3) player.vx -= 0.2;
    if (keys.d) if (player.vx < 3) player.vx += 0.2;
}

class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.mapX = 0;
        this.mapY = 0;
        this.vx = 0;
        this.vy = 0;
        this.w = 50;
        this.h = 50;
        this.color = '#fff';
        this.onGround = false;
        this.onIce = false;
        this.id = 0;
        this.canDash = false;
        this.abilities = [];
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText(username, this.x + this.w / 2 - ctx.measureText(username).width / 2, this.y - 10);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        movePlayer(keys);

        this.abilities.forEach(ability => eval(ability));

        this.vy += 0.12;

        this.onGround = false;
        this.onIce = false;

        let maxSpeed = Math.abs(this.vx) > Math.abs(this.vy) ? Math.abs(this.vx) / 2 : Math.abs(this.vy) / 2;
        if (maxSpeed < 1) maxSpeed = 1;

        const range = maxSpeed * 3;

        walls.forEach(wall => {
            //collision with left wall
            if (this.x + this.w > wall.x && this.x + this.w < wall.x + range && this.y + this.h > wall.y && this.y < wall.bottom) {
                switch (wall.type) {
                    case 'bounce':
                        this.x = wall.x - this.w;
                        this.vx = -this.vx * 3;
                        break;
                    case 'spawn':
                        break;
                    case 'reset':
                        this.reset();
                        break;
                    case 'ability':
                        sendPacket('ability', { name: wall.name });
                        break;
                    default:
                        this.x = wall.x - this.w;
                        if (this.vx >= 0) this.vx = 0;
                        break;
                }
            }
            //collision with right wall
            if (this.x > wall.right - range && this.x < wall.right && this.y + this.h > wall.y && this.y < wall.bottom) {
                switch (wall.type) {
                    case 'bounce':
                        this.x = wall.right;
                        this.vx = -this.vx * 3;
                        break;
                    case 'reset':
                        this.reset();
                        break;
                    case 'spawn':
                        break;
                    case 'ability':
                        sendPacket('ability', { name: wall.name });
                        break;
                    default:
                        this.x = wall.right;
                        if (this.vx <= 0) this.vx = 0;
                        break;
                }
            }
            //collision with top wall
            if (this.x + this.w > wall.x && this.x < wall.right && this.y + this.h + this.vy > wall.y && this.y + this.h < wall.y + range) {
                switch (wall.type) {
                    case 'spawn':
                        break;
                    case 'reset':
                        this.reset();
                        break;
                    case 'bounce':
                        this.y = wall.y - this.h;
                        this.vy = -8;
                        break;
                    case 'ice':
                        this.y = wall.y - this.h;
                        this.vy = 0;
                        this.onGround = true;
                        this.onIce = true;
                        break;
                    case 'ability':
                        sendPacket('ability', { name: wall.name });
                        break;
                    default:
                        this.y = wall.y - this.h;
                        this.vy = 0;
                        this.onGround = true;
                        break;
                }
            }
            //collision with bottom wall
            if (this.x + this.w > wall.x && this.x < wall.right && this.y > wall.bottom - range && this.y < wall.bottom) {
                switch (wall.type) {
                    case 'bounce':
                        this.y = wall.bottom;
                        this.vy = -this.vy * 2;
                        break;
                    case 'spawn':
                        break;
                    case 'reset':
                        this.reset();
                        break;
                    case 'ability':
                        sendPacket('ability', { name: wall.name });
                        break;
                    default:
                        this.y = wall.bottom;
                        if (this.vy <= 0) this.vy = 0;
                        break;
                }
            }
        });

        if (!this.onIce) {
            if (this.onGround) this.vx *= 0.9;
            this.vx *= 0.98;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x + this.w < 0 || this.x > w || this.y + this.h < 0 || this.y > h) this.reset();
    }

    reset() {
        this.x = startPosX;
        this.y = startPosY;
        this.vx = 0;
        this.vy = 0;
    }
}

class Wall {
    constructor(x, y, w, h, color, type, name) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.right = x + w;
        this.bottom = y + h;
        this.type = type;
        this.name = name;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Sign {
    constructor(x, y, text, font, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.font = font;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = this.font;

        ctx.fillText(this.text, this.x - (ctx.measureText(this.text).width / 2), this.y);
    }
}

const player = new Player();

const walls = [];
const signs = [];

const renderHud = () => {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';

    const playerPos = `player position: ${Math.round(player.x * 100)}, ${Math.round(player.y * 100)}`
    ctx.fillText(playerPos, w / 2 - (ctx.measureText(playerPos).width / 2), 30);
    ctx.fillText(`fps: ${fps} | ${Math.floor(1000 / fps)}`, w / 2 - (ctx.measureText(`fps: ${fps} | ${Math.floor(1000 / fps)}`).width / 2), 60);
}

const renderPlayers = player => {
    player.update();
    player.draw();
}

const renderMap = (walls, signs) => {
    ctx.fillStyle = '#607279';
    ctx.fillRect(0, 0, w, h);

    walls.forEach(wall => wall.draw());
    signs.forEach(sign => sign.draw());
}

const render = () => {
    ctx.clearRect(0, 0, w, h);

    renderMap(walls, signs);
    renderPlayers(player);
    renderHud();

    let renderTime = Date.now() - frameStart;
    if (lastFrames.length >= 10) lastFrames.shift();
    lastFrames.push(renderTime);

    let average = 0;
    lastFrames.forEach(frame => average += frame);
    average /= lastFrames.length;

    fps = Math.round(1000 / average);

    frameStart = Date.now();
    frame++;
    requestAnimationFrame(render);
}