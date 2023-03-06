const { ethers, upgrades} = require("hardhat")
const BigNumber = ethers.BigNumber
const { expect } = require("chai")

describe.skip("Batch claim reward test", function () {
  beforeEach(async function() {
    const accounts = await ethers.getSigners()
    const provider = ethers.getDefaultProvider()
    this.accounts = accounts
    const owner = accounts[0]
    const ownerAddress = owner.address
    this.ownerAddress = ownerAddress
    this.receiverAddress = accounts[1].address
    this.owner = owner

    const CampaignReward = await ethers.getContractFactory("CampaignReward")
    const campaignReward = await CampaignReward.deploy()

    this.campaignReward = await campaignReward.deployed()
    this.campaignRewardAddress = campaignReward.address


    const BatchClaimReward = await ethers.getContractFactory("BatchClaimReward")
    const batchClaimReward = await BatchClaimReward.deploy()

    const TrantorSBTV1Upgradable = await ethers.getContractFactory("TrantorSoulboundToken")
    const trantorSBTV1Upgradable = await upgrades.deployProxy(
      TrantorSBTV1Upgradable,
      [],
      { initializer: 'initialize' }
    )

    this.trantorSBTV1Upgradable = await trantorSBTV1Upgradable.deployed()
    this.trantorSBTV1Upgradable.grantMintRole(ownerAddress)
    this.trantorSBTV1Address = trantorSBTV1Upgradable.address

    const USDT = await ethers.getContractFactory("USDT")
    const usdt = await USDT.deploy()

    this.batchClaimReward = await batchClaimReward.deployed()
    this.batchClaimRewardAddress = batchClaimReward.address

    trantorSBTV1Upgradable.grantMintRole(batchClaimReward.address)

    batchClaimReward.setTrantorSBTdAddress(trantorSBTV1Upgradable.address)
    batchClaimReward.setCampaignRewardAddress(campaignReward.address)

    this.usdt = usdt;
    this.usdtAddress = usdt.address
  })

  it('Should send reward successfully', async function () {
    const {
      ownerAddress,
      usdt,
      usdtAddress,
      receiverAddress,
      campaignReward,
      campaignRewardAddress,
      batchClaimReward,
      batchClaimRewardAddress,
    } = this

    const tokenAddress = usdtAddress
    const tokenAmount =  BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
    await usdt.approve(campaignRewardAddress, tokenAmount)
    const campaignId = 10000000001
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balance).to.equal(tokenAmount)

    const rewardAmount = BigNumber.from(100).mul(BigNumber.from(10).pow(18))
    await batchClaimReward.claimTokenAndSBTReward(
      receiverAddress, campaignId, tokenAddress, rewardAmount
    )

    const receiverBalance = await usdt.balanceOf(receiverAddress)
    const receiverSBTBalance = await this.trantorSBTV1Upgradable.balanceOf(receiverAddress)

    expect(receiverBalance).to.equal(rewardAmount)
    expect(receiverSBTBalance).to.equal(1)
  })

  it('Should batch send reward successfully', async function () {
    const {
      ownerAddress,
      usdt,
      usdtAddress,
      receiverAddress,
      campaignReward,
      campaignRewardAddress,
      batchClaimReward,
      batchClaimRewardAddress,
    } = this

    const tokenAddress = usdtAddress
    const tokenAmount =  BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
    await usdt.approve(campaignRewardAddress, tokenAmount)
    const campaignId = 10000000001
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balance).to.equal(tokenAmount)

    const rewardAmount = BigNumber.from(1).mul(BigNumber.from(10).pow(18))
    for (let i = 0; i < 400; i++) {
      const tx = await batchClaimReward.claimTokenAndSBTReward(
        receiverAddress, campaignId, tokenAddress, rewardAmount
      )
      const receipt = await tx.wait()
      console.log(receipt)
    }
  })
});
