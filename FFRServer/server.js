const fs = require('fs');
const { WebSocketServer } = require('ws')

const port = 8080;

let positionInterval;
let intervalLoop = false;

const server = new WebSocketServer({
    port,
});

const clients = [];
const protocol = {};

const protocolFolder = fs.readdirSync(`${__dirname}/protocol`)
const protocolFiles = protocolFolder.filter(file => file.endsWith('.js'));
for (const file of protocolFiles) {
    const protocolFile = require(`${__dirname}/protocol/${file}`);
    protocol[file.split('.js')[0]] = protocolFile;
}

const sendPositionLoop = active => {
    if (active) {
        positionInterval = setInterval(() => {
            const players = [...clients.map(client => client.userData)];

            players.forEach((player, index) => {
                if (player === undefined) {
                    players.splice(index, 1);
                } else {
                    delete player.password;
                }
            });

            console.log(`Sending position data to ${clients.length} clients`);

            if (players.length > 0) for (const client of clients) {
                client.send(JSON.stringify({
                    type: 'players',
                    data: {
                        players,
                    }
                }));
            }
        }, 100);
        intervalLoop = true;
    }
    else {
        clearInterval(positionInterval);
        intervalLoop = false;
    }
}

const packetHandler = (client, packet) => {
    const { type, data } = packet;
    if (!protocol[type]) return console.log(`Unknown packet type: ${type}`);
    protocol[type](client, data, clients);
};

server.on('connection', client => {
    clients.push(client);

    if (!intervalLoop) sendPositionLoop(true);

    client.on('message', packet => { packetHandler(client, JSON.parse(packet)); });
    client.on('close', () => {
        if (client.userData) {
            clients.forEach(player => player.send(JSON.stringify({
                type: 'playerLeave',
                data: {
                    player: {
                        username: client.userData.username,
                        id: client.userData.id,
                    }
                }
            })));
        }

        clients.splice(clients.indexOf(client), 1); if (clients.length === 0) sendPositionLoop(false);
    });
});

server.on('listening', () => {
    console.log(`Server opened on port ${port}`)
})