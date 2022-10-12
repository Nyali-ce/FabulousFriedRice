const cavas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = 1920;
let h = canvas.height = 1080;

let fps = 1
let frame = 0;
let frameStart = 0;
let lastFrames = [];

let username = 'Editor';

const buildModes = ['movePlayer', 'placeWall', 'placeSign', 'deleteWall', 'deleteSign'];
const wallTypes = ['solid', 'spawn', 'bounce', 'ice', 'reset'];

let buildMode = buildModes[0];
let wallType = wallTypes[0];
let tempWallStart = null;
let curColor;

const colorPicker = document.getElementById('color');
curColor = colorPicker.value;

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
}

const cursor = {
    x: 0,
    y: 0,
    down: false,
}

colorPicker.addEventListener('change', e => {
    curColor = e.target.value;
});

window.addEventListener('mousemove', e => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});

window.addEventListener('mousedown', e => {
    if (e.clientX <= 150 && e.clientX >= 100 && e.clientY >= 70 && e.clientY <= 95) return
    cursor.down = true;

    if (buildMode === 'movePlayer') {
        player.x = cursor.x;
        player.y = cursor.y;
        player.vx = 0;
        player.vy = 0;
    }

    if (buildMode === 'placeWall' && wallType !== 'spawn') {
        tempWallStart = {
            x: cursor.x,
            y: cursor.y,
        }
    } else if (buildMode === 'placeWall' && wallType === 'spawn') {
        walls.forEach(wall => {
            if (wall.type === 'spawn') {
                walls.splice(walls.indexOf(wall), 1);
            }
        });

        walls.push(new Wall(cursor.x - player.w / 2, cursor.y - player.h / 2, player.w, player.h, curColor, 'spawn'));
        startPosX = cursor.x - player.w / 2;
        startPosY = cursor.y - player.h / 2;
    }
});

window.addEventListener('mouseup', e => {
    cursor.down = false;
    if (buildMode === 'placeWall' && wallType !== 'spawn') {
        if (tempWallStart) {
            const topLeft = {
                x: Math.min(tempWallStart.x, cursor.x),
                y: Math.min(tempWallStart.y, cursor.y),
            }

            const bottomRight = {
                x: Math.max(tempWallStart.x, cursor.x),
                y: Math.max(tempWallStart.y, cursor.y),
            }

            const diffX = bottomRight.x - topLeft.x;
            const diffY = bottomRight.y - topLeft.y;

            if (diffX > 10 && diffY > 10) {
                walls.push(new Wall(topLeft.x, topLeft.y, diffX, diffY, curColor, wallType));
            }
            tempWallStart = null;
        }
    }
});

window.addEventListener('keydown', e => {
    if (e.key == 'Enter') login();
    if (e.key == '-') player.reset();

    let actualKey = e.key;
    if (e.key === 'W' || e.key === 'A' || e.key === 'S' || e.key === 'D') actualKey = e.key.toLowerCase();
    if (actualKey == 'w' || e.key == ' ') keys.w = true;
    if (actualKey == 's') keys.s = true;
    if (actualKey == 'a') keys.a = true;
    if (actualKey == 'd') keys.d = true;

    if (e.key == 'Control') {
        let index = buildModes.indexOf(buildMode);
        index++;
        if (index >= buildModes.length) index = 0;
        buildMode = buildModes[index];
    }

    if (e.key == 'Shift') {
        let index = wallTypes.indexOf(wallType);
        index++;
        if (index >= wallTypes.length) index = 0;
        wallType = wallTypes[index];
    }
})

window.addEventListener('keyup', e => {
    let actualKey = e.key;
    if (e.key === 'W' || e.key === 'A' || e.key === 'S' || e.key === 'D') actualKey = e.key.toLowerCase();
    if (actualKey == 'w' || e.key == ' ') keys.w = false;
    if (actualKey == 's') keys.s = false;
    if (actualKey == 'a') keys.a = false;
    if (actualKey == 'd') keys.d = false;
})

const movePlayer = keys => {
    if (keys.w && player.onGround) player.vy = -7;
    if (keys.s) if (player.vy < 3) player.vy += 0.2;
    if (keys.a) if (player.vx > -3) player.vx -= 0.2;
    if (keys.d) if (player.vx < 3) player.vx += 0.2;
}

class Player {
    constructor() {
        this.x = w / 2 - 50 / 2;
        this.y = h / 2 - 50 / 2;
        this.mapX = 0;
        this.mapY = 0;
        this.vx = 0;
        this.vy = 0;
        this.maxVx = 10;
        this.maxVy = 10;
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
                        player.onGround = true;
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
                        player.onGround = true;
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

        if (this.vx > this.maxVx) this.vx = this.maxVx;
        if (this.vx < -this.maxVx) this.vx = -this.maxVx;
        if (this.vy > this.maxVy) this.vy = this.maxVy;
        if (this.vy < -this.maxVy) this.vy = -this.maxVy;

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

let startPosX = w / 2 - player.w / 2;
let startPosY = h / 2 - player.h / 2;

const walls = [new Wall(w / 2 - 100, h / 2 + 100, 200, 50, 'red', 'solid'), new Wall(w / 2 - player.w / 2, h / 2 - player.h / 2, 50, 50, 'blue', 'spawn')];
const signs = [];

const renderHud = () => {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';

    //left
    const buildModeText = `Build Mode: ${buildMode}`;
    const wallTypeText = `Wall Type: ${wallType}`;
    const colorText = `Color:`;

    ctx.fillText(buildModeText, 10, 30);
    ctx.fillText(wallTypeText, 10, 60);
    ctx.fillText(colorText, 10, 90);

    //middle
    const playerPos = `player position: ${Math.round(player.x * 100)
        }, ${Math.round(player.y * 100)}`
    const fpsText = `fps: ${fps} | ${Math.floor(1000 / fps)} `

    ctx.fillText(playerPos, w / 2 - (ctx.measureText(playerPos).width / 2), 30);
    ctx.fillText(fpsText, w / 2 - (ctx.measureText(fpsText).width / 2), 60);

    //right
    const cycleBuildModeText = `Cycle Build Mode: ctrl`;
    const cycleWallTypeText = `Cycle Wall Type: shift`;
    const respawnText = `Respawn: -`;

    ctx.fillText(cycleBuildModeText, w - ctx.measureText(cycleBuildModeText).width - 10, 30);
    ctx.fillText(cycleWallTypeText, w - ctx.measureText(cycleWallTypeText).width - 10, 60);
    ctx.fillText(respawnText, w - ctx.measureText(respawnText).width - 10, 90);
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

const renderTempWall = () => {
    if (tempWallStart) {
        const diffX = cursor.x - tempWallStart.x;
        const diffY = cursor.y - tempWallStart.y;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(tempWallStart.x, tempWallStart.y, diffX, diffY);
    }
};

const renderSpawn = () => {
    ctx.fillStyle = 'white';
    ctx.font = '15px Arial';
    ctx.fillText('spawn', startPosX - (ctx.measureText('spawn').width / 2) + player.w / 2, startPosY - 10 + player.h / 2);
}

const render = () => {
    ctx.clearRect(0, 0, w, h);

    if (buildMode === 'deleteWall' && cursor.down) {
        walls.forEach((wall, i) => {
            if (cursor.x > wall.x && cursor.x < wall.right && cursor.y > wall.y && cursor.y < wall.bottom && wall.type !== 'spawn') {
                walls.splice(i, 1);
            }
        });
    }

    if (buildMode === 'deleteSign' && cursor.down) {
        signs.forEach((sign, i) => {
            if (cursor.x > sign.x - (ctx.measureText(sign.text).width / 2) && cursor.x < sign.x + (ctx.measureText(sign.text).width / 2) && cursor.y > sign.y - 15 && cursor.y < sign.y + 15) {
                signs.splice(i, 1);
            }
        });
    }

    renderMap(walls, signs);
    renderTempWall();
    renderSpawn();
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

render();