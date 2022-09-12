const { mapData } = require('../utils/database');

module.exports = async function (socket, data) {
    const error = (msg) => {
        socket.send(JSON.stringify({
            type: 'mapData',
            data: {
                error: msg,
            }
        }));
    }

    if (data?.mapX == undefined) return error('Missing mapX');
    if (!data?.mapY == undefined) return error('Missing mapY');

    const localMapData = await mapData(data.mapX, data.mapY);

    if (localMapData == undefined) return error('Map data not found');

    return socket.send(JSON.stringify({
        type: 'mapData',
        data: {
            mapX: data.mapX,
            mapY: data.mapY,
            mapData: localMapData
        }
    }))
};