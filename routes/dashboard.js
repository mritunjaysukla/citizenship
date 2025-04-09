const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { isAuthenticated } = require("../middleware/auth");

const prisma = new PrismaClient();

// Dashboard route
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { applicantId: req.user.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
        appointment: true,
      },
    });

    res.render("dashboard", { user: req.user, applications });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
