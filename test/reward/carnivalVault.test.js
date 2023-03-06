const { ethers } = require("hardhat")
const BigNumber = ethers.BigNumber
const { expect } = require("chai")

describe("Carnival reward test", function () {
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

    const CarnivalVault = await ethers.getContractFactory("CarnivalVault")
    const carnivalVault = await CarnivalVault.deploy()

    const USDT = await ethers.getContractFactory("USDT")
    const usdt = await USDT.deploy()

    this.carnivalVault = await carnivalVault.deployed()
    this.carnivalVaultAddress = carnivalVault.address

    this.usdt = usdt;
    this.usdtAddress = usdt.address
  })

  it('Should send single reward successfully', async function() {
    const {
      carnivalVault,
      carnivalVaultAddress,
      ownerAddress,
      receiver,
      receiverAddress,
      usdt,
      usdtAddress,
    } = this

    await usdt.approve(carnivalVaultAddress, ethers.constants.MaxUint256)
    const carnivalId = 1
    const tokenAmount = ethers.utils.parseEther('100')
    await carnivalVault.sendSingleERC20Reward(carnivalId, receiverAddress, usdtAddress, tokenAmount)
    const balance = await usdt.balanceOf(receiverAddress)
    expect(balance).to.equal(tokenAmount)
  })

  it('Should batch send erc20 reward successfully', async function () {
    const {
      carnivalVault,
      carnivalVaultAddress,
      ownerAddress,
      receiver,
      receiverAddress,
      usdt,
      usdtAddress,
      accounts,
    } = this

    const receivers = new Array(8).fill('').map((item, index) => accounts[index+1].address )
    const tokenAmounts =  new Array(8).fill(0).map((item, index) => ethers.utils.parseEther(`${index+1}`))
    const totalAmount = tokenAmounts.reduce((a, b) => a.add(b), BigNumber.from(0))
    await usdt.approve(carnivalVaultAddress, ethers.constants.MaxUint256)
    const carnivalId = 1
    await carnivalVault.sendBatchERC20Reward(carnivalId, receivers, usdtAddress, tokenAmounts, totalAmount)

    for (let i = 0; i < receivers.length; i++) {
      const receiver = receivers[i]
      const tokenAmount = tokenAmounts[i]
      const balance = await usdt.balanceOf(receiver)
      expect(balance).to.equal(tokenAmount)
    }
  })

  it('Should batch send erc20 same reward successfully', async function () {
    const {
      carnivalVault,
      carnivalVaultAddress,
      ownerAddress,
      receiver,
      receiverAddress,
      usdt,
      usdtAddress,
      accounts,
    } = this

    const receivers = new Array(8).fill('').map((item, index) => accounts[index+1].address )
    const tokenAmount = ethers.utils.parseEther('10')
    const totalAmount = tokenAmount.mul(receivers.length)
    await usdt.approve(carnivalVaultAddress, ethers.constants.MaxUint256)
    const carnivalId = 1
    await carnivalVault.sendBatchERC20SameValue(carnivalId, receivers, usdtAddress, tokenAmount, totalAmount)

    for (let i = 0; i < receivers.length; i++) {
      const receiver = receivers[i]
      const balance = await usdt.balanceOf(receiver)
      expect(balance).to.equal(tokenAmount)
    }
  })

  it.skip('gas benchmark', async function () {
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
