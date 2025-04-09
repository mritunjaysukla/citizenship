require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const addTemplateUtils = require("./middleware/templateUtils");

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-fallback-secret-key", // Add SESSION_SECRET to .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);
// Update your helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      },
    },
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(addTemplateUtils);
// Routes
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/application");
const adminRoutes = require("./routes/admin");
const dashboardRoutes = require("./routes/dashboard");

app.use("/auth", authRoutes);
app.use("/application", applicationRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.render("index", {
    user: req.user,
    currentDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });
});

// View routes for login and register pages
app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

app.get("/register", (req, res) => {
  res.render("register", { user: req.user });
});

const port = process.env.PORT || 5000;

app
  .listen(port, () => {
    console.log("✅ Server running at http://localhost:" + port);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err.message);
  });
