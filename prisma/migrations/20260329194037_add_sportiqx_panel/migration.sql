-- CreateEnum
CREATE TYPE "public"."PanelRole" AS ENUM ('ADMIN');

-- DropIndex
DROP INDEX "public"."WaitlistEntry_email_idx";

-- CreateTable
CREATE TABLE "public"."sportiqx-panel" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "public"."PanelRole" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sportiqx-panel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sportiqx-panel_email_key" ON "public"."sportiqx-panel"("email");

-- CreateIndex
CREATE INDEX "sportiqx-panel_role_idx" ON "public"."sportiqx-panel"("role");
