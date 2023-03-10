# eos-evm-contract
## Introduction
This contract aims to deploy the SoulboundToken and activity reward distribution on the EVM public chain.

## Installation
Install dependencies:

```js
npm install
```

Compile the contracts: 

```js
npx hardhat compile
```

Run tests:
```js
npx hardhat test
```

## Features
### TrantorSoulboundToken
- [x] AccessControl
- [x] Mint & BatchMint
- [x] Transfer switch
- [x] Upgradeable
- [ ] Guardian protection
- [ ] Migrate Identity

### CampaignVault
- [x] Airdrop records
- [x] Multiple Airdrop ERC20 Token
- [x] Multiple Airdrop ETH(BNB etc.)
- [x] Deposit
- [x] Refund
- [x] Withdraw

### Badge
- [x] Mint
- [x] Soulbound
- [x] EIP712 signing claimable

### AirdropUtil
- [x] Multiple Airdrop ERC20 Token
- [x] Multiple Airdrop ETH(BNB etc.)
- [x] Withdraw
