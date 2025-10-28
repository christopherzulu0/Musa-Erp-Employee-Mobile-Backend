-- AlterTable
ALTER TABLE "leave_block_lists" ADD COLUMN     "affectedDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "blockType" TEXT NOT NULL DEFAULT 'complete',
ADD COLUMN     "description" TEXT;
