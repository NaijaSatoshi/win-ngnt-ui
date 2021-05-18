import web3Provider from './modules/Web3Provider';
import WinNGNTContract from './modules/WinNGNTContract';

(() => {

    const endGameButton = document.getElementById('end-game');

    function resetGameState() {
        return WinNGNTContract.getGameInfo()
            .then(() => {
                document.getElementById('gameNumber').textContent = WinNGNTContract.gameNumber;
                document.getElementById('numberOfTicketsLeft').textContent = WinNGNTContract.numberOfTicketsLeft;
                document.getElementById('numberOfTicketsPurchased').textContent = WinNGNTContract.numberOfTicketsPurchased;

                if (+WinNGNTContract.numberOfTicketsLeft === 0) {
                    endGameButton.removeAttribute('disabled');
                    endGameButton.addEventListener('click', endGame);
                } else {
                    endGameButton.setAttribute('disabled', 'disabled');
                    endGameButton.removeEventListener('click', endGame);
                }
            });
    }

    function endGame(e) {
        e.preventDefault();

        return Promise.resolve()
            .then(() => {
                if (web3Provider.userAccount) return Promise.resolve();
                return web3Provider.grantAccountAccess();
            })
            .then(() => WinNGNTContract.endGame(web3Provider.userAccount))
            .then(() => {
                alert('Successfully reset game!');
                resetGameState();
            })
            .catch((err) => {
                alert('Unable to reset game. Check the console for more details.');
                console.log(err);
            });
    }

    web3Provider.initialize().then(() => {
        if (!web3Provider.web3) return;

        WinNGNTContract.initialize()
            .then(() => web3Provider.getAccounts())
            .then(() => resetGameState());
    });

})();
