/*
  Warnings:

  - You are about to alter the column `amount` on the `RecurringRule` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "RecurringRule" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "MonthSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "totalIncome" DECIMAL(12,2) NOT NULL,
    "totalExpenses" DECIMAL(12,2) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "healthLevel" TEXT NOT NULL,
    "healthAlerts" JSONB NOT NULL,
    "budgetByCategory" JSONB NOT NULL,
    "recalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthSummary_userId_referenceMonth_idx" ON "MonthSummary"("userId", "referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "MonthSummary_userId_referenceMonth_key" ON "MonthSummary"("userId", "referenceMonth");

-- AddForeignKey
ALTER TABLE "MonthSummary" ADD CONSTRAINT "MonthSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
