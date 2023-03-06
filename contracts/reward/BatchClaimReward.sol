pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICampaignReward {
    function claimReward(address tokenAddress, uint256 campaignId, uint256 amount, address receiver) external;
}

interface ITrantorSBT {
    function mint(address receiver) external;
}

contract BatchClaimReward is Ownable {
    ICampaignReward campaignReward;
    ITrantorSBT trantorSBT;

	  event ClaimReward(address indexed receiver, uint256 indexed campaignId, address indexed tokenAddress, uint256 amount);

    function setCampaignRewardAddress(address contractAddress) external onlyOwner {
        campaignReward = ICampaignReward(contractAddress);
    }

    function setTrantorSBTdAddress(address contractAddress) external onlyOwner {
        trantorSBT = ITrantorSBT(contractAddress);
    }

    function claimTokenAndSBTReward(address receiver, uint256 campaignId, address tokenAddress, uint256 amount) external onlyOwner {
//        campaignReward.claimReward(tokenAddress, campaignId, amount, receiver);
        trantorSBT.mint(receiver);
				emit ClaimReward(receiver, campaignId, tokenAddress, amount);
    }
}
