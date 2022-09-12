const fs = require('fs');
const { WebSocketServer } = require('ws')

const port = 8080;

let positionInterval;

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

const sendPositionLoop = (active) => {
    if(active) return positionInterval = setInterval(() => {
        const players = clients.map(client => client.userData);

        players.forEach(player => { if(!player.userData) players.splice(players.indexOf(player), 1) });

        for (const client of clients) {
            client.send(JSON.stringify({
                type: 'players',
                data: {
                    players,
                }
            }));
        }
    }, 500);
    else clearInterval(positionInterval);
    
    console.log(positionInterval, 0)
}

const packetHandler = (client, packet) => {
    const { type, data } = packet;
    if (!protocol[type]) return console.log(`Unknown packet type: ${type}`);
    protocol[type](client, data);
};

server.on('connection', client => {
    clients.push(client);

    client.on('message', packet => { packetHandler(client, JSON.parse(packet)); });
    client.on('close', () => { clients.splice(clients.indexOf(client), 1); if(clients.length === 0) sendPositionLoop(false); });
});

server.on('listening', () => {
    console.log(`Server opened on port ${port}`)
})