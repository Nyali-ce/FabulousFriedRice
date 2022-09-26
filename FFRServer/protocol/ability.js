const { ability, user } = require('../utils/database');

module.exports = async function (socket, data) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'ability',
            data: {
                error: msg,
            }
        }));
    }

    if (!data?.name) return error('Missing ability name');

    const abilityData = await ability(data.name);

    console.log(abilityData)
    if (!abilityData) return error('Invalid ability name')

    const userData = user(socket.userData.username)

    if (!userData.abilities) userData.abilities = [];
    if (userData.abilities.some(obj => obj.name === data.name)) return;
    userData.abilities.push({ name: data.name, run: abilityData.run })

    await user(socket.userData.username, userData)

    socket.send(JSON.stringify({
        type: 'userData',
        data: {
            userData
        }
    }))
};