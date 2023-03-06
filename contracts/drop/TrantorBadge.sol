pragma solidity ^0.8.0;
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TrantorBadge is ERC721A, Ownable, EIP712, ERC721AQueryable {
	string private constant SIGNING_DOMAIN = "TrantorBadge";
	string private constant SIGNATURE_VERSION = "1";
	address private cSigner;

	constructor() ERC721A("TrantorBadgeToken", "TBT") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
		cSigner = 0x9B4dAd2121FeAacCC207e829C5e2Dd1C6b076Ef9;
	}

	string private baseURI;
	mapping(address => bool) private minters;
	mapping(address => mapping(uint256 => bool)) private hasMinted;
	mapping(uint256 => uint256) private carnival;

	struct ClaimCallData {
		address owner;
		uint256 carnivalId;
		bytes signature;
	}

	struct BadgeInfo {
		uint256 tokenId;
		uint256 carnivalId;
	}

	event CarnivalBadgeClaimed(address indexed receiver, uint256 indexed carnivalId, uint256 indexed tokenId);

	function isClaimable(address receiver, uint256 carnivalId) external view returns(bool) {
		return !hasMinted[receiver][carnivalId];
	}

	function getCarnivalId(uint256 tokenId) external view returns(uint256) {
		return carnival[tokenId];
	}

	function claim(ClaimCallData calldata data) external {
		require(data.owner == msg.sender, 'Invalid caller');
		require(_verify(data), 'Invalid signature');
		require(!hasMinted[msg.sender][data.carnivalId], 'Already minted');
		uint256 mintedTokenId = _nextTokenId();
		hasMinted[msg.sender][data.carnivalId] = true;
		_mint(msg.sender, 1);
		carnival[mintedTokenId] = data.carnivalId;
		emit CarnivalBadgeClaimed(msg.sender, data.carnivalId, mintedTokenId);
	}

	function getChainID() external view returns (uint256) {
		uint256 id;
		assembly {
			id := chainid()
		}
		return id;
	}

	function getSigner() external view returns(address) {
		return cSigner;
	}

	function _hashClaimCallData(ClaimCallData calldata data) internal view returns (bytes32) {
		return _hashTypedDataV4(keccak256(abi.encode(
				keccak256("ClaimCallData(address owner,uint256 carnivalId)"),
				data.owner,
				data.carnivalId
			)));
	}

	function _verify(ClaimCallData calldata data) internal view returns(bool){
		return ECDSA.recover(_hashClaimCallData(data), data.signature) == cSigner;
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return baseURI;
	}

	function setBaseURI(string memory baseUri) external onlyOwner {
		baseURI = baseUri;
	}

	function setSigner(address _signer) external onlyOwner {
		cSigner = _signer;
	}

	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		string memory currentBaseURI = _baseURI();
		return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, _toString(tokenId))) : "";
	}

	function getUserAllBadges(address user) public view returns(BadgeInfo[] memory) {
		uint256[] memory tokenIds = this.tokensOfOwner(user);
		BadgeInfo[] memory badges = new BadgeInfo[](tokenIds.length);
		for (uint256 index = 0; index < tokenIds.length; index++) {
			badges[index] = BadgeInfo(tokenIds[index], carnival[tokenIds[index]]);
		}
		return badges;
	}

	function getUserBadgesIn(address user, uint256 start, uint256 stop) public view returns(BadgeInfo[] memory) {
		uint256[] memory tokenIds = this.tokensOfOwnerIn(user, start, stop);
		BadgeInfo[] memory badges = new BadgeInfo[](tokenIds.length);
		for (uint256 index = 0; index < tokenIds.length; index++) {
			badges[index] = BadgeInfo(tokenIds[index], carnival[tokenIds[index]]);
		}
		return badges;
	}
}
