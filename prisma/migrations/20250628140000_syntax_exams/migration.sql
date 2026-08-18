-- CreateTable
CREATE TABLE "syntax_exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questionIds" TEXT[],
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "syntax_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syntax_exam_assignments" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "syntax_exam_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syntax_exam_answers" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "syntax_exam_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "syntax_exams_createdById_idx" ON "syntax_exams"("createdById");

-- CreateIndex
CREATE INDEX "syntax_exam_assignments_userId_idx" ON "syntax_exam_assignments"("userId");

-- CreateIndex
CREATE INDEX "syntax_exam_assignments_examId_idx" ON "syntax_exam_assignments"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "syntax_exam_assignments_examId_userId_key" ON "syntax_exam_assignments"("examId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "syntax_exam_answers_assignmentId_questionId_key" ON "syntax_exam_answers"("assignmentId", "questionId");

-- AddForeignKey
ALTER TABLE "syntax_exam_assignments" ADD CONSTRAINT "syntax_exam_assignments_examId_fkey" FOREIGN KEY ("examId") REFERENCES "syntax_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syntax_exam_assignments" ADD CONSTRAINT "syntax_exam_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syntax_exam_answers" ADD CONSTRAINT "syntax_exam_answers_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "syntax_exam_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
