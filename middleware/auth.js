// middleware/auth.js
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "ADMIN") {
    return next();
  }
  res.status(403).send("Unauthorized");
};
