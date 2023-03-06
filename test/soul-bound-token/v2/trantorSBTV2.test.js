const { ethers, upgrades } = require("hardhat")
const { expect } = require("chai")
const BigNumber = ethers.BigNumber
// const abiDecoder = require('abi-decoder')
// const Web3 = require('web3')

describe.skip("Trantor soulbound v2 token test", function () {
  beforeEach(async function() {
    const accounts = await ethers.getSigners()
    const provider = ethers.getDefaultProvider()

    const owner = accounts[0]
    const ownerAddress = owner.address
    this.owner = owner
    this.ownerAddress = ownerAddress

    // deploy SBTV2 721 contract
    const TrantorSBTV2 = await ethers.getContractFactory("TrantorSBTV2")
    const trantorSBTV2 = await TrantorSBTV2.deploy()

    this.trantorSBTV2 = await trantorSBTV2.deployed()
    this.trantorSBTV2Address = trantorSBTV2.address

    // deploy SBTV1 721 contract
    const TrantorSBTV1 = await ethers.getContractFactory("TrantorSBTV1")
    const trantorSBTV1 = await TrantorSBTV1.deploy()

    this.trantorSBTV1 = await trantorSBTV1.deployed()
    this.trantorSBTV1Address = trantorSBTV1.address
  })

  it('Should V2 mint successfully', async function () {
    const {
      ownerAddress,
      trantorSBTV2,
    } = this

    const circleTimes = 200
    let mintTotalGas = 0, mintAvgGas = 0
    for (let i = 0; i < circleTimes; i++) {
      const tx = await trantorSBTV2.mint(ownerAddress, 1)
      const receipt = await tx.wait()
      const gas = receipt.gasUsed
      mintTotalGas += gas.toNumber()
    }
    mintAvgGas = mintTotalGas / circleTimes
    console.log(`Mint avg gas: ${mintAvgGas}`)
  })

  it('Should V2 mint2 successfully', async function () {
    const {
      ownerAddress,
      trantorSBTV2,
    } = this

    const campaignId = ethers.utils.formatBytes32String('K1WJmzakLUG7TMVAbjWTB')
    let mint2TotalGas = 0, mint2AvgGas = 0
    const circleTimes = 200
    for (let i = 0; i < circleTimes; i++) {
      const tx = await trantorSBTV2.mint2(ownerAddress, campaignId)
      const receipt = await tx.wait()
      const gas = receipt.gasUsed
      mint2TotalGas += gas.toNumber()
    }
    mint2AvgGas = mint2TotalGas / circleTimes
    console.log(`Mint2 avg gas: ${mint2AvgGas}`)
  })
});
