-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
