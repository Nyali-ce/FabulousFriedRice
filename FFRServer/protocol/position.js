const { user } = require('../utils/database');

module.exports = async function (socket, data) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'position',
            data: {
                error: msg,
            }
        }));
    }

    if(data?.x == undefined) return error('Missing x');
    if(data?.y == undefined) return error('Missing y');
    if(data?.mapX == undefined) return error('Missing mapX');
    if(data?.mapY == undefined) return error('Missing mapY');
    if(data?.vx == undefined) return error('Missing vx');
    if(data?.vy == undefined) return error('Missing vy');

    if(!socket.userData) return error('Not logged in');

    const userData = await user(socket.userData.username);

    if (!userData) return error('Invalid username')

    socket.userData.position.x = userData.position.x = data.x;
    socket.userData.position.y = userData.position.y = data.y;
    socket.userData.position.mapX = userData.position.mapX = data.mapX;
    socket.userData.position.mapY = userData.position.mapY = data.mapY;

    socket.userData.position.vx = data.vx;
    socket.userData.position.vy = data.vy;
    socket.userData.position.onGround = data.onGround;

    await user(socket.userData.username, userData);
};