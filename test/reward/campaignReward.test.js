const { ethers, upgrades } = require("hardhat")
const BigNumber = ethers.BigNumber
const { expect } = require("chai")

describe("Trantor campaign vault test", function () {
  beforeEach(async function() {
    const accounts = await ethers.getSigners()
    const provider = ethers.getDefaultProvider()
    this.accounts = accounts
    const owner = accounts[0]
    const ownerAddress = owner.address
    this.ownerAddress = ownerAddress
    this.receiver = accounts[1]
    this.receiverAddress = accounts[1].address
    this.owner = owner

    const TrantorCampaignVault = await ethers.getContractFactory("TrantorCampaignVault")
    const campaignReward = await upgrades.deployProxy(
      TrantorCampaignVault,
      [],
      { initializer: 'initialize' }
    )

    const USDT = await ethers.getContractFactory("USDT")
    const usdt = await USDT.deploy()

    this.campaignReward = await campaignReward.deployed()
    this.campaignRewardAddress = campaignReward.address

    this.usdt = usdt;
    this.usdtAddress = usdt.address
  })

  it('Should grant role successfully', async function() {
    const {
      campaignReward,
      campaignRewardAddress,
      receiver,
      receiverAddress,
      usdt,
      usdtAddress,
    } = this


    await expect(campaignReward.connect(receiver).grantRole(receiverAddress)).to.be.revertedWith("Ownable: caller is not the owner")
    await campaignReward.grantRole(receiverAddress);
  })

  it('Should deposit token successfully', async function () {
    const {
      campaignReward,
      campaignRewardAddress,
      usdt,
      usdtAddress,
    } = this

    const tokenAddress = usdtAddress
    const tokenAmount =  BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
    await usdt.approve(campaignRewardAddress, tokenAmount)
    const campaignId = 10000000001
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balance).to.equal(tokenAmount)
  })

  it('Should claim reward successfully', async function () {
    const {
      campaignReward,
      campaignRewardAddress,
      usdt,
      ownerAddress,
      usdtAddress,
      receiverAddress,
    } = this

    const tokenAddress = usdtAddress
    const tokenAmount =  BigNumber.from(1).mul(BigNumber.from(10).pow(18))
    const campaignId = 10000000001
    const rewardIndex = 1
    await usdt.approve(campaignRewardAddress, tokenAmount)
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)
    const rewardNumber = 1

    await campaignReward.grantRole(ownerAddress)
    await campaignReward.claimReward(tokenAddress, campaignId, rewardNumber, rewardIndex, receiverAddress);
    const balanceAfter = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balanceAfter).to.equal(balance.sub(rewardNumber))

    const receiverBalance = await usdt.balanceOf(receiverAddress)
    expect(receiverBalance).to.equal(rewardNumber)
  })

  it('Should batch claim reward successfully', async function () {
    const {
      campaignReward,
      campaignRewardAddress,
      usdt,
      ownerAddress,
      usdtAddress,
      receiverAddress,
    } = this

    const tokenAddress = usdtAddress
    const rewardNumber = 1
    const rewardIndex = 1, receiverAmount = 100
    const tokenAmount =  BigNumber.from(rewardNumber * receiverAmount).mul(BigNumber.from(10).pow(18))
    const campaignId = 10000000001
    await usdt.approve(campaignRewardAddress, tokenAmount)
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)

    await campaignReward.grantRole(ownerAddress)
    const receivers = []
    for (let i = 0; i < receiverAmount; i++) {
      const wallet = ethers.Wallet.createRandom()
      receivers.push(wallet.address)
    }

    await campaignReward.batchClaimReward(tokenAddress, campaignId, rewardNumber, rewardIndex, receivers);
    const balanceAfter = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balanceAfter).to.equal(balance.sub(rewardNumber*receiverAmount))

    const receiverBalance = await usdt.balanceOf(receivers[0])
    expect(receiverBalance).to.equal(rewardNumber)

    await expect(campaignReward.batchClaimReward(tokenAddress, campaignId, rewardNumber, rewardIndex, receivers)).to.be.revertedWith("Trantor: Already claimed")
  })

  it('Should refund reward successfully', async function () {
    const {
      campaignReward,
      campaignRewardAddress,
      ownerAddress,
      usdt,
      usdtAddress,
      receiverAddress,
    } = this

    const tokenAddress = usdtAddress
    const tokenAmount =  BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
    await usdt.approve(campaignRewardAddress, tokenAmount)
    const campaignId = 10000000001
    await campaignReward.grantRole(ownerAddress)
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balance).to.equal(tokenAmount)

    const refundAmount = BigNumber.from(100).mul(BigNumber.from(10).pow(18))
    await campaignReward.refund(tokenAddress, campaignId, receiverAddress, refundAmount);

    expect(await campaignReward.getBalance(campaignId, tokenAddress)).to.equal(tokenAmount.sub(refundAmount))
    expect(await usdt.balanceOf(receiverAddress)).to.equal(refundAmount)
  })

  it('benchmark', async function () {
    const {
      campaignReward,
      campaignRewardAddress,
      ownerAddress,
      usdt,
      usdtAddress,
      receiverAddress,
    } = this

    const tokenAddress = usdtAddress
    const tokenAmount =  BigNumber.from(1).mul(BigNumber.from(10).pow(18))
    const campaignId = 10000000001
    await usdt.approve(campaignRewardAddress, tokenAmount)
    await campaignReward.deposit(tokenAddress, tokenAmount, campaignId)
    const balance = await campaignReward.getBalance(campaignId, tokenAddress)
    const rewardNumber = 1
    const rewardIndex = 2;

    await campaignReward.grantRole(ownerAddress)
    const circleTimes = 400
    for (let i = 0; i < circleTimes; i++) {
      await campaignReward.claimReward(tokenAddress, campaignId, rewardNumber, rewardIndex, receiverAddress);
    }
    const balanceAfter = await campaignReward.getBalance(campaignId, tokenAddress)
    expect(balanceAfter).to.equal(balance.sub(BigNumber.from(rewardNumber * circleTimes)))

    const receiverBalance = await usdt.balanceOf(receiverAddress)
    expect(receiverBalance).to.equal(rewardNumber * circleTimes)
  })
});
