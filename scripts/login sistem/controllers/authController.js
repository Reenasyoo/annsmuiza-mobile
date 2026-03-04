const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getUsers, saveUsers, getRoles } = require("../models/userModel");

exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    let users = getUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    users.push({
        id: uuidv4(),
        username,
        password: hashedPassword,
        role: role || "worker"
    });

    saveUsers(users);

    res.json({ message: "User created successfully" });
};


exports.login = async (req, res) => {
    const { username, password } = req.body;

    const users = getUsers();
    const roles = getRoles();

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const roleData = roles.find(r => r.name === user.role);

    const accessToken = jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
            permissions: roleData.permissions
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    res.json({ accessToken, refreshToken });
};
