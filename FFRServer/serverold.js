const fs = require('fs');
const { WebSocketServer } = require('ws')

const gameServer = new WebSocketServer({
    port: 8081
});

let gclients = [];
let tag;
let tagName;

let sendLoopr = false

const sendLoop = () => {
    let fTag = false
    let players = []
    let scores = []
    gclients.forEach(client => {
        if (client.player) {
            scores.push({
                name: client.player.name,
                score: client.player.score
            })
            if (tagName == client.player.name) {
                tag = client.player;
                fTag = true;
            } else {
                players.push({
                    x: client.player.x,
                    y: client.player.y,
                    name: client.player.name,
                    color: client.player.color,
                })
            }
        }
    })
    if (!fTag && gclients.length > 0 && gclients[0].player) {
        tagName = gclients[0].player.name
    }
    gclients.forEach((client) => {
        client.send(JSON.stringify({
            d: 'players',
            data: players
        }))
        if (tag) {
            client.send(JSON.stringify({
                d: 'tag',
                data: tag
            }))
        }
        client.send(JSON.stringify({
            d: 'scores',
            data: scores
        }))
    });
    if (sendLoopr) setTimeout(sendLoop, 1000 / 60);
}

let lastTag = Date.now();

gameServer.on('connection', (ws) => {
    if (!sendLoopr) {
        sendLoopr = true;
        sendLoop()
    }
    gclients.push(ws);
    ws.on('message', (message) => {
        let data = JSON.parse(message);
        if (data.d) {
            switch (data.d) {
                case 'getMap':
                    let map = JSON.parse(fs.readFileSync(`${__dirname}/public/game2/map.json`));
                    ws.send(JSON.stringify({
                        d: 'map',
                        data: map
                    }));
                    break;
                case 'player':
                    if (!tagName) tagName = data.data.name
                    gclients.forEach((c) => {
                        if (c === ws) {
                            c.player = data.data;
                        }
                    })
                    break;
                case 'ttag':
                    if (lastTag + 500 < Date.now()) {
                        tagName = data.data;
                        lastTag = Date.now();
                    }
                    break;
            }
        }
    });
    ws.on('close', () => {
        console.log('disconnected');
        gclients.splice(gclients.indexOf(ws), 1);
    });
});

gameServer.on('open', () => {
    console.log('server started');
});