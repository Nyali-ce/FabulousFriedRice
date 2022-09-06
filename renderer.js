const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const w = canvas.width = 1920;
const h = canvas.height = 1080;

String.prototype.nyaliceHash = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

const frogotPasswordBtn = document.getElementById('frogor');
frogotPasswordBtn.addEventListener('click', () => {
    frogotPasswordBtn.innerHTML = 'didn\'t ask';
})

let formType = 'login';

const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');

const signupText = document.getElementById('signup_text');

const formText = document.getElementById('formText');

const login = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    if (username.length > 20) {
        alert('Username must be less than 20 characters long');
        return;
    }
    if (password.length > 20) {
        alert('Password must be less than 20 characters long');
        return;
    }

    const hash = password.nyaliceHash();

    let link = 'login';
    if (formType === 'signup') link = 'signup';
    fetch(`http://nyalice.com/api/beatstar/${link}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: hash
        })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (formType === 'signup') {
                toggleSignup();
                login();
            } else {
                document.getElementById('login').style.display = 'none';
            }
        } else {
            alert(data.message);
        }
    }).catch(err => {
        console.error(err);
    });
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