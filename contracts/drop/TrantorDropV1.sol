pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TrantorDropV1 is ERC721, Ownable {
	using Strings for uint;
	using Counters for Counters.Counter;
	bool private isCanTransfer = false;
	string private _baseTokenURI;
	Counters.Counter private _tokenIdTracker;
	string private baseURI;
	mapping(address => bool) private minters;
	mapping(address => bool) private whiteList;

	constructor() ERC721("Trantor SBT V1", "TSBT") {
		minters[_msgSender()] = true;
	}

	function mint(address receiver, uint256 cid) external {
		require(minters[_msgSender()], "Trantor: Only minters can mint");
		uint256 tokenid = _tokenIdTracker.current();
		_tokenIdTracker.increment();
		_mint(receiver, tokenid);
	}


	function _baseURI() internal view virtual override returns (string memory) {
		return _baseTokenURI;
	}

	function setBaseURI(string memory baseUri) external onlyOwner {
		baseURI = baseUri;
	}

	function tokenURI(uint tokenId) public view virtual override returns (string memory) {
		return string(abi.encodePacked(baseURI, tokenId.toString()));
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
}
