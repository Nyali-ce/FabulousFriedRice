let c = document.getElementById("c");
let w2 = c.width = window.innerWidth;
let h2 = c.height = window.innerHeight;
let ctx = c.getContext("2d");

let maxParticles = 50;
let particles = [];
let hue = 183;

let mouse = {};
mouse.size = 50;
mouse.x = player.x + player.w / 2
mouse.y = player.y + player.h / 2

let clearColor = "rgba(0, 0, 0, .3)";

function random(min, max) {
    return Math.random() * (max - min) + min
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function P() { }

P.prototype = {
    init: function () {
        this.size = this.origSize = random(3, 8);
        this.x = mouse.x;
        this.y = mouse.y;
        this.sides = random(3, 10);
        this.vx = random(-5, 5);
        this.vy = random(-5, 5);
        this.life = 0;
        this.maxLife = random(50, 200);
        this.alpha = 1;
    },

    draw: function () {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "hsla(" + hue + ", 100%, 50%, " + this.alpha + ")";
        ctx.fillStyle = "hsla(" + hue + ", 100%, 50%, " + (this.alpha * .4) + ")";
        ctx.beginPath();
        ctx.moveTo(this.x + this.size * Math.cos(0), this.y + this.size * Math.sin(0));
        for (let i = 0; i < this.sides; i++) {
            ctx.lineTo(this.x + this.size * Math.cos(i * 2 * Math.PI / this.sides), this.y + this.size * Math.sin(i * 2 * Math.PI / this.sides));
        }
        ctx.closePath();
        ctx.lineWidth = this.size / 20;
        ctx.fill();
        ctx.stroke();
        this.update();
    },

    update: function () {
        let rad = this.size / 2;

        if (this.life <= this.maxLife) {
            if ((this.x - rad <= 0 && this.vx < 0) || (this.x + rad >= w2 && this.vx > 0)) {
                this.vx *= -1;
            }

            if ((this.y - rad <= 0 && this.vy < 0) || (this.y + rad >= h2 && this.vy > 0)) {
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

window.addEventListener("resize", function () {
    w2 = c.width = window.innerWidth;
    h2 = c.height = window.innerHeight;
    mouse.x = w2 / 2;
    mouse.y = h2 / 2;
});

for (let i = 1; i <= maxParticles; i++) {
    setTimeout(function () {
        let p = new P();
        p.init();
        particles.push(p);
    }, i * 50);
}



function anim() {
    ctx.fillStyle = clearColor;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillRect(0, 0, w2, h2);
    mouse.x = player.x + player.w / 2;
    mouse.y = player.y + player.h / 2;

    for (let i in particles) {
        let p = particles[i];
        p.draw();
    }

    hue += .5;
    animationId = requestAnimationFrame(anim);
}

anim();


