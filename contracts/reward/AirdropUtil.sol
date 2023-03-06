pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract ERC721 is IERC721 {
    function mint(uint256 tokenId, address to) virtual public;
}

contract AirdropUtil is Ownable {
    constructor() {}
    
    function batchSendERC20(address tokenAddress, address[] memory receivers, uint256[] memory amounts) public onlyOwner  {
        IERC20 erc20token = IERC20(tokenAddress);
        uint256 totalUsers = receivers.length;
        for (uint i = 0; i < totalUsers; i++) {
            address receiver = receivers[i];
            uint256 amount = amounts[i];
            erc20token.transfer(receiver, amount);
        }
    }

    function batchSendERC20SameValue(address tokenAddress, address[] memory receivers, uint256 amount) public onlyOwner {
        uint256 totalUsers = receivers.length;
        IERC20 erc20token = IERC20(tokenAddress);
        for (uint i = 0; i < totalUsers; i++) {
            address receiver = receivers[i];
            erc20token.transfer(receiver, amount);
        }
    }

    function batchSendETH(address[] memory addrs, uint256 bnbValue) payable external onlyOwner {
        require(msg.value == addrs.length * bnbValue);
        for (uint256 index = 0; index < addrs.length; index++) {
            payable(addrs[index]).transfer(bnbValue);
        }
    }

    function batchSendERC721(uint256 [] memory tokenIds, address to, address contractAddress) public onlyOwner {
        ERC721 nft = ERC721(contractAddress);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            nft.mint(tokenId, to);
        }
    }

    function batchSendERC1155() public {}

    function withdrawToken(address tokenAddress) public onlyOwner {
		IERC20 erc20Token = IERC20(tokenAddress);
        uint256 tokenBalance = erc20Token.balanceOf(address(this));
        require(tokenBalance > 0, 'Invalid token balance');
        erc20Token.transfer(msg.sender, tokenBalance);
	}
}
