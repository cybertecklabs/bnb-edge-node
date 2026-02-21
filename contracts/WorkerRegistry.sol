// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WorkerRegistry is Ownable {
    IERC20 public immutable stakeToken;

    struct Worker {
        address wallet;
        string  capability;  // "gpu" | "storage" | "relay"
        uint256 stake;
        uint256 reputation;  // 0-1000, starts 1000
        bool    active;
    }

    Worker[]                          public workers;
    mapping(address => uint256)       public workerIndex;
    uint256                           public totalStaked;
    uint256                           public totalWorkers;
    uint256 public constant            MIN_STAKE = 10_000_000; // 10 USDC (6 decimals)

    event WorkerRegistered(address indexed worker, string capability, uint256 stake);
    event StakeIncreased(address indexed worker, uint256 additional);
    event WorkerSlashed(address indexed worker, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) {
        stakeToken = IERC20(_usdc);
    }

    function register(string calldata _cap, uint256 _amt) external {
        require(workerIndex[msg.sender] == 0, "Already registered");
        require(_amt >= MIN_STAKE, "Below min stake");
        stakeToken.transferFrom(msg.sender, address(this), _amt);
        workers.push(Worker(msg.sender, _cap, _amt, 1000, true));
        workerIndex[msg.sender] = workers.length;
        totalStaked += _amt;
        totalWorkers++;
        emit WorkerRegistered(msg.sender, _cap, _amt);
    }

    function increaseStake(uint256 _amt) external {
        uint256 idx = workerIndex[msg.sender];
        require(idx > 0, "Not registered");
        stakeToken.transferFrom(msg.sender, address(this), _amt);
        workers[idx - 1].stake += _amt;
        totalStaked += _amt;
        emit StakeIncreased(msg.sender, _amt);
    }

    function slash(address _worker, uint256 _amt) external onlyOwner {
        uint256 idx = workerIndex[_worker];
        require(idx > 0, "Not registered");
        Worker storage w = workers[idx - 1];
        uint256 slashAmt = _amt > w.stake ? w.stake : _amt;
        w.stake -= slashAmt;
        totalStaked -= slashAmt;
        if (w.reputation > 200) w.reputation -= 200;
        emit WorkerSlashed(_worker, slashAmt);
    }

    function getWorkers() external view returns (Worker[] memory) {
        return workers;
    }
}
