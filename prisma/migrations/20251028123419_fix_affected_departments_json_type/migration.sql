/*
  Warnings:

  - The `affectedDepartments` column on the `leave_block_lists` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "leave_block_lists" DROP COLUMN "affectedDepartments",
ADD COLUMN     "affectedDepartments" JSONB NOT NULL DEFAULT '[]';
