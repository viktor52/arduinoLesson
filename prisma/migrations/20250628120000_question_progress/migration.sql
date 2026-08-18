-- CreateTable
CREATE TABLE "question_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_progress_userId_idx" ON "question_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "question_progress_userId_questionId_key" ON "question_progress"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "question_progress" ADD CONSTRAINT "question_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
