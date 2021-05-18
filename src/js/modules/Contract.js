import web3Provider from './Web3Provider';
import {hideElements, showElements} from "./Utilities";

function Contract(artifactUrl, address) {
    this.artifactUrl = artifactUrl;
    this.address = address;
}

Contract.prototype.initialize = function () {
    let artifact;
    return fetch(this.artifactUrl)
        .then((res) => res.json())
        .then((ar) => artifact = ar)
        .then(() => web3Provider.web3.eth.net.getId())
        .then((networkId) => {
            if (networkId !== +GAME_DATA.network_id) {
                showElements('state-wrong-network');
                hideElements('state-loading-contract');
            }
            return new web3Provider.web3.eth.Contract(artifact.abi, this.address);
        });
};

export default Contract;
