const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, bookingController.getAllBookings);
router.get("/:id", authenticate, bookingController.getBooking);
router.post("/", authenticate, bookingController.createBooking);
router.patch("/:id", authenticate, bookingController.updateBooking);
router.delete("/:id", authenticate, bookingController.deleteBooking);

module.exports = router;
