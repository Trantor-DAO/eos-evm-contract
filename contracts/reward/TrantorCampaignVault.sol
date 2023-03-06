pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TrantorCampaignVault is Initializable, OwnableUpgradeable {
	mapping(uint256 => mapping(address => bool)) private rewardInfo;
	mapping (address => bool) admin;
	mapping (uint256 => mapping (address => uint256)) balances;

	function initialize() public initializer {
		__Context_init_unchained();
		__Ownable_init_unchained();
	}

	event Deposit(uint256 indexed campaignId, address indexed owner, uint256 value, address tokenAddress);
	event CampaignRewardClaimed(uint256 indexed campaignId, uint256 indexed rewardIndex, uint256 value, address indexed receiver);
	event CampaignRewardBatchClaimed(uint256 indexed campaignId, uint256 indexed rewardIndex, uint256 value, address[] indexed receiver);
	event Refund(address indexed owner, address indexed tokenAddress, uint256 indexed amount);

	function getBalance(uint256 campaignId, address tokenAddress) public view returns (uint256) {
		return balances[campaignId][tokenAddress];
	}

	function grantRole(address _admin) public onlyOwner {
		admin[_admin] = true;
	}

	function revokeRole(address _admin) public onlyOwner {
		admin[_admin] = false;
	}

	function deposit(address tokenAddress, uint256 amount, uint256 campaignId) external {
		IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
		balances[campaignId][tokenAddress] += amount;
		emit Deposit(campaignId, msg.sender, amount, tokenAddress);
	}

	function claimReward(address tokenAddress, uint256 campaignId, uint256 amount, uint256 rewardIndex, address receiver) external {
		require(admin[msg.sender], "Trantor: No role to claim reward");
		uint256 balance = balances[campaignId][tokenAddress];
		require(balance >= amount, 'Trantor: Balance not enough');
		require(!rewardInfo[campaignId][msg.sender], 'Trantor: Already claimed');
		rewardInfo[campaignId][msg.sender] = true;
		balances[campaignId][tokenAddress] -= amount;
		IERC20(tokenAddress).transfer(receiver, amount);
		emit CampaignRewardClaimed(campaignId, rewardIndex, amount, receiver);
	}

	function batchClaimReward(address tokenAddress, uint256 campaignId, uint256 amount, uint256 rewardIndex, address[] memory receivers) external {
		require(admin[msg.sender], "Trantor: No role to claim reward");
		uint256 balance = balances[campaignId][tokenAddress];
		require(balance >= amount * receivers.length, 'Trantor: Balance not enough');
		for (uint256 index = 0; index < receivers.length; index++) {
			address receiver = receivers[index];
			require(!rewardInfo[campaignId][receiver], 'Trantor: Already claimed');
			rewardInfo[campaignId][receiver] = true;
			balances[campaignId][tokenAddress] -= amount;
			IERC20(tokenAddress).transfer(receivers[index], amount);
		}
		emit CampaignRewardBatchClaimed(campaignId, rewardIndex, amount, receivers);
	}

	function refund(address tokenAddress, uint256 campaignId, address receiver, uint256 amount) external {
		require(admin[msg.sender], "Trantor: No role to refund");
		require(balances[campaignId][tokenAddress] >= amount, 'Trantor: Balance not enough');
		balances[campaignId][tokenAddress] -= amount;
		IERC20(tokenAddress).transfer(receiver, amount);
		emit Refund(receiver, tokenAddress, amount);
	}

	function withdraw(address tokenAddress, uint256 amount) external onlyOwner {
		IERC20(tokenAddress).transfer(msg.sender, amount);
	}

	function setDepositValue(address tokenAddress, uint256 amount, uint256 campaignId) external onlyOwner {
		balances[campaignId][tokenAddress] = amount;
	}
}
