// login
const popup = (message) => {
    const main = document.getElementById('login');
    main.style.filter = 'blur(5px) brightness(0.5)';

    const popupDiv = document.createElement('div');
    popupDiv.id = 'popup';
    popupDiv.innerHTML = message;

    // remove button
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

    let link = 'login';
    if (formType === 'signup') link = 'signup';
    ws.send(JSON.stringify({
        type: formType,
        data: {
            username,
            password: hash
        }
    }))
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

loginBtn.addEventListener('click', login);
signupBtn.addEventListener('click', toggleSignup);

const frogotPasswordBtn = document.getElementById('frogor');
frogotPasswordBtn.addEventListener('click', () => {
    frogotPasswordBtn.innerHTML = 'didn\'t ask';
})



// webSocket
let ws;

const packetHandler = packet => {
    if (!packet?.type || !packet?.data) return

    switch (packet.type) {
        case 'login':
            if (!packet.data.success) return popup(packet.data.reason)

            loggedIn = true;

            username = packet.data.userData.name
            document.getElementById('login').remove()
            render()
            break;
        case 'signup':
            popup(packet.data.reason)
            break;
    }
}

const wsConnect = () => {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('connected')
    }

    ws.onmessage = message => {
        const dataJson = JSON.parse(message.data)
        packetHandler(dataJson)
    }

    ws.onclose = () => {
        wsConnect()
    }
}

wsConnect();



// game
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.onresize = () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
}

const fps = 165;

let username;

let loggedIn = false;

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
}

window.addEventListener('keydown', e => {
    if (!loggedIn && e.key == 'enter') login();
    if (e.key == 'w' || e.key == ' ') keys.w = true;
    if (e.key == 's') keys.s = true;
    if (e.key == 'a') keys.a = true;
    if (e.key == 'd') keys.d = true;
})

window.addEventListener('keyup', e => {
    if (e.key == 'w' || e.key == ' ') keys.w = false;
    if (e.key == 's') keys.s = false;
    if (e.key == 'a') keys.a = false;
    if (e.key == 'd') keys.d = false;
})

const movePlayer = () => {
    if (keys.w && player.onGround) player.vy = -7;
    if (keys.s) if (player.vy < 3) player.vy += 0.2;
    if (keys.a) if (player.vx > 3) player.vx -= 0.2;
    if (keys.d) if (player.vx < 3) player.vx += 0.2;
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.w = 50;
        this.h = 100;
        this.color = '#fff';
        this.onGround = false;
    }

    draw() {
        ctx.fillStyle = 'white'
        ctx.font = '30px Arial'
        ctx.fillText(`${username}`, this.x - 20, this.y - 10);

        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.w, this.h)
    }

    update() {
        movePlayer();

        this.vy += 0.2;

        let inAir = true;

        let maxSpeed = Math.abs(this.vx) > Math.abs(this.vy) ? Math.abs(this.vx) / 2 : Math.abs(this.vy) / 2;
        if (maxSpeed < 1) maxSpeed = 1;

        const range = maxSpeed * 3;

        walls.forEach(wall => {
            let touched = false;
            //collision with left wall
            if (this.x + this.w > wall.x && this.x + this.w < wall.x + range && this.y + this.h > wall.y && this.y < wall.bottom) {
                touched = true;
                this.x = wall.x - this.w;
                if (this.vx >= 0) this.vx = 0;
            }
            //collision with right wall
            if (this.x > wall.right - range && this.x < wall.right && this.y + this.h > wall.y && this.y < wall.bottom) {
                touched = true;
                this.x = wall.right;
                if (this.vx <= 0) this.vx = 0;
            }
            //collision with top wall
            if (this.x + this.w > wall.x && this.x < wall.right && this.y + this.h > wall.y && this.y + this.h < wall.y + range) {
                touched = true;
                this.y = wall.y - this.h;
                this.vy = 0;
                this.onGround = true;
                inAir = false;
            }
            //collision with bottom wall
            if (this.x + this.w > wall.x && this.x < wall.right && this.y > wall.bottom - range && this.y < wall.bottom) {
                touched = true;
                this.y = wall.bottom;
                if (this.vy <= 0) this.vy = 0;
            }
        });

        if (inAir) this.onGround = false;

        if (this.onGround) this.vx *= 0.9;

        this.vx *= 0.98;

        this.x += this.vx;
        this.y += this.vy;
    }
}

class Wall {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.right = x + w;
        this.bottom = y + h;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

const player = new Player(w / 2, h / 2);

const walls = [new Wall(0, 400, 1000, 100, '#fff')];

const render = () => {
    let startTime = Date.now();
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    walls.forEach(wall => wall.draw())

    player.update()
    player.draw()


    let time = Date.now() - startTime;
    if (time < 1000 / 165) {
        setTimeout(() => {
            requestAnimationFrame(render);
        }, 1000 / 165 - time);
    } else {
        requestAnimationFrame(render);
    }
}