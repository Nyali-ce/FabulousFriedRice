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

    if(!data?.x) return error('Missing x');
    if(!data?.y) return error('Missing y');

    const userData = await user(socket.userData.username);

    if (!userData) return error('Invalid username')

    userData.position.x = data.x;
    userData.position.y = data.y;

    await user(socket.userData.username, userData);
};