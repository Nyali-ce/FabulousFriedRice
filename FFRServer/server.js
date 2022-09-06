const fs = require('fs');
const { WebSocketServer } = require('ws')

const server = new WebSocketServer({
    port: 8080
});

const clients = [];

const packetHandler = (client, packet) => {

};

server.on('connection', client => {
    clients.push(client);

    client.on('message', packet => { packetHandler(client, JSON.parse(packet)); });
    client.on('close', () => { clients.splice(clients.indexOf(client), 1); });
});