pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TrantorSBTV2Upgradable is ERC721, ERC721Burnable, Initializable, OwnableUpgradeable {
	using Strings for uint;
	using Counters for Counters.Counter;
	bool private isCanTransfer = false;
	string private _baseTokenURI;
	Counters.Counter private _tokenIdTracker;
	string private baseURI;
	mapping(address => bool) private minters;
	mapping(address => bool) private whiteList;
	mapping(uint256 => uint256) private cids;

	constructor() ERC721("Trantor SBT V2", "TSBT") {
		minters[_msgSender()] = true;
	}

	function initialize() public initializer {
		__Context_init_unchained();
		__Ownable_init_unchained();
	}

	function checkRole() internal {
		if (!minters[_msgSender()]) {
			revert("Only minters can mint");
		}
	}

	function _beforeTokenTransfers(
		address from,
		address to,
		uint256 tokenId
	) internal virtual {
		require(isCanTransfer || from == address(0) || to == address(0), "Transfer is not allowed");
		super._beforeTokenTransfer(from, to, tokenId);
	}


    function _msgSender() internal view override(Context, ContextUpgradeable) returns (address sender) {
        sender = Context._msgSender();
    }

    function _msgData() internal view override(Context, ContextUpgradeable) returns (bytes memory) {
        return Context._msgData();
    }

	function mint(address receiver, uint256 cid) external {
		checkRole();
		uint256 tokenId = _tokenIdTracker.current();
		_tokenIdTracker.increment();
		_mint(receiver, tokenId);
		cids[tokenId] = cid;
	}

	function batchMint(address[] memory receivers, uint256 [] memory campaignIds) external{
		checkRole();
		uint256 mintAmount = receivers.length;
		for (uint256 i = 0; i < mintAmount; i++) {
			uint256 tokenId = _tokenIdTracker.current();
			_tokenIdTracker.increment();
			_mint(receivers[i], tokenId);
			cids[tokenId] = campaignIds[i];
		}
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return _baseTokenURI;
	}

	function setBaseURI(string memory baseUri) external onlyOwner {
		baseURI = baseUri;
	}

	function tokenURI(uint tokenId) public view override returns (string memory) {
		return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
	}

	function grantMintRole(address minter) external onlyOwner {
		minters[minter] = true;
	}

	function setCanTransfer(address owner, bool canTransfer) external onlyOwner {
		whiteList[owner] = canTransfer;
	}

	function revokeMintRole(address minter) external onlyOwner {
		minters[minter] = false;
	}

	function setGuardian(address guardianA, address guardianB) external onlyOwner {}

	function migrateIdentity(address owner, bytes memory signature1, bytes memory signature2) external {}
}
