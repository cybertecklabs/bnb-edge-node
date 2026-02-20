/*
  Warnings:

  - You are about to drop the column `projectStatus` on the `FarmProfile` table. All the data in the column will be lost.
  - You are about to drop the column `twitterHandle` on the `FarmProfile` table. All the data in the column will be lost.
  - Made the column `clusterId` on table `FarmProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ownerId` to the `Proxy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "nonce" TEXT,
    "roles" TEXT NOT NULL DEFAULT '["CLIENT"]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stake" REAL NOT NULL DEFAULT 0,
    "reputation" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Node_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cluster_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmProfileId" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "Session_farmProfileId_fkey" FOREIGN KEY ("farmProfileId") REFERENCES "FarmProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmProfileId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfitLog_farmProfileId_fkey" FOREIGN KEY ("farmProfileId") REFERENCES "FarmProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FarmProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clusterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proxyId" TEXT,
    "fingerprint" TEXT,
    "wallets" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "earningsUSD" REAL NOT NULL DEFAULT 0,
    "projects" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FarmProfile_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FarmProfile_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "Proxy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FarmProfile" ("clusterId", "createdAt", "earningsUSD", "fingerprint", "id", "name", "proxyId", "status", "updatedAt", "wallets") SELECT "clusterId", "createdAt", "earningsUSD", "fingerprint", "id", "name", "proxyId", "status", "updatedAt", "wallets" FROM "FarmProfile";
DROP TABLE "FarmProfile";
ALTER TABLE "new_FarmProfile" RENAME TO "FarmProfile";
CREATE UNIQUE INDEX "FarmProfile_proxyId_key" ON "FarmProfile"("proxyId");
CREATE TABLE "new_Proxy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'SOCKS5',
    "country" TEXT NOT NULL,
    "city" TEXT,
    "provider" TEXT NOT NULL,
    "trafficUsed" REAL NOT NULL DEFAULT 0,
    "trafficLeft" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ownerId" TEXT NOT NULL,
    "assignedProfileId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proxy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Proxy" ("city", "country", "createdAt", "endpoint", "id", "protocol", "provider", "status", "trafficLeft", "trafficUsed", "updatedAt") SELECT "city", "country", "createdAt", "endpoint", "id", "protocol", "provider", "status", "trafficLeft", "trafficUsed", "updatedAt" FROM "Proxy";
DROP TABLE "Proxy";
ALTER TABLE "new_Proxy" RENAME TO "Proxy";
CREATE UNIQUE INDEX "Proxy_endpoint_key" ON "Proxy"("endpoint");
CREATE UNIQUE INDEX "Proxy_assignedProfileId_key" ON "Proxy"("assignedProfileId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Node_address_key" ON "Node"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");
