module.exports = async function (socket, data, clients) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'message',
            data: {
                error: msg,
            }
        }));
    }

    if (!data?.message) return error('Missing username');
    if (data.message.length > 100) return error('Message must be less than 100 characters long');
    if (data.message.length < 1) return error('Message must be at least 1 character long');

    console.log(`Message sent by ${socket.userData.username}: ${data.message}`);

    clients.forEach(client => {
        client.send(JSON.stringify({
            type: 'message',
            data: {
                message: data.message,
                username: socket.userData.username,
            }
        }))
    });
};