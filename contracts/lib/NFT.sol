pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract NFT is ERC721A, Ownable {
		constructor() ERC721A("NFT", "NFT") {}

		string private _baseTokenURI;

		function _baseURI() internal view virtual override returns (string memory) {
			return _baseTokenURI;
		}

		function setBaseURI(string calldata baseURI) external onlyOwner {
			_baseTokenURI = baseURI;
		}
		function mint() public {
			_mint(msg.sender, 1);
		}

		function mintForOthers(address addr) public {
			_mint(addr, 1);
		}
}
