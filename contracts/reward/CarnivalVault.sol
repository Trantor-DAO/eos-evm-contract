pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CarnivalVault is Ownable {
	mapping(address => mapping(uint256 => bool)) rewardUsers;
	constructor() {}

	function sendSingleERC20Reward(uint256 carnivalId, address receiver, address tokenAddress, uint256 amount) external onlyOwner {
		IERC20 erc20 = IERC20(tokenAddress);
		erc20.transferFrom(msg.sender, address(this), amount);
		require(rewardUsers[receiver][carnivalId] == false, 'CarnivalVault: Repeat call');
		rewardUsers[receiver][carnivalId] = true;
		erc20.transfer(receiver, amount);
	}

	function sendBatchERC20Reward(uint256 carnivalId, address[] memory receivers, address tokenAddress, uint256[] memory amounts, uint256 totalAmount) external onlyOwner {
		IERC20 erc20 = IERC20(tokenAddress);
		erc20.transferFrom(msg.sender, address(this), totalAmount);
		uint256 totalUsers = receivers.length;
		for (uint i = 0; i < totalUsers; i++) {
			address receiver = receivers[i];
			if (!rewardUsers[receiver][carnivalId]) {
				rewardUsers[receiver][carnivalId] = true;
				address receiver = receivers[i];
				uint256 amount = amounts[i];
				erc20.transfer(receiver, amount);
			}
		}
	}

	function sendBatchERC20SameValue(uint256 carnivalId, address[] memory receivers, address tokenAddress, uint256 amount, uint256 totalAmount) external onlyOwner {
		IERC20 erc20 = IERC20(tokenAddress);
		erc20.transferFrom(msg.sender, address(this), totalAmount);
		uint256 totalUsers = receivers.length;
		for (uint i = 0; i < totalUsers; i++) {
			address receiver = receivers[i];
			if (!rewardUsers[receiver][carnivalId]) {
				rewardUsers[receiver][carnivalId] = true;
				erc20.transfer(receiver, amount);
			}
		}
	}

	function batchSendETH(address[] memory addrs, uint256 value) payable external onlyOwner {
		require(msg.value == addrs.length * value);
		for (uint256 index = 0; index < addrs.length; index++) {
			payable(addrs[index]).transfer(value);
		}
	}

	function withdrawToken(address tokenAddress) external onlyOwner {
		IERC20 erc20Token = IERC20(tokenAddress);
		uint256 tokenBalance = erc20Token.balanceOf(address(this));
		require(tokenBalance > 0, 'Invalid token balance');
		erc20Token.transfer(msg.sender, tokenBalance);
	}
}
