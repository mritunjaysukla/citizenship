const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { isAdmin } = require("../middleware/auth"); // Assuming you have an isAdmin middleware

const prisma = new PrismaClient();

// Admin dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        applicant: true,
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
        appointment: true,
        documents: true,
      },
    });
    res.render("admin/dashboard", { user: req.user, applications });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update application status
router.post("/application/:id/status", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await prisma.application.update({
      where: { id },
      data: { status },
    });

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
