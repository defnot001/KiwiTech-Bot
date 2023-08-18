-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MCMember" (
    "discordID" TEXT NOT NULL,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trialMember" BOOLEAN NOT NULL,

    CONSTRAINT "MCMember_pkey" PRIMARY KEY ("discordID")
);

-- CreateTable
CREATE TABLE "MinecraftData" (
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "memberDiscordID" TEXT NOT NULL,

    CONSTRAINT "MinecraftData_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "MinecraftData" ADD CONSTRAINT "MinecraftData_memberDiscordID_fkey" FOREIGN KEY ("memberDiscordID") REFERENCES "MCMember"("discordID") ON DELETE RESTRICT ON UPDATE CASCADE;
