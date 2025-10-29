-- DropForeignKey
ALTER TABLE "public"."shift_assignments" DROP CONSTRAINT "shift_assignments_shiftId_fkey";

-- AlterTable
ALTER TABLE "shift_assignments" ADD COLUMN     "shiftTypeId" TEXT,
ALTER COLUMN "shiftId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shiftTypeId_fkey" FOREIGN KEY ("shiftTypeId") REFERENCES "shift_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
