/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `status` on the `Cluster` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FarmProfile` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `ProfitLog` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `ProfitLog` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `ProfitLog` table. All the data in the column will be lost.
  - You are about to drop the column `assignedProfileId` on the `Proxy` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Session` table. All the data in the column will be lost.
  - Added the required column `lastSeen` to the `FarmProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `FarmProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newProject` to the `ProfitLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldProject` to the `ProfitLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitGain` to the `ProfitLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerGB` to the `Proxy` table without a default value. This is not possible if the table is not empty.
  - Made the column `city` on table `Proxy` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Project_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Project";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" INTEGER NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "nodeId" TEXT,
    "taskCID" TEXT NOT NULL,
    "resultCID" TEXT,
    "payment" REAL NOT NULL,
    "minRep" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "txHash" TEXT,
    CONSTRAINT "Job_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OptimizerSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "autoOptimize" BOOLEAN NOT NULL DEFAULT true,
    "switchThreshold" REAL NOT NULL DEFAULT 15,
    "includedProjects" TEXT NOT NULL DEFAULT 'Grass,Dawn,Nodepay',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cluster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalStake" REAL NOT NULL DEFAULT 0,
    "uptime" REAL NOT NULL DEFAULT 0,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cluster_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cluster" ("createdAt", "id", "location", "name", "ownerId", "updatedAt") SELECT "createdAt", "id", "location", "name", "ownerId", "updatedAt" FROM "Cluster";
DROP TABLE "Cluster";
ALTER TABLE "new_Cluster" RENAME TO "Cluster";
CREATE TABLE "new_FarmProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clusterId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proxyId" TEXT,
    "fingerprint" TEXT NOT NULL DEFAULT '{}',
    "wallets" TEXT NOT NULL DEFAULT '[]',
    "projects" TEXT NOT NULL DEFAULT 'Grass',
    "status" TEXT NOT NULL DEFAULT 'paused',
    "earningsUSD" REAL NOT NULL DEFAULT 0,
    "uptime" REAL NOT NULL DEFAULT 0,
    "lastSeen" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FarmProfile_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FarmProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FarmProfile_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "Proxy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FarmProfile" ("clusterId", "createdAt", "earningsUSD", "fingerprint", "id", "name", "projects", "proxyId", "status", "wallets") SELECT "clusterId", "createdAt", "earningsUSD", coalesce("fingerprint", '{}') AS "fingerprint", "id", "name", "projects", "proxyId", "status", coalesce("wallets", '[]') AS "wallets" FROM "FarmProfile";
DROP TABLE "FarmProfile";
ALTER TABLE "new_FarmProfile" RENAME TO "FarmProfile";
CREATE UNIQUE INDEX "FarmProfile_proxyId_key" ON "FarmProfile"("proxyId");
CREATE TABLE "new_Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stake" REAL NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 50,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Node_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Node" ("address", "createdAt", "id", "ownerId", "reputation", "stake", "status", "type", "updatedAt") SELECT "address", "createdAt", "id", "ownerId", "reputation", "stake", "status", "type", "updatedAt" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
CREATE UNIQUE INDEX "Node_address_key" ON "Node"("address");
CREATE TABLE "new_ProfitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmProfileId" TEXT NOT NULL,
    "oldProject" TEXT NOT NULL,
    "newProject" TEXT NOT NULL,
    "profitGain" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfitLog_farmProfileId_fkey" FOREIGN KEY ("farmProfileId") REFERENCES "FarmProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProfitLog" ("farmProfileId", "id") SELECT "farmProfileId", "id" FROM "ProfitLog";
DROP TABLE "ProfitLog";
ALTER TABLE "new_ProfitLog" RENAME TO "ProfitLog";
CREATE TABLE "new_Proxy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "clusterId" TEXT,
    "endpoint" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "trafficUsed" REAL NOT NULL DEFAULT 0,
    "trafficLeft" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "pricePerGB" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proxy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proxy_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Proxy" ("city", "country", "createdAt", "endpoint", "id", "ownerId", "protocol", "provider", "status", "trafficLeft", "trafficUsed", "updatedAt") SELECT "city", "country", "createdAt", "endpoint", "id", "ownerId", "protocol", "provider", "status", "trafficLeft", "trafficUsed", "updatedAt" FROM "Proxy";
DROP TABLE "Proxy";
ALTER TABLE "new_Proxy" RENAME TO "Proxy";
CREATE UNIQUE INDEX "Proxy_endpoint_key" ON "Proxy"("endpoint");
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmProfileId" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pid" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "earnings" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Session_farmProfileId_fkey" FOREIGN KEY ("farmProfileId") REFERENCES "FarmProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("farmProfileId", "id", "project", "sessionId") SELECT "farmProfileId", "id", "project", "sessionId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "nonce" TEXT,
    "roles" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("address", "createdAt", "id", "nonce", "roles", "updatedAt") SELECT "address", "createdAt", "id", "nonce", "roles", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobId_key" ON "Job"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "OptimizerSettings_ownerId_key" ON "OptimizerSettings"("ownerId");
