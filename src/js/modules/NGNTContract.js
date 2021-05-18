import Contract from "./Contract";

function NGNTContract() {
    this.instance = null;
    this.address = GAME_DATA.ngnt_contract_address;
    this.gasPrice = 0;
}

NGNTContract.prototype.initialize = function() {
    return new Contract('/assets/contracts/NGNT.json', this.address)
        .initialize()
        .then((instance) => this.instance = instance);
};

NGNTContract.prototype.approve = function(userAccount, WinNGNTContractAddress) {
    const amountToApprove = 10000000000000;

    return this.instance
        .methods
        .approve(WinNGNTContractAddress, amountToApprove)
        .send({from: userAccount, gasPrice: this.gasPrice, useGSN: true});
};

NGNTContract.prototype.balanceOf = function(userAccount) {
    return this.instance
        .methods
        .balanceOf(userAccount)
        .call({from: userAccount});
};

export default new NGNTContract();
