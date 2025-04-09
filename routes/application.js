const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const multer = require("multer");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../config/multer");
const prisma = new PrismaClient();
const fs = require("fs");

// Create uploads directory with absolute path
const uploadDir = path.join(__dirname, "..", "public", "uploads", "documents");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadDir}`);
  } catch (error) {
    console.error(`Error creating uploads directory: ${error.message}`);
  }
}

// Middleware to check if user has an existing application
const checkExistingApplication = async (req, res, next) => {
  try {
    const existingApplication = await prisma.application.findFirst({
      where: {
        applicantId: req.user.id,
        status: {
          notIn: ["REJECTED", "COMPLETED"],
        },
      },
    });

    if (existingApplication) {
      return res.redirect(`/application/status/${existingApplication.id}`);
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Start new application
router.get("/new", isAuthenticated, checkExistingApplication, (req, res) => {
  res.render("application/applicant-data", { user: req.user });
});

// Submit applicant data
router.post("/applicant-data", isAuthenticated, async (req, res) => {
  try {
    // Generate request number (similar to the one shown in the image: 6889256722741)
    const requestNo = `${Date.now().toString().substring(0, 10)}${Math.floor(
      Math.random() * 10000
    )}`;

    // Create application and personal info
    const application = await prisma.application.create({
      data: {
        requestNo,
        applicantId: req.user.id,
        status: "DRAFT",
        personalInfo: {
          create: {
            firstNameNp: req.body.firstNameNp,
            firstNameEn: req.body.firstNameEn,
            middleNameNp: req.body.middleNameNp || null,
            middleNameEn: req.body.middleNameEn || null,
            lastNameNp: req.body.lastNameNp,
            lastNameEn: req.body.lastNameEn,
            dateOfBirth: new Date(req.body.dateOfBirth),
            birthPlace: req.body.birthPlace,
            citizenshipType: req.body.citizenshipType,
            district: req.body.district,
            gender: req.body.gender,
            maritalStatus: req.body.maritalStatus,
            education: req.body.education,
            profession: req.body.profession,
            caste: req.body.caste,
            religion: req.body.religion,
          },
        },
      },
    });

    res.redirect(`/application/contact-details/${application.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Contact details form
router.get("/contact-details/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    res.render("application/contact-details", {
      user: req.user,
      application,
      currentPath: req.path, // Add this line
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Submit contact details
router.post("/contact-details/:id", isAuthenticated, async (req, res) => {
  try {
    const { permanentAddress, phoneNumber, mobileNumber, email } = req.body;

    // Parse the JSON string if it's a string, otherwise use the object as is
    const addressData =
      typeof permanentAddress === "string"
        ? JSON.parse(permanentAddress)
        : permanentAddress;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        contactDetails: {
          create: {
            permanentAddress: addressData,
            phoneNumber,
            mobileNumber,
            email: email || null,
          },
        },
      },
    });

    res.redirect(`/application/family-details/${application.id}`);
  } catch (error) {
    console.error("Error submitting contact details:", error);
    res.status(500).send("Server error");
  }
});

// Family details form
router.get("/family-details/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    res.render("application/family-details", {
      user: req.user,
      application,
      currentPath: req.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Submit family details - Add your code here
router.post("/family-details/:id", isAuthenticated, async (req, res) => {
  try {
    console.log("Received family details:", req.body);

    if (!req.params.id) {
      throw new Error("Application ID is required");
    }

    // Check if family details already exist
    const existingFamilyDetails = await prisma.familyDetails.findUnique({
      where: {
        applicationId: req.params.id,
      },
    });

    let application;

    if (existingFamilyDetails) {
      // Update existing family details
      application = await prisma.application.update({
        where: { id: req.params.id },
        data: {
          familyDetails: {
            update: {
              fatherName: req.body.fatherName,
              fatherCitizenship: req.body.fatherCitizenship || null,
              motherName: req.body.motherName,
              motherCitizenship: req.body.motherCitizenship || null,
              grandfatherName: req.body.grandfatherName,
              spouseName: req.body.spouseName || null,
              spouseCitizenship: req.body.spouseCitizenship || null,
            },
          },
        },
      });
    } else {
      // Create new family details
      application = await prisma.application.update({
        where: { id: req.params.id },
        data: {
          familyDetails: {
            create: {
              fatherName: req.body.fatherName,
              fatherCitizenship: req.body.fatherCitizenship || null,
              motherName: req.body.motherName,
              motherCitizenship: req.body.motherCitizenship || null,
              grandfatherName: req.body.grandfatherName,
              spouseName: req.body.spouseName || null,
              spouseCitizenship: req.body.spouseCitizenship || null,
            },
          },
        },
      });
    }

    return res.redirect(`/application/documents/${req.params.id}`);
  } catch (error) {
    console.error("Error submitting family details:", error);
    return res
      .status(500)
      .send(`Error submitting family details: ${error.message}`);
  }
});
// Documents form route - change from /upload-documents to /documents
router.get("/documents/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        documents: true,
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    res.render("application/documents", {
      user: req.user,
      application,
      currentTab: "documents",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Document upload handling route - Update this to use the imported upload middleware
router.post(
  "/upload-documents/:id",
  isAuthenticated,
  upload.array("documents", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const documentTypes = Array.isArray(req.body.documentTypes)
        ? req.body.documentTypes
        : [req.body.documentTypes];

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const documents = req.files.map((file, index) => ({
        applicationId: id,
        documentType: documentTypes[index] || "OTHER",
        fileName: file.originalname,
        filePath: file.path.replace(/\\/g, "/").replace("public/", "/"),
      }));

      await prisma.document.createMany({
        data: documents,
      });

      res.redirect(`/application/appointment/${id}`);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        message: "Error uploading documents",
        error: error.message,
      });
    }
  }
);
// Appointment scheduling
router.get("/appointment/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    const offices = [
      { id: 1, name: "Kathmandu District Office" },
      { id: 2, name: "Lalitpur District Office" },
      { id: 3, name: "Bhaktapur District Office" },
    ];

    res.render("application/appointment", {
      user: req.user,
      application,
      offices,
      currentPath: req.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Submit appointment
router.post("/appointment/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        appointment: {
          create: {
            officeLocation: req.body.officeLocation,
            appointmentDate: new Date(req.body.appointmentDate),
            appointmentTime: req.body.appointmentTime,
            status: "SCHEDULED",
          },
        },
        status: "SUBMITTED",
      },
    });

    res.redirect(`/application/preview/${application.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Application preview
router.get("/preview/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
        appointment: true,
        documents: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    res.render("application/preview", {
      user: req.user,
      application,
      currentPath: req.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Add this route after your preview route
router.post("/submit/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
        documents: true,
        appointment: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    // Verify all required sections are completed
    if (
      !application.personalInfo ||
      !application.contactDetails ||
      !application.familyDetails ||
      !application.documents?.length ||
      !application.appointment
    ) {
      return res
        .status(400)
        .send("Please complete all sections before submitting");
    }

    // Update application status to SUBMITTED
    const updatedApplication = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    // Redirect to status page
    res.redirect(`/application/status/${updatedApplication.id}`);
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).send("Error submitting application");
  }
});

// Application status
router.get("/status/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
        appointment: true,
        documents: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    res.render("application/status", {
      user: req.user,
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete application
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
        documents: true,
        appointment: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft applications can be deleted",
      });
    }

    // Delete all related records in transaction
    await prisma.$transaction([
      // Delete related records first
      prisma.document.deleteMany({
        where: { applicationId: req.params.id },
      }),
      prisma.appointment.deleteMany({
        where: { applicationId: req.params.id },
      }),
      prisma.familyDetails.deleteMany({
        where: { applicationId: req.params.id },
      }),
      prisma.contactDetails.deleteMany({
        where: { applicationId: req.params.id },
      }),
      prisma.personalInfo.deleteMany({
        where: { applicationId: req.params.id },
      }),
      // Finally delete the application
      prisma.application.delete({
        where: { id: req.params.id },
      }),
    ]);

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update personal info
router.post("/edit/:id/personal-info", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { personalInfo: true },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "DRAFT") {
      return res
        .status(400)
        .json({ message: "Only draft applications can be edited" });
    }

    await prisma.personalInfo.update({
      where: { applicationId: application.id },
      data: {
        firstNameNp: req.body.firstNameNp,
        firstNameEn: req.body.firstNameEn,
        middleNameNp: req.body.middleNameNp || null,
        middleNameEn: req.body.middleNameEn || null,
        lastNameNp: req.body.lastNameNp,
        lastNameEn: req.body.lastNameEn,
        dateOfBirth: new Date(req.body.dateOfBirth),
        birthPlace: req.body.birthPlace,
        citizenshipType: req.body.citizenshipType,
        district: req.body.district,
        gender: req.body.gender,
        maritalStatus: req.body.maritalStatus,
        education: req.body.education,
        profession: req.body.profession,
        caste: req.body.caste,
        religion: req.body.religion,
      },
    });

    res.redirect(`/application/contact-details/${application.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
// Add error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

// Add these routes after your existing routes and before module.exports

// Edit application form
router.get("/edit/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        personalInfo: true,
        contactDetails: true,
        familyDetails: true,
      },
    });

    if (!application || application.applicantId !== req.user.id) {
      return res.status(404).send("Application not found");
    }

    if (application.status !== "DRAFT") {
      return res.redirect(`/application/status/${application.id}`);
    }

    // Pass all the existing data to the view
    return res.render("application/applicant-data", {
      user: req.user,
      application,
      personalInfo: application.personalInfo,
      contactDetails: application.contactDetails,
      familyDetails: application.familyDetails,
      isEditing: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
module.exports = router;
