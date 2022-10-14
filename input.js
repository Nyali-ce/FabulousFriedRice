let c = document.querySelector('.c');
let ctx2 = c.getContext('2d');

let maxParticles = 50;
let particles = [];
let hue = 183;

let random = (min, max) => {
    return Math.random() * (max - min) + min;
};

class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 0;
        this.origSize = 0;
        this.sides = 0;
        this.life = 0;
        this.maxLife = 0;
        this.alpha = 0;
    }
    init() {
        this.size = this.origSize = random(3, 8);
        this.x = player.x + player.w / 2;
        this.y = player.y + player.h / 2;
        this.sides = random(3, 10);
        this.vx = random(-5, 5);
        this.vy = random(-5, 5);
        this.life = 0;
        this.maxLife = random(50, 200);
        this.alpha = 1;
    }
    draw() {
        ctx2.strokeStyle = 'hsla(' + hue + ', 100%, 50%, ' + this.alpha + ')';
        ctx2.fillStyle = 'hsla(' + hue + ', 100%, 50%, ' + (this.alpha * .4) + ')';
        ctx2.beginPath();
        ctx2.moveTo(this.x + this.size * Math.cos(0), this.y + this.size * Math.sin(0));
        for (let i = 0; i < this.sides; i++) {
            ctx2.lineTo(this.x + this.size * Math.cos(i * 2 * Math.PI / this.sides), this.y + this.size * Math.sin(i * 2 * Math.PI / this.sides));
        }
        ctx2.closePath();
        ctx2.lineWidth = this.size / 20;
        ctx2.fill();
        ctx2.stroke();
        this.update();
    }
    update() {
        let rad = this.size / 2;
        if (this.life <= this.maxLife) {
            if ((this.x - rad <= 0 && this.vx < 0) || (this.x + rad >= w && this.vx > 0)) {
                this.vx *= -1;
            }
            if ((this.y - rad <= 0 && this.vy < 0) || (this.y + rad >= h && this.vy > 0)) {
                this.vy *= -1;
            }
            this.alpha *= .978;
            this.x += this.vx;
            this.y += this.vy;
            this.vy += .1;
            this.size += .4;
            this.life++;
        } else {
            this.init();
        }
    }
}

let init = () => {
    for (let i = 0; i < maxParticles; i++) {
        let p = new Particle();
        p.init();
        particles.push(p);
    }
    anim();
};

let anim = () => {
    ctx2.clearRect(0, 0, w, h);
    hue += .5;
    for (const particle of particles) particle.draw();
    animationId = requestAnimationFrame(anim);
};

init();