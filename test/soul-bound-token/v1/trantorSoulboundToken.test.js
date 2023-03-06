const { ethers, upgrades } = require("hardhat")
const BigNumber = ethers.BigNumber
const { expect } = require("chai")

describe("Trantor soulbound V1 upgradable token test", function () {
  beforeEach(async function() {
    const accounts = await ethers.getSigners()
    const provider = ethers.getDefaultProvider()
    this.accounts = accounts
    const owner = accounts[0]
    const ownerAddress = owner.address
    this.ownerAddress = ownerAddress
    this.owner = owner

    const TrantorSoulboundToken = await ethers.getContractFactory("TrantorSoulboundToken")
    const trantorSoulboundToken = await upgrades.deployProxy(
      TrantorSoulboundToken,
      [],
      { initializer: 'initialize' }
    )

    this.trantorSoulboundToken = await trantorSoulboundToken.deployed()
    this.trantorSoulboundToken.grantMintRole(ownerAddress)
    this.trantorSBTV1Address = trantorSoulboundToken.address
  })

  it('Should mint for campaign successfully', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    const totalSupply = await trantorSoulboundToken.totalSupply()
    const campaignId = '163208757296'
    const rewardIndex = '0'
    const tx = await trantorSoulboundToken.mintForCampaign(ownerAddress, campaignId, rewardIndex)
    const receipt = await tx.wait()
    const event = receipt.events.find(item => item.event === 'CampaignRewardClaimed')
    expect(event.args.campaignId).equal(campaignId)
    expect(event.args.value).equal('0')
    expect(event.args.rewardIndex).equal(rewardIndex)
    const totalSupplyNew = await trantorSoulboundToken.totalSupply()
    expect(totalSupplyNew.toNumber()).to.equal(totalSupply.toNumber() + 1)
  })

  it('Should not mint for campaign for twice', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    const totalSupply = await trantorSoulboundToken.totalSupply()
    const campaignId = '163208757296'
    const rewardIndex = '0'
    await trantorSoulboundToken.mintForCampaign(ownerAddress, campaignId, rewardIndex)
    const totalSupplyNew = await trantorSoulboundToken.totalSupply()
    expect(totalSupplyNew.toNumber()).to.equal(totalSupply.toNumber() + 1)

    const message = 'Trantor: Already minted'
    await expect(trantorSoulboundToken.mintForCampaign(ownerAddress, campaignId, rewardIndex)).to.be.revertedWith(message)
  })

  it('Should batch mint for campaign successfully', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    const totalSupply = await trantorSoulboundToken.totalSupply()
    const totalMint = 20
    const receivers = []
    for (let i = 0; i < totalMint; i++) {
      const wallet = ethers.Wallet.createRandom()
      receivers.push(wallet.address)
    }
    const campaignId = '163208757296'
    const rewardIndex = '0'
    const tx = await trantorSoulboundToken.batchMintForCampaign(receivers, campaignId, rewardIndex)
    const receipt = await tx.wait()
    const events = receipt.events.filter(item => item.event === 'CampaignRewardClaimed')
    expect(events.length).to.equal(totalMint)

    const event = events[0]
    expect(event.args.campaignId).equal(campaignId)
    expect(event.args.value).equal('0')
    expect(event.args.rewardIndex).equal(rewardIndex)
    const totalSupplyNew = await trantorSoulboundToken.totalSupply()
    expect(totalSupplyNew.toNumber()).to.equal(totalSupply.toNumber() + totalMint)

    const message = 'Trantor: Already minted'
    await expect(trantorSoulboundToken.batchMintForCampaign(receivers, campaignId, rewardIndex)).to.be.revertedWith(message)
  })

  it('Should mint token successfully', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    const totalSupply = await trantorSoulboundToken.totalSupply()
    await trantorSoulboundToken.mint(ownerAddress)
    const totalSupplyNew = await trantorSoulboundToken.totalSupply()
    expect(totalSupplyNew.toNumber()).to.equal(totalSupply.toNumber() + 1)
  })

  it('Should change metadata url successfully', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    const tokenId = 0
    const metadataUrl = `https://trantor.xyz/${Math.random()}/metadata/56/`
    await trantorSoulboundToken.setBaseURI(metadataUrl)
    const metadataUrlNew = await trantorSoulboundToken.tokenURI(tokenId)
    expect(metadataUrlNew).to.equal(`${metadataUrl}${tokenId}`)
  })

  it('Should transfer owner successfully', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
      accounts,
    } = this

    const newOwner = accounts[1]
    const newOwnerAddress = newOwner.address
    await trantorSoulboundToken.transferOwnership(newOwnerAddress)
    const ownerAddressNew = await trantorSoulboundToken.owner()
    expect(ownerAddressNew).to.equal(newOwnerAddress)
  })

  it('Should grant role and revoke role successfully', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
      accounts,
    } = this

    const newMinter = accounts[1]
    await expect(trantorSoulboundToken.connect(newMinter).mint(ownerAddress)).to.be.revertedWith("Trantor: Only minters can mint")
    await trantorSoulboundToken.grantMintRole(newMinter.address)
    await trantorSoulboundToken.connect(newMinter).mint(ownerAddress)
  })

  it('Should transfer is under control', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
      accounts,
    } = this

    const newOwner = accounts[1]
    const newOwnerAddress = newOwner.address
    await trantorSoulboundToken.mint(ownerAddress)
    const tokenId = await trantorSoulboundToken.totalSupply() - 1
    await expect(trantorSoulboundToken.transferFrom(ownerAddress, newOwnerAddress, tokenId)).to.be.revertedWith('Trantor: Transfer is not allowed')
    await trantorSoulboundToken.setGlobalTransfer(true)
    await trantorSoulboundToken.transferFrom(ownerAddress, newOwnerAddress, tokenId)
    expect(newOwner.address).to.equal(await trantorSoulboundToken.ownerOf(tokenId))
  })

  it('Mint gas benchmark', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    let mintTotalGas = 0, mintAvgGas = 0
    const circleTimes = 200
    for (let i = 0; i < circleTimes; i++) {
      const tx = await trantorSoulboundToken.mint(ownerAddress)
      const receipt = await tx.wait()
      const gas = receipt.gasUsed
      mintTotalGas += gas.toNumber()
    }
    console.log(`Mint avg gas: ${mintTotalGas/circleTimes}`)
  })

  it('Mint for campaign gas benchmark', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    let mintTotalGas = 0, mintAvgGas = 0
    const circleTimes = 200
    const campaignId = '163208757296'
    const rewardIndex = '0'
    for (let i = 0; i < circleTimes; i++) {
      const tx = await trantorSoulboundToken.mintForCampaign(ownerAddress, campaignId, rewardIndex)
      const receipt = await tx.wait()
      const gas = receipt.gasUsed
      mintTotalGas += gas.toNumber()
    }
    console.log(`Mint avg gas: ${mintTotalGas/circleTimes}`)
  })

  it('Batch mint for campaign gas benchmark', async function () {
    const {
      ownerAddress,
      trantorSoulboundToken,
    } = this

    let mintTotalGas = 0, mintAvgGas = 0
    const circleTimes = 200
    const campaignId = '163208757296'
    const rewardIndex = '0'
    for (let i = 0; i < circleTimes; i++) {
      const tx = await trantorSoulboundToken.batchMintForCampaign(new Array(20).fill(ownerAddress), campaignId, rewardIndex)
      const receipt = await tx.wait()
      const gas = receipt.gasUsed
      mintTotalGas += gas.toNumber()
    }
    console.log(`Mint avg gas: ${mintTotalGas/circleTimes}`)
  })
});
