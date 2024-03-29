const { user } = require('../utils/database');

module.exports = async function (socket, data, clients) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'login',
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

    if (!userData) return error('Invalid username')
    if (data.password !== userData.password) return error('Invalid password')

    delete userData.password;

    socket.userData = userData;

    socket.send(JSON.stringify({
        type: 'login',
        data: {
            userData,
        }
    }))

    console.log(`User ${userData.username} logged in`);

    if (!clients) return;

    clients.forEach(client => {
        client.send(JSON.stringify({
            type: 'playerJoin',
            data: {
                userData: {
                    username: userData.username,
                    id: userData.id,
                }
            }
        }))
    });
};