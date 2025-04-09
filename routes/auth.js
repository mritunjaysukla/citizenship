const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Registration route
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "APPLICANT",
      },
    });

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid email or password",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
      return res.json({ success: true, redirectUrl: "/" });
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
