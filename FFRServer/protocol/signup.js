const { user } = require('../utils/database');
const { mapData } = require('../utils/database');

module.exports = async function (socket, data, clients) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'signup',
            data: {
                error: msg,
            }
        }));
    }

    if (!data?.username) return error('Missing username');

    data.username = data.username.trim();

    if (data.username.length > 20) return error('Username must be less than 20 characters long');
    if (data.username.length < 3) return error('Username must be at least 3 characters long');

    if (!data?.password) return error('Missing password');
    if (data.password.length < 6) return error('Password must be at least 6 characters long');

    const userData = await user(data.username);

    if (userData) return error('Username already taken')

    const localMapData = await mapData(0, 0);

    const newUser = {
        username: data.username,
        password: data.password,
        id: Math.floor(Math.random() * 100000000),
        position: {
            x: localMapData.startPosX,
            y: localMapData.startPosY,
            mapX: 0,
            mapY: 0
        }
    };

    try {
        await user(data.username, newUser);
    } catch (e) {
        return error('An error occured while trying to create your account');
    }



    delete newUser.password;

    socket.userData = newUser;

    clients.forEach(client => {
        client.send(JSON.stringify({
            type: 'playerJoin',
            data: {
                userData: {
                    username: newUser.username,
                    id: newUser.id,
                }
            }
        }))
    });

    return socket.send(JSON.stringify({
        type: 'login',
        data: {
            userData: newUser
        }
    }))
};