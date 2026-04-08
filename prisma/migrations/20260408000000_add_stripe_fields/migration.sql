-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_stripeCustomerId_key" ON "organizations"("stripeCustomerId");
