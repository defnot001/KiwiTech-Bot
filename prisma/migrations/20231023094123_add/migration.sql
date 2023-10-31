-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "discordID" TEXT NOT NULL,
    "minecraftID" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
