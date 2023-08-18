-- DropForeignKey
ALTER TABLE "MinecraftData" DROP CONSTRAINT "MinecraftData_memberDiscordID_fkey";

-- AddForeignKey
ALTER TABLE "MinecraftData" ADD CONSTRAINT "MinecraftData_memberDiscordID_fkey" FOREIGN KEY ("memberDiscordID") REFERENCES "MCMember"("discordID") ON DELETE CASCADE ON UPDATE CASCADE;
