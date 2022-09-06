// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const w = canvas.width = 1920;
const h = canvas.height = 1080;

const prompt = document.createElement('input');
prompt.setAttribute('type', 'text');
prompt.setAttribute('placeholder', 'Enter your name');
prompt.setAttribute('id', 'prompt');
document.body.appendChild(prompt);
prompt.focus();

prompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (prompt.value === null || prompt.value === '') {
            pname = Math.random().toString(36).substring(7);
        } else {
            pname = prompt.value.slice(0, 10);
        }
        document.getElementById('prompt').remove();
        wsConnect();
    }
})

// global variables
// const pname = Math.random().toString(36).substring(7);
let pname
const rcolor = Math.floor(Math.random() * 16777215).toString(16);
const img = new Image()
img.src = '../public/game2/tag.png';

let ws, tag, walls = [], scores = [], lastPoint = Date.now(), lastScore = Date.now(), score = 0;

// movement 
let kw = false;
let ks = false;
let kd = false;
let ka = false;


window.addEventListener('keydown', (e) => {
    if (e.key == 'w' || e.key == ' ') {
        kw = true;
    }
    if (e.key == 's') {
        ks = true;
    }
    if (e.key == 'a') {
        ka = true;
    }
    if (e.key == 'd') {
        kd = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key == 'w' || e.key == ' ') {
        kw = false;
    }
    if (e.key == 's') {
        ks = false;
    }
    if (e.key == 'a') {
        ka = false;
    }
    if (e.key == 'd') {
        kd = false;
    }
});

const movePlayer = () => {
    if (kw && player.onGround) {
        player.v.y = -7;
    }
    if (ks) {
        if (player.v.y < 3) {
            player.v.y += 0.2;
        }
    }
    if (ka) {
        if (player.v.x > -3) {
            player.v.x -= 0.2;
        }
    }
    if (kd) {
        if (player.v.x < 3) {
            player.v.x += 0.2;
        }
    }
}

// player
class Player {
    constructor(x, y, color, tag) {
        this.x = x;
        this.y = y;
        this.w = 40;
        this.h = 80;
        this.color = color;
        this.v = { x: 0, y: 0 };
        this.onGround = false;
        this.tag = tag;
    }

    draw() {
        ctx.fillText(`${pname}`, player.x - 20, player.y - 10);
        if (player.tag && false) {
            ctx.drawImage(img, this.x, this.y, 40, 80);
        } else {
            ctx.beginPath();
            ctx.fillStyle = `#${this.color}`;
            ctx.fillRect(this.x, this.y, 40, 80);
        }
    }

    move() {
        movePlayer();
        // gravity
        this.v.y += 0.2;

        // check for ground
        let c = false

        let maxSpeed = Math.abs(this.v.x) > Math.abs(this.v.y) ? Math.abs(this.v.x) / 2 : Math.abs(this.v.y) / 2;
        if (maxSpeed <= 1) maxSpeed = 1;
        let range = maxSpeed * 3;

        walls.forEach(wall => {
            let touched = false;
            //collision with left wall
            if (this.x + this.w > wall.x && this.x + this.w < wall.x + range && this.y + this.h > wall.y && this.y < wall.bottom) {
                touched = true;
                this.x = wall.x - this.w;
                if (this.v.x >= 0) this.v.x = 0;
            }
            //collision with right wall
            if (this.x > wall.right - range && this.x < wall.right && this.y + this.h > wall.y && this.y < wall.bottom) {
                touched = true;
                this.x = wall.right;
                if (this.v.x <= 0) this.v.x = 0;
            }
            //collision with top wall
            if (this.x + this.w > wall.x && this.x < wall.right && this.y + this.h > wall.y && this.y + this.h < wall.y + range) {
                touched = true;
                this.y = wall.y - this.h;
                this.v.y = 0;
                this.onGround = true;
                c = true;
            }
            //collision with bottom wall
            if (this.x + this.w > wall.x && this.x < wall.right && this.y > wall.bottom - range && this.y < wall.bottom) {
                touched = true;
                if (!wall.player) this.y = wall.bottom;
                if (this.v.y <= 0) this.v.y = 0;
            }

            if (wall.tag && touched) {
                ws.send(JSON.stringify({
                    d: 'ttag',
                    data: pname
                }))
            }
        });

        if (!c) {
            this.onGround = false;
        }

        if (this.onGround) this.v.x *= 0.9;

        this.v.x *= 0.98;

        this.x += this.v.x;
        this.y += this.v.y;

    }
}

const player = new Player(100, 900, rcolor, false);

// walls 
class Wall {
    constructor(x, y, w, h, player, color, tag) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.right = x + w;
        this.bottom = y + h;
        this.player = player
        this.color = color;
        this.tag = tag;
    }

    draw() {
        if (this.tag && false) {
            ctx.drawImage(img, this.x, this.y, 40, 80);
        } else {
            ctx.beginPath();
            ctx.fillStyle = `#${this.color}`;
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }

        if (this.player) {
            ctx.font = '30px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(this.player, this.x - 20, this.y - 10);
        }
    }
}

// websocket messages handler
const messageHandeler = (message) => {
    if (message.d) {
        switch (message.d) {

            case 'map':
                walls = [];
                for (let wall of message.data) {
                    walls.push(new Wall(wall.x, wall.y, wall.w, wall.h, false, wall.color, false));
                }
                render();
                break;
            case 'players':
                walls.forEach(wall => {
                    if (wall.player) walls.splice(walls.indexOf(wall), 1);
                })
                message.data.forEach(player => {
                    if (player.name != pname) {
                        walls.push(new Wall(player.x, player.y, 40, 80, player.name, player.color, false));
                    }
                })
                break;
            case 'tag':
                if (message.data.name == pname) { player.tag = true; tag = undefined }
                else { tag = message.data; player.tag = false; walls.push(new Wall(tag.x, tag.y, 40, 80, tag.name, tag.color, true)); }
                break;
            case 'scores':
                scores = message.data;
        }
    }
}

// websocket
const wsConnect = () => {
    // ws = new WebSocket('ws://www.nyalice.com:8081/');
    ws = new WebSocket('ws://localhost:8081/');

    ws.onopen = () => {
        console.log('connected');
        ws.send(JSON.stringify({
            d: 'getMap',
        }));
    }

    ws.onmessage = (message) => {
        let dataJson = JSON.parse(message.data)
        messageHandeler(dataJson);
    }

    ws.onclose = () => {
        wsConnect();
    }
}

// leaderboard
const updateScore = () => {
    if (lastPoint + 1000 < Date.now() && player.tag) {
        score++
        lastPoint = Date.now()
    }

    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`X: ${Math.round(player.x)}`, 10, 60);
    ctx.fillText(`Y: ${Math.round(player.y)}`, 10, 90);

    let sorted = scores.sort((a, b) => {
        return b.score - a.score;
    });

    let i = 0;
    sorted.forEach(score => {
        ctx.fillText(`${score.name}: ${score.score}`, 10, 150 + i * 30);
        i++;
    })
}

let render = () => {
    let startTime = Date.now();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#36393f';
    ctx.fillRect(0, 0, w, h);

    walls.forEach(wall => { wall.draw(); });

    updateScore();

    player.move();
    player.draw();

    //send possition to server
    ws.send(JSON.stringify({
        d: 'player',
        data: {
            x: player.x,
            y: player.y,
            name: pname,
            color: rcolor,
            score: score
        }
    }));

    let time = Date.now() - startTime;
    if (time < 1000 / 165) {
        setTimeout(() => {
            requestAnimationFrame(render);
        }, 1000 / 165 - time);
    } else {
        requestAnimationFrame(render);
    }
}