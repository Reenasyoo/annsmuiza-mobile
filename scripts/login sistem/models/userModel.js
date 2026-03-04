const fs = require("fs");
const DB_PATH = "./data/db.json";

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUsers() {
    return readDB().users;
}

function saveUsers(users) {
    const db = readDB();
    db.users = users;
    writeDB(db);
}

function getRoles() {
    return readDB().roles;
}

module.exports = {
    getUsers,
    saveUsers,
    getRoles
};
