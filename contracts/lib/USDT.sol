pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract USDT is ERC20 {
	constructor() ERC20("Tether USD", "USDT") {
		_mint(msg.sender, 100000000000000000000000000);
	}

	function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
