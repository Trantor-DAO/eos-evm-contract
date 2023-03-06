// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "TrantorBadge"
const SIGNING_DOMAIN_VERSION = "1"

class BadgeSigner {

  /**
   * Create a new BadgeSigner targeting a deployed instance
   *
   * @param {Object} options
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to mint NFTs on the deployed contract
   */
  constructor({ contract, signer }) {
    this.contract = contract
    this.signer = signer
  }

  /**
   * Creates a new Calldata object and signs it using this BadgeSigner's signing key.
   *
   * @param {string} owner
   * @param {ethers.BigNumber | number} carnivalId
   *
   * @returns {ClaimCallData}
   */
  async signClaimCalldata(owner, carnivalId) {
    const calldata = { owner, carnivalId }
    const domain = await this._signingDomain()
    const types = {
      ClaimCallData: [
        {name: "owner", type: "address"},
        {name: "carnivalId", type: "uint256"},
      ]
    }
    const signature = await this.signer._signTypedData(domain, types, calldata)
    return {
      ...calldata,
      signature,
    }
  }

  /**
   * @private
   * @returns {object} the EIP-721 signing domain, tied to the chainId of the signer
   */
  async _signingDomain() {
    if (this._domain != null) {
      return this._domain
    }
    const chainId = await this.contract.getChainID()
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    }
    return this._domain
  }
}

module.exports = {
  BadgeSigner
}
