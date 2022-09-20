const { user } = require('../utils/database');

module.exports = async function (socket, data) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'signup',
            data: {
                error: msg,
            }
        }));
    }

    if (!data?.username) return error('Missing username');
    if (data.username.length > 20) return error('Username must be less than 20 characters long');
    if (data.username.length < 3) return error('Username must be at least 3 characters long');

    if (!data?.password) return error('Missing password');
    if (data.password.length < 6) return error('Password must be at least 6 characters long');

    const userData = await user(data.username);

    if (userData) return error('Username already taken')

    const newUser = {
        username: data.username,
        password: data.password,
        id: Math.floor(Math.random() * 100000000),
        position: {
            x: 0,
            y: 0,
            mapX: 0,
            mapY: 0
        }
    };

    await user(data.username, newUser);

    delete newUser.password;

    socket.userData = newUser;

    return socket.send(JSON.stringify({
        type: 'login',
        data: {
            userData: newUser
        }
    }))
};