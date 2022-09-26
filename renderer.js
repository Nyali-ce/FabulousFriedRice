// login
String.prototype.nyaliceHash = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

let formType = 'login';

const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');

const signupText = document.getElementById('signup_text');
const formText = document.getElementById('formText');

const frogotPasswordBtn = document.getElementById('frogor');
frogotPasswordBtn.addEventListener('click', () => {
    frogotPasswordBtn.innerHTML = 'didn\'t ask';
})

const popup = message => {
    if (document.getElementById('popup')) return;
    const main = document.getElementById('login');
    main.style.filter = 'blur(5px) brightness(0.5)';

    const popupDiv = document.createElement('div');
    popupDiv.id = 'popup';
    popupDiv.innerHTML = message;

    const removeBtn = document.createElement('button');
    removeBtn.id = 'removeBtn';
    removeBtn.innerHTML = 'didn\'t ask';
    removeBtn.addEventListener('click', () => {
        popupDiv.remove();
        main.style.filter = 'none';
    });
    popupDiv.appendChild(removeBtn);
    document.body.appendChild(popupDiv);
}

const login = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.length < 3) {
        popup('Username must be at least 3 characters long');
        return;
    }
    if (password.length < 6) {
        popup('Password must be at least 6 characters long');
        return;
    }
    if (username.length > 20) {
        popup('Username must be less than 20 characters long');
        return;
    }
    if (password.length > 20) {
        popup('Password must be less than 20 characters long');
        return;
    }

    const hash = password.nyaliceHash();

    ws.send(JSON.stringify({
        type: formType,
        data: {
            username,
            password: hash
        }
    }));
}

const toggleSignup = () => {
    if (formType === 'login') {
        formType = 'signup';
        formText.innerHTML = 'Sign Up';
        signupBtn.innerHTML = 'Login';
        loginBtn.innerHTML = 'Sign Up';
        signupText.innerHTML = 'Already have an account?';
    } else {
        formType = 'login';
        formText.innerHTML = 'Login';
        signupBtn.innerHTML = 'Sign Up';
        loginBtn.innerHTML = 'Login';
        signupText.innerHTML = 'Don\'t have an account?';
    }
}

const loadingAnimation = update => {
    const getColor = progress => {
        const r = Math.floor(255 * (1 - progress));
        const g = Math.floor(255 * progress);
        return `rgb(${r},${g},0)`;
    }

    if (update == 'start') {
        canvas.style.display = 'none';

        const container = document.createElement('div');
        const progressDiv = document.createElement('div');
        const progressBar = document.createElement('div');

        container.className = 'container';
        progressDiv.className = 'progress';
        progressBar.className = 'progress-bar';

        const progressText = document.createElement('p');
        progressText.className = 'progress-text';
        progressText.innerHTML = 'Loading...';

        progressDiv.appendChild(progressBar);
        container.appendChild(progressDiv);
        document.body.appendChild(container);

        document.body.appendChild(progressText);
    } else if (update == 'end') {
        canvas.style.display = 'block';

        document.getElementsByClassName('container')[0].remove();
        document.getElementsByClassName('progress-text')[0].remove();

        loading = false;
    } else {
        const progress = document.getElementsByClassName('progress-bar')[0];
        progress.style.width = `${update}%`;
        progress.style.backgroundColor = getColor(update / 100);

    }
}

loginBtn.addEventListener('click', login);
signupBtn.addEventListener('click', toggleSignup);



// webSocket
let ws;

const packetHandler = packet => {
    if (!packet?.type || !packet?.data) return;

    switch (packet.type) {
        case 'login':
            if (packet.data.error) return popup(packet.data.error);

            loggedIn = true;

            switchPlayerData(packet.data.userData);

            const { userData } = packet.data;

            document.getElementById('login').remove();

            render()
            break;
        case 'signup':
            popup(packet.data.error);
            break;
        case 'mapData':
            if (packet.data.error) return player.reset();

            if (loading) {
                loadingAnimation(6);

                setTimeout(() => {
                    loadingAnimation(26);
                    setTimeout(() => {
                        loadingAnimation(40);
                        setTimeout(() => {
                            loadingAnimation(43);
                            setTimeout(() => {
                                loadingAnimation(74);
                                setTimeout(() => {
                                    loadingAnimation(100);
                                    setTimeout(() => {

                                        switchMap(packet.data);
                                        loadingAnimation('end');
                                        document.getElementById('chatBox').style.display = 'block';
                                    }, 500)
                                }, 600);
                            }, 600);
                        }, 200);
                    }, 200);
                }, 1000);
            } else {
                switchMap(packet.data);
                document.getElementById('chatBox').style.display = 'block';
            }
            break;
        case 'players':
            if (!packet.data.players) return;

            const tempPlayers = packet.data.players;
            const tempFriends = [];

            tempPlayers.forEach(tempPlayer => {
                if (tempPlayer == null) return;
                if (tempPlayer.id !== player.id && tempPlayer.position.mapX === player.mapX && tempPlayer.position.mapY === player.mapY) {
                    tempFriends.push(new Friend(tempPlayer.position.x, tempPlayer.position.y, tempPlayer.position.vx, tempPlayer.position.vy, tempPlayer.position.onGround, tempPlayer.username, tempPlayer.fps));
                }
            })

            friends = tempFriends;
            break;
        case 'playerJoin':
            chatMessage(packet.data.userData.username + ' joined the game', 'system');
            break;
        case 'playerLeave':
            chatMessage(packet.data.userData.username + ' left the game', 'system');
            break;
        case 'message':
            chatMessage(packet.data.message, packet.data.username);
            break;
        case 'playerData':
            switchPlayerData(packet.data.userData);
            break;
    }
}

const chatMessage = (text, sender) => {
    const chat = document.getElementById('chat');

    const message = document.createElement('p');
    message.className = 'message';
    message.innerHTML = `<span class="sender">${sender}</span>: ${text}`;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('hidechat').onclick = () => {
    const chat = document.getElementById('chat');
    const hidechat = document.getElementById('hidechat');
    const chatinput = document.getElementById('chatinput');
    if (chat.style.display === 'none') {
        chat.style.display = 'block';
        hidechat.innerHTML = 'Hide Chat';
        chatinput.style.display = 'block';
    } else {
        chat.style.display = 'none';
        hidechat.innerHTML = 'Show Chat';
        chatinput.style.display = 'none';
    }
}

const switchMap = data => {
    const { mapData } = data;

    player.mapX = data.mapX;
    player.mapY = data.mapY;

    startPosX = mapData.startPosX;
    startPosY = mapData.startPosY;

    if (!firstMapPacket) {
        if (!mapData.direction) player.reset();
        else {
            if (mapData.direction === 'left') player.x = w - 1;
            else if (mapData.direction === 'right') player.x = 1;
            else if (mapData.direction === 'up') player.y = h - 1;
            else if (mapData.direction === 'down') player.y = 1;
        }
    } else firstMapPacket = false;

    walls = mapData.walls.map(wall => new Wall(wall.x, wall.y, wall.w, wall.h, wall.color, wall.type, wall.name));
    walls.push(new Wall(mapData.startPosX, mapData.startPosY, player.w, player.h, 'rgba(0,0,255,0.4)', 'spawn'));

    if (mapData.signs) signs = mapData.signs.map(sign => new Sign(sign.x, sign.y, sign.text, sign.font, sign.color));
    else signs = [];
}

const switchPlayerData = userData => {
    username = userData.username;
    player.x = userData.position.x;
    player.y = userData.position.y;
    player.mapX = userData.position.mapX;
    player.mapY = userData.position.mapY;
    player.id = userData.id;

    if (userData.abilities) {
        userData.abilities.forEach(abilityData => {
            const ability = {
                run: eval(JSON.parse(abilityData.run))
            }
        })
    }
}

const sendPacket = (type, data) => {
    ws.send(JSON.stringify({
        type,
        data
    }));
}

const wsConnect = () => {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('connected');
    }

    ws.onmessage = message => {
        const dataJson = JSON.parse(message.data);
        packetHandler(dataJson);
    }

    ws.onclose = () => {
        popup('Connection lost (go scream at me on discord) (code 06)');
        console.log('disconnected');
        wsConnect();
    }
}

wsConnect();



// game
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = 1920;
let h = canvas.height = 1080;

let fps = 1
let frame = 0;
let frameStart = 0;
let lastFrames = [];

let username, startPosX, startPosY;

let loggedIn = false;
let loading = false;
let typing = false;
let firstMapPacket = true;

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
}

window.addEventListener('keydown', e => {
    if (!typing) {
        if (!loggedIn && e.key == 'Enter') login();

        if (!loading && e.key == 'r') player.reset();

        if (e.key == 't') {
            sendPacket('mapData', { mapX: 0, mapY: 0 });
        }

        if (e.key == 'w' || e.key == ' ') keys.w = true;
        if (e.key == 's') keys.s = true;
        if (e.key == 'a') keys.a = true;
        if (e.key == 'd') keys.d = true;
    } else {
        if (e.key == 'Enter') {
            const chatInput = document.getElementById('chatinput');
            const message = chatInput.value;

            if (message.length > 0) {
                sendPacket('message', { message: document.getElementById('chatinput').value });
                document.getElementById('chatinput').value = '';
                document.getElementById('chatinput').blur();
                typing = false;
            } else {
                document.getElementById('chatinput').blur();
                typing = false;
            }
        }
    }
})

window.addEventListener('keyup', e => {
    if (!typing) {
        if (e.key === '.') {
            typing = true;
            document.getElementById('chatinput').value = '';
            document.getElementById('chatinput').focus();
        }
    }
    if (e.key == 'w' || e.key == ' ') keys.w = false;
    if (e.key == 's') keys.s = false;
    if (e.key == 'a') keys.a = false;
    if (e.key == 'd') keys.d = false;
})

document.getElementById('chatinput').addEventListener('focusout', e => {
    typing = false;
})

document.getElementById('chatinput').addEventListener('focusin', e => {
    typing = true;
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

        this.abilities.forEach(ability => ability.run());

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

        if (this.x + this.w < 0) sendPacket('mapData', { mapX: this.mapX - 1, mapY: this.mapY, direction: 'left' });
        if (this.x > w) sendPacket('mapData', { mapX: this.mapX + 1, mapY: this.mapY, direction: 'right' });
        if (this.y + this.h < 0) sendPacket('mapData', { mapX: this.mapX, mapY: this.mapY + 1, direction: 'up' });
        if (this.y > h) sendPacket('mapData', { mapX: this.mapX, mapY: this.mapY - 1, direction: 'down' });
    }

    reset() {
        this.x = startPosX;
        this.y = startPosY;
        this.vx = 0;
        this.vy = 0;
    }
}

class Friend {
    constructor(x, y, vx, vy, onGround, username, friendFps) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.onGround = onGround;
        this.w = player.w;
        this.h = player.h;
        this.color = '#fff';
        this.username = username;
        this.mult = friendFps / fps;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText(this.username, this.x + this.w / 2 - ctx.measureText(this.username).width / 2, this.y - 10);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        this.vx *= 0.98;

        if (!this.onGround) this.vy += 0.12;
        else this.vy = 0;

        this.x += (this.vx * this.mult);
        this.y += (this.vy * this.mult);
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

let walls = [];
let signs = [];
let friends = [];

const renderHud = (playerMapX, playerMapY) => {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';

    const mapPos = `map position: ${playerMapX}, ${playerMapY}`
    const playerPos = `player position: ${Math.round(player.x * 100)}, ${Math.round(player.y * 100)}`

    ctx.fillText(mapPos, w / 2 - (ctx.measureText(mapPos).width / 2), 30);
    ctx.fillText(playerPos, w / 2 - (ctx.measureText(playerPos).width / 2), 60);
}

const renderPlayers = (player, friends) => {
    friends.forEach(friend => { friend.draw(); friend.update() });

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

    if (!walls.length && !loading) {
        sendPacket('mapData', { mapX: player.mapX, mapY: player.mapY });
        loadingAnimation('start');
        loading = true;
    }

    if (!loading) {
        renderMap(walls, signs);
        renderPlayers(player, friends);
        renderHud(player.mapX, player.mapY);

        ctx.fillText(`fps: ${fps} | ${Math.floor(1000 / fps)}`, w / 2 - (ctx.measureText(`fps: ${fps} | ${Math.floor(1000 / fps)}`).width / 2), 90);

        if (frame % 6 == 0) sendPacket('position', { x: player.x, y: player.y, mapX: player.mapX, mapY: player.mapY, vx: player.vx, vy: player.vy, onGround: player.onGround, fps: fps });
    }

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