import Contract from './Contract';

function WinNGNTContract() {
    this.instance = null;
    this.address = GAME_DATA.win_ngnt_contract_address;
    this.gasPrice = 0;

    this.gameNumber = null;
    this.numberOfTicketsPurchased = null;
    this.numberOfTicketsLeft = null;

    this.isFirstTicket = true;
}

WinNGNTContract.prototype.initialize = function () {
    return new Contract('/assets/contracts/WinNGNT.json', this.address)
        .initialize()
        .then((instance) => this.instance = instance);
};

WinNGNTContract.prototype.getGameNumber = function () {
    return this.instance
        .methods
        .gameNumber()
        .call()
        .then((gameNumber) => this.gameNumber = +gameNumber);
};

WinNGNTContract.prototype.getGameInfo = function () {
    return this.getGameNumber()
        .then(() => this.instance.methods.numberOfTicketsPurchased().call())
        .then((numberOfTicketsPurchased) => this.numberOfTicketsPurchased = +numberOfTicketsPurchased)
        .then(() => this.instance.methods.numberOfTicketsLeft().call())
        .then((numberOfTicketsLeft) => this.numberOfTicketsLeft = +numberOfTicketsLeft);
};

WinNGNTContract.prototype.checkIfIsFirstTicket = function (userAccount) {
    return this.instance
        .methods
        .addressTicketCount(userAccount)
        .call()
        .then((addressTicketCount) => this.isFirstTicket = addressTicketCount === '0');
};

WinNGNTContract.prototype.getAllowedTicketNumber = function (userAccount) {
    return this.instance
        .methods
        .addressTicketCountPerGame(this.gameNumber, userAccount)
        .call()
        .then((addressTicketCount) => +GAME_DATA.max_user_tickets_per_game - addressTicketCount);
};

WinNGNTContract.prototype.buyTicket = function (userAccount, noOfTickets) {
    return this.instance
        .methods
        .buyTicket(noOfTickets)
        .send({from: userAccount, gasPrice: this.gasPrice, useGSN: true})
        .then((transaction) => {
            this.isFirstTicket = false;
            return transaction;
        });
};

WinNGNTContract.prototype.endGame = function (userAccount) {
    return this.instance
        .methods
        .startNextGame()
        .send({from: userAccount, gasPrice: this.gasPrice});
};

export default new WinNGNTContract();
