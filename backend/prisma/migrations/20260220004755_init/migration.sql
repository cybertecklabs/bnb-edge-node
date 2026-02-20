-- CreateTable
CREATE TABLE "FarmProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clusterId" TEXT,
    "name" TEXT NOT NULL,
    "proxyId" TEXT,
    "fingerprint" TEXT,
    "wallets" TEXT,
    "twitterHandle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "earningsUSD" REAL NOT NULL DEFAULT 0,
    "projectStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FarmProfile_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "Proxy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proxy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'SOCKS5',
    "country" TEXT NOT NULL,
    "city" TEXT,
    "provider" TEXT NOT NULL,
    "trafficUsed" REAL NOT NULL DEFAULT 0,
    "trafficLeft" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "website" TEXT,
    "apiEndpoint" TEXT,
    "contract" TEXT,
    "token" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmProfile_proxyId_key" ON "FarmProfile"("proxyId");

-- CreateIndex
CREATE UNIQUE INDEX "Proxy_endpoint_key" ON "Proxy"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
