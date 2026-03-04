const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/permissionMiddleware");

const DB_PATH = "./data/db.json";


// ===== CREATE USER (ADMIN ONLY) =====
router.post("/users",
    authenticate,
    authorize("manage_users"),
    async (req, res) => {

        const { username, password, role } = req.body;

        const db = JSON.parse(fs.readFileSync(DB_PATH));

        if (db.users.find(u => u.username === username)) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        db.users.push({
            id: uuidv4(),
            username,
            password: hashedPassword,
            role: role || "worker"
        });

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        res.json({ message: "User created successfully" });

    }
);


// ===== GET ALL USERS =====
router.get("/users",
    authenticate,
    authorize("manage_users"),
    (req, res) => {

        const db = JSON.parse(fs.readFileSync(DB_PATH));
        res.json(db.users);

    }
);


// ===== DELETE USER =====
router.delete("/users/:id",
    authenticate,
    authorize("manage_users"),
    (req, res) => {

        const { id } = req.params;

        const db = JSON.parse(fs.readFileSync(DB_PATH));

        // Prevent admin from deleting themselves
        if (req.user.id === id) {
            return res.status(400).json({
                message: "You cannot delete yourself"
            });
        }

        const newUsers = db.users.filter(user => user.id !== id);

        db.users = newUsers;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        res.json({ message: "User deleted successfully" });

    }
);

module.exports = router;
