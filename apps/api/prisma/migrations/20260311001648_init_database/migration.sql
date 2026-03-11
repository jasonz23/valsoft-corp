-- CreateEnum
CREATE TYPE "AiCategory" AS ENUM ('BUG_REPORT', 'FEATURE_REQUEST', 'BILLING_QUESTION', 'GENERAL_QUESTION');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailResponseStatus" AS ENUM ('FOR_APPROVAL', 'APPROVED', 'SENT');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'FOR_APPROVAL', 'BLOCKED', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingEmail" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "receivedTimestamp" TIMESTAMP(3) NOT NULL,
    "aiCategory" "AiCategory",
    "replyDraft" TEXT,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "processingError" TEXT,
    "processedAt" TIMESTAMP(3),
    "promptVersion" TEXT,
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomingEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailResponse" (
    "id" TEXT NOT NULL,
    "incomingEmailId" TEXT NOT NULL,
    "status" "EmailResponseStatus" NOT NULL DEFAULT 'FOR_APPROVAL',
    "draft" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "incomingEmailId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailResponseNote" (
    "id" TEXT NOT NULL,
    "emailResponseId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailResponseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueNote" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IncomingEmail_messageId_key" ON "IncomingEmail"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailResponse_incomingEmailId_key" ON "EmailResponse"("incomingEmailId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_incomingEmailId_key" ON "Issue"("incomingEmailId");

-- AddForeignKey
ALTER TABLE "EmailResponse" ADD CONSTRAINT "EmailResponse_incomingEmailId_fkey" FOREIGN KEY ("incomingEmailId") REFERENCES "IncomingEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailResponse" ADD CONSTRAINT "EmailResponse_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_incomingEmailId_fkey" FOREIGN KEY ("incomingEmailId") REFERENCES "IncomingEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailResponseNote" ADD CONSTRAINT "EmailResponseNote_emailResponseId_fkey" FOREIGN KEY ("emailResponseId") REFERENCES "EmailResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailResponseNote" ADD CONSTRAINT "EmailResponseNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueNote" ADD CONSTRAINT "IssueNote_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueNote" ADD CONSTRAINT "IssueNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
