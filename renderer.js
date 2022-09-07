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
    if(!packet?.type || !packet?.data) return

    switch (packet.type) {
        case 'login':
            if(!packet.data.success) return popup(packet.data.reason)
            
            popup('Logged in')
            // document.getElementById('login').remove()
            // render()
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

const w = canvas.width = 1920;
const h = canvas.height = 1080;

const fps = 165;

class Player {
    constructor(x,y) {
        this.x = x;
        this.y =y;
        this.vx = 0;
        this.vy = 0;
        this.width = 50;
        this.height = 100;
        this.color = '#fff';

    }
}

const render = () => {
    let startTime = Date.now();
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    let time = Date.now() - startTime;
    if (time < 1000 / 165) {
        setTimeout(() => {
            requestAnimationFrame(render);
        }, 1000 / 165 - time);
    } else {
        requestAnimationFrame(render);
    }
}