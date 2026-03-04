const { v4: uuidv4 } = require("uuid");
const { getBookings, saveBookings, getBookingById } = require("../models/bookingModel");

exports.getAllBookings = (req, res) => {
    const bookings = getBookings();
    res.json(bookings);
};

exports.getBooking = (req, res) => {
    const { id } = req.params;
    const booking = getBookingById(id);
    
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
};

exports.createBooking = (req, res) => {
    const { customer, email, phone, item, startDate, endDate, guests, status, description, extras } = req.body;

    if (!customer || !email || !item || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const bookings = getBookings();

    const newBooking = {
        id: uuidv4(),
        customer,
        email,
        phone: phone || "",
        item,
        startDate,
        endDate,
        guests: guests || 1,
        status: status || "pending",
        description: description || "",
        extras: extras || [],
        createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    saveBookings(bookings);

    res.status(201).json(newBooking);
};

exports.updateBooking = (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Booking not found" });
    }

    bookings[index] = {
        ...bookings[index],
        ...updates,
        id: bookings[index].id,
        createdAt: bookings[index].createdAt
    };

    saveBookings(bookings);
    res.json(bookings[index]);
};

exports.deleteBooking = (req, res) => {
    const { id } = req.params;

    const bookings = getBookings();
    const filtered = bookings.filter(b => b.id !== id);

    if (filtered.length === bookings.length) {
        return res.status(404).json({ message: "Booking not found" });
    }

    saveBookings(filtered);
    res.json({ message: "Booking deleted successfully" });
};
