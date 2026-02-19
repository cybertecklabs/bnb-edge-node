"""Blockchain Interface — Web3.py for opBNB"""
import json, logging, time
logger = logging.getLogger(__name__)

NR_ABI = json.loads('[{"inputs":[],"name":"getAllNodes","outputs":[{"type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"operator","type":"address"}],"name":"getNode","outputs":[{"components":[{"name":"operator","type":"address"},{"name":"nodeType","type":"uint8"},{"name":"status","type":"uint8"},{"name":"stakedAmount","type":"uint256"},{"name":"registeredAt","type":"uint256"},{"name":"jobsCompleted","type":"uint256"},{"name":"jobsFailed","type":"uint256"},{"name":"totalUptime","type":"uint256"},{"name":"lastHeartbeat","type":"uint256"},{"name":"metadataURI","type":"string"},{"name":"reputationScore","type":"uint256"}],"type":"tuple"}],"stateMutability":"view","type":"function"}]')
RO_ABI = json.loads('[{"inputs":[{"name":"_nodes","type":"address[]"}],"name":"batchUpdateScores","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"failingNode","type":"address"},{"name":"affectedJobs","type":"uint256"}],"name":"signalReassignment","outputs":[],"stateMutability":"nonpayable","type":"function"}]')

class ChainInterface:
    def __init__(self, rpc, nr_addr, ro_addr, key):
        from web3 import Web3
        self.w3 = Web3(Web3.HTTPProvider(rpc))
        self.account = self.w3.eth.account.from_key(key)
        self.nr = self.w3.eth.contract(address=Web3.to_checksum_address(nr_addr), abi=NR_ABI)
        self.ro = self.w3.eth.contract(address=Web3.to_checksum_address(ro_addr), abi=RO_ABI) if ro_addr else None
        logger.info(f"🔗 Connected: {rpc}")

    def get_all_nodes(self):
        return [self.get_node(a) for a in self.nr.functions.getAllNodes().call()]

    def get_node(self, addr):
        from web3 import Web3
        n = self.nr.functions.getNode(Web3.to_checksum_address(addr)).call()
        return {"address":addr,"node_type":["GPU","STORAGE"][n[1]],"status":["INACTIVE","ACTIVE","SLASHED"][n[2]],
                "staked_amount":float(self.w3.from_wei(n[3],"ether")),"registered_at":n[4],"jobs_completed":n[5],
                "jobs_failed":n[6],"total_uptime":n[7],"last_heartbeat":n[8],"reputation_score":n[10]}

    def get_active_nodes(self):
        return [a for a in self.nr.functions.getAllNodes().call() if self.get_node(a).get("status") == "ACTIVE"]

    def submit_batch_scores(self, addrs, scores):
        if not self.ro: return
        from web3 import Web3
        tx = self.ro.functions.batchUpdateScores([Web3.to_checksum_address(a) for a in addrs]).build_transaction(
            {"from":self.account.address,"nonce":self.w3.eth.get_transaction_count(self.account.address),"gas":500000,"gasPrice":self.w3.eth.gas_price})
        signed = self.w3.eth.account.sign_transaction(tx, self.account.key)
        return self.w3.eth.send_raw_transaction(signed.raw_transaction)

    def signal_reassignment(self, node, jobs):
        if not self.ro: return
        from web3 import Web3
        tx = self.ro.functions.signalReassignment(Web3.to_checksum_address(node), jobs).build_transaction(
            {"from":self.account.address,"nonce":self.w3.eth.get_transaction_count(self.account.address),"gas":200000,"gasPrice":self.w3.eth.gas_price})
        signed = self.w3.eth.account.sign_transaction(tx, self.account.key)
        self.w3.eth.send_raw_transaction(signed.raw_transaction)
