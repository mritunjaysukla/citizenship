-- CreateEnum
CREATE TYPE "Role" AS ENUM ('APPLICANT', 'ADMIN', 'OFFICER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'APPLICANT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "requestNo" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "firstNameNp" TEXT NOT NULL,
    "firstNameEn" TEXT NOT NULL,
    "middleNameNp" TEXT,
    "middleNameEn" TEXT,
    "lastNameNp" TEXT NOT NULL,
    "lastNameEn" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "citizenshipType" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "education" TEXT,
    "profession" TEXT,
    "caste" TEXT,
    "religion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactDetails" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "permanentAddress" JSONB NOT NULL,
    "temporaryAddress" JSONB,
    "phoneNumber" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyDetails" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "fatherCitizenship" TEXT,
    "motherName" TEXT NOT NULL,
    "motherCitizenship" TEXT,
    "grandfatherName" TEXT NOT NULL,
    "spouseName" TEXT,
    "spouseCitizenship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "officeLocation" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Application_requestNo_key" ON "Application"("requestNo");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo_applicationId_key" ON "PersonalInfo"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactDetails_applicationId_key" ON "ContactDetails"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyDetails_applicationId_key" ON "FamilyDetails"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_applicationId_key" ON "Appointment"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD CONSTRAINT "PersonalInfo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDetails" ADD CONSTRAINT "ContactDetails_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyDetails" ADD CONSTRAINT "FamilyDetails_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
