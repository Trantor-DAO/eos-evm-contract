pragma solidity ^0.8.0;
import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

contract TrantorSoulboundToken is ERC721AUpgradeable, OwnableUpgradeable {
	bool private isCanTransfer;
	string private baseURI;
	mapping(address => bool) private minters;
	mapping(uint256 => mapping(address => bool)) private mintInfo;

	event CampaignRewardClaimed(address indexed receiver, uint256 indexed campaignId, uint256 indexed rewardIndex, uint256 value);

	function initialize() initializerERC721A initializer public {
		__ERC721A_init('Trantor Soulbound token', 'TST');
		__Ownable_init();
		isCanTransfer = false;
		minters[_msgSender()] = true;
	}

	function grantMintRole(address minter) external onlyOwner {
		minters[minter] = true;
	}

	function revokeMintRole(address minter) external onlyOwner {
		minters[minter] = false;
	}

	function setGlobalTransfer(bool canTransfer) external onlyOwner {
		isCanTransfer = canTransfer;
	}

	function mint(address receiver) external {
		require(minters[_msgSender()], "Trantor: Only minters can mint");
		_mint(receiver, 1);
	}

	function mintForCampaign(address receiver, uint256 campaignId, uint256 rewardIndex) external {
		require(minters[_msgSender()], "Trantor: Only minters can mint");
		require(!mintInfo[campaignId][receiver], "Trantor: Already minted");
		mintInfo[campaignId][receiver] = true;
		uint256 mintedTokenId = _nextTokenId();
		_mint(receiver, 1);
		emit CampaignRewardClaimed(receiver, campaignId, rewardIndex, mintedTokenId);
	}

	function batchMintForCampaign(address[] memory receivers, uint256 campaignId, uint256 rewardIndex) external {
		require(minters[_msgSender()], "Trantor: Only minters can mint");
		uint256 mintedTokenId = _nextTokenId();
		for (uint256 index = 0; index < receivers.length; index++) {
			address receiver = receivers[index];
			if (mintInfo[campaignId][receiver]) {
				revert('Trantor: Already minted');
			}
			mintInfo[campaignId][receiver] = true;
			_mint(receiver, 1);
			emit CampaignRewardClaimed(receiver, campaignId, rewardIndex, mintedTokenId);
		}
	}

	function _beforeTokenTransfers(
		address from,
		address to,
		uint256 startTokenId,
		uint256 quantity
	) internal virtual override {
		require(isCanTransfer || from == address(0) || to == address(0), "Trantor: Transfer is not allowed");
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return baseURI;
	}

	function setBaseURI(string memory baseUri) external onlyOwner {
		baseURI = baseUri;
	}

	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		string memory currentBaseURI = _baseURI();
		return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, _toString(tokenId))) : "";
	}

	function batchQueryMintInfo(uint256 campaignId, address[] memory receivers) external view returns(bool[] memory) {
		bool[] memory result = new bool[](receivers.length);
		for (uint256 index = 0; index < receivers.length; index++) {
			result[index] = mintInfo[campaignId][receivers[index]];
		}
		return result;
	}
}
