#!/usr/bin/env node
/**
 * inject-addresses.js
 * Reads deployments_testnet.json and patches the CONTRACTS object in
 * frontend/script.js so the dashboard instantly talks to live contracts.
 *
 * Usage:  node inject-addresses.js
 */
const fs = require('fs');
const path = require('path');

const deploymentsFile = path.join(__dirname, '..', 'deployments_testnet.json');
const scriptFile = path.join(__dirname, '..', 'frontend', 'script.js');

const deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));

if (deployments.WorkerRegistry.startsWith('FILL') || deployments.RewardVault.startsWith('FILL')) {
    console.error('❌ Please fill in the deployed addresses in deployments_testnet.json first!');
    process.exit(1);
}

let script = fs.readFileSync(scriptFile, 'utf8');

script = script.replace(
    /WorkerRegistry:\s*"[^"]*"/,
    `WorkerRegistry: "${deployments.WorkerRegistry}"`
);
script = script.replace(
    /RewardVault:\s*"[^"]*"/,
    `RewardVault: "${deployments.RewardVault}"`
);
script = script.replace(
    /USDC:\s*"[^"]*"/,
    `USDC: "${deployments.usdc}"`
);

fs.writeFileSync(scriptFile, script, 'utf8');

console.log('✅ frontend/script.js patched with live testnet addresses!');
console.log(`   WorkerRegistry → ${deployments.WorkerRegistry}`);
console.log(`   RewardVault    → ${deployments.RewardVault}`);
console.log(`   USDC           → ${deployments.usdc}`);
console.log(`\n🔗 Explorer: ${deployments.explorer}/address/${deployments.WorkerRegistry}`);
