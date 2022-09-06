const fs = require('fs');

const request = (path, dataType, id, data, create) => {
    if (!id) return;
    if (!data) {
        if (!fs.existsSync(path)) {
            if (!create) return undefined;
            fs.writeFileSync(path, JSON.stringify(dataType));
        }
        return JSON.parse(fs.readFileSync(path));
    } else {
        fs.writeFileSync(path, JSON.stringify(data));
    }
};

module.exports = {
    user: (user_ID, data) => { return request(`data/users/${user_ID}.json`, {}, user_ID, data, false) }
}