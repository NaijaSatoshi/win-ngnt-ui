import { fromInjected } from "@openzeppelin/network";

function Web3Provider() {
    this.web3 = null;
    this.userAccount = null;
}

Web3Provider.prototype.initialize = function() {
    return fromInjected({gsn: true})
        .then((provider) => this.web3 = provider ? provider.lib : null)
        .catch((err) => console.log(err));
};

Web3Provider.prototype.grantAccountAccess = function() {

    if (!window.ethereum) return Promise.resolve();

    return new Promise((resolve, reject) => {
        window.ethereum.send({ method: "eth_requestAccounts" }, (err, res) => {

            if (res.result) {
                this.userAccount = res.result[0];
                resolve();
                return;
            }

            // Coinbase wallet doesn't recognize this method and doesn't need to grant access
            if (res.error && res.error.code == -32601) {
                resolve();
                return;
            }

            if (err.code === 4001) {
                reject(new Error('User rejected request'));
                return;
            }

            window.ethereum.enable()
                .then((accounts) => {
                    this.userAccount = accounts[0];
                    resolve();
                })
                .catch((err) => reject(err));

        });
    });
};

Web3Provider.prototype.getAccounts = function() {
    return this.web3.eth.getAccounts((err, accounts) => {
        this.userAccount = accounts[0];
    });
};

const web3Provider = new Web3Provider();

export default web3Provider;
