// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WorkerRegistry is Ownable {
    IERC20 public immutable stakeToken;
    struct Worker {
        address wallet;
        string capability;
        uint256 stake;
        uint256 reputation;
        bool active;
    }
    
    Worker[] public workers;
    mapping(address => uint256) public workerIndex;
    uint256 public totalStaked;
    uint256 public totalWorkers;
    
    event WorkerRegistered(address indexed worker, string capability, uint256 stake);
    event StakeIncreased(address indexed worker, uint256 amount);
    
    constructor(address _usdc) Ownable(msg.sender) {
        stakeToken = IERC20(_usdc);
    }
    
    function register(string calldata _capability, uint256 _stakeAmount) external {
        require(workerIndex[msg.sender] == 0, "Worker exists");
        stakeToken.transferFrom(msg.sender, address(this), _stakeAmount);
        
        workers.push(Worker({
            wallet: msg.sender,
            capability: _capability,
            stake: _stakeAmount,
            reputation: 1000,
            active: true
        }));
        workerIndex[msg.sender] = workers.length;
        totalStaked += _stakeAmount;
        totalWorkers++;
        emit WorkerRegistered(msg.sender, _capability, _stakeAmount);
    }
    
    function getWorkers() external view returns (Worker[] memory) {
        return workers;
    }
}
