const { ethers, upgrades } = require("hardhat")
const { expect } = require("chai")
const { BadgeSigner } = require("./BadgeSigner");
const contractConfig = require('../../config/config.json')

describe("Trantor badge test", function () {
  beforeEach(async function() {
    const accounts = await ethers.getSigners()
    const provider = ethers.getDefaultProvider()
    this.accounts = accounts
    const owner = accounts[0]
    const ownerAddress = owner.address
    this.ownerAddress = ownerAddress
    this.owner = owner

    const TrantorBadge = await ethers.getContractFactory("TrantorBadge")
    const trantorBadge = await TrantorBadge.deploy()

    this.trantorBadge = await trantorBadge.deployed()
    this.trantorBadgeAddress = trantorBadge.address
  })

  it('Should claim successfully', async function () {
    const {
      ownerAddress,
      trantorBadge,
    } = this

    const totalSupply = await trantorBadge.totalSupply()
    const carnivalId = '1'

    const signerWallet = new ethers.Wallet(contractConfig.signerPrivateKey)

    const badgeSigner = new BadgeSigner({
      contract: trantorBadge,
      signer: signerWallet,
    })

    const claimData = await badgeSigner.signClaimCalldata(ownerAddress, carnivalId);
    const tx = await trantorBadge.claim(claimData)
    const receipt = await tx.wait()
    const event = receipt.events.find(item => item.event === 'CarnivalBadgeClaimed')
    expect(event.args.carnivalId).equal(carnivalId)
    expect(event.args.tokenId).equal('0')
    const totalSupplyNew = await trantorBadge.totalSupply()
    expect(totalSupplyNew.toNumber()).to.equal(totalSupply.toNumber() + 1)
  })
});
