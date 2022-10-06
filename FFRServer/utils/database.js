const fs = require('fs');

const request = (path, dataType, id, data, create) => {
    if (!id) return;
    if (!data) {
        if (!fs.existsSync(path)) {
            if (!create) return undefined;
            fs.writeFileSync(path, JSON.stringify(dataType));
        }
        console.log(fs.readFileSync(path).toString());
        return JSON.parse(fs.readFileSync(path));
    } else {
        fs.writeFileSync(path, JSON.stringify(data));
    }
};

module.exports = {
    user: (user_ID, data) => { return request(`data/users/${user_ID}.json`, {}, user_ID, data, false) },
    mapData: (mapX, mapY) => { return request(`data/maps/${mapX}_${mapY}.json`, {}, `${mapX}_${mapY}`, undefined, false) },
    ability: (name) => { return request(`data/maps/${name}.json`, {}, name, false) },
}