# BNB Edge DePIN Node OS — Backend

Production-ready Express.js + Prisma + Socket.io backend for the BNB Edge DePIN platform on opBNB.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Sign-In With Ethereum (SIWE) + JWT
- **Blockchain**: ethers.js v6 (opBNB / Chain 204)
- **Realtime**: Socket.io WebSockets
- **Validation**: Joi
- **Logging**: Winston

## API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/auth/nonce` | Public | Get SIWE nonce |
| POST | `/api/auth/verify` | Public | Verify SIWE signature → JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/nodes` | PROVIDER | List my nodes |
| GET | `/api/nodes/all` | JWT | All network nodes |
| POST | `/api/nodes/register` | PROVIDER | Register node on-chain |
| POST | `/api/nodes/heartbeat` | PROVIDER | Send heartbeat |
| DELETE | `/api/nodes/:id` | PROVIDER | Deregister node |
| GET | `/api/jobs` | JWT | List jobs (filterable) |
| POST | `/api/jobs` | JWT | Create job |
| POST | `/api/jobs/:id/accept` | PROVIDER | Accept job |
| POST | `/api/jobs/:id/submit` | PROVIDER | Submit result |
| GET | `/api/jobs/activity` | JWT | Activity log |
| GET | `/api/farm/profiles` | PROVIDER | List farm profiles |
| POST | `/api/farm/profiles` | PROVIDER | Create profile |
| POST | `/api/farm/profiles/:id/launch` | PROVIDER | Launch profile |
| POST | `/api/farm/profiles/:id/stop` | PROVIDER | Stop profile |
| GET | `/api/farm/earnings` | PROVIDER | Earnings summary |
| GET | `/api/proxies` | PROVIDER | List proxies |
| POST | `/api/proxies/add` | PROVIDER | Add proxy manually |
| POST | `/api/proxies/assign` | PROVIDER | Assign proxy to profile |
| POST | `/api/proxies/buy` | PROVIDER | Buy traffic (mock) |
| GET | `/api/clusters` | PROVIDER | List clusters + VMs |
| POST | `/api/clusters` | PROVIDER | Create cluster |
| POST | `/api/clusters/start-vm` | PROVIDER | Start VM |
| POST | `/api/clusters/stop-vm` | PROVIDER | Stop VM |
| GET | `/api/optimizer/profit-rates` | PROVIDER | Live profit rates |
| POST | `/api/optimizer/save-settings` | PROVIDER | Save + apply settings |
| GET | `/api/optimizer/log` | PROVIDER | Switch history |
| GET | `/health` | Public | Health check |

## WebSocket Events

| Event (server→client) | Payload |
|----------------------|---------|
| `node-registered` | `{ node, nodeType, stake }` |
| `stake-increased` | `{ node, additional }` |
| `stake-slashed` | `{ node, amount, reason }` |
| `node-deregistered` | `{ node, refund }` |
| `job-created` | `{ job }` |
| `job-assigned` | `{ jobId, node }` |
| `job-completed` | `{ jobId, resultCID }` |

## Setup

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, OPBNB_RPC, contract addresses, PRIVATE_KEY

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Seed sample data
npm run db:seed

# 6. Start dev server
npm run dev
```

## Testing

```bash
npm test
```

Tests use Jest + Supertest with Prisma and blockchain mocked. No real DB or RPC needed.

## Deployment (Render / Heroku / Railway)

1. Set all env vars in your hosting dashboard
2. Set build command: `npm install && npm run db:generate && npm run db:deploy`
3. Set start command: `npm start`
4. Provision a PostgreSQL addon and set `DATABASE_URL`

## opBNB Specifics
- Chain ID: **204** (mainnet), **5611** (testnet)
- RPC: `https://opbnb-mainnet-rpc.bnbchain.org`
- Gas: ~$0.001 per tx, 470K TPS, 0.45s finality
- Min stake GPU node: 0.05 BNB
- Platform fee: 4% (400 basis points)
