const fs = require("fs");
const DB_PATH = "./data/db.json";

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getBookings() {
    return readDB().bookings || [];
}

function saveBookings(bookings) {
    const db = readDB();
    db.bookings = bookings;
    writeDB(db);
}

function getBookingById(id) {
    const bookings = getBookings();
    return bookings.find(b => b.id === id);
}

module.exports = {
    getBookings,
    saveBookings,
    getBookingById
};
