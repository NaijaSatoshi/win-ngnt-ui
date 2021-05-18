import web3Provider from './modules/Web3Provider';
import WinNGNTContract from './modules/WinNGNTContract';
import NGNTContract from './modules/NGNTContract';
import {
    collapseSection, expandSection, showElements,
    hideElements, showLatestWinner, formatNumber
} from "./modules/Utilities";
import {getPreviousWinners} from "./modules/game-api";
import {getGasPrice} from "./modules/GasPrice";

(() => {

    const buyTicketButton = document.getElementById('buy-ticket-button');
    //https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#Mobile_Tablet_or_Desktop
    const mobileDevice = /mobi/i.test(navigator.userAgent);


    /* ******************************************
     *
     *  Accordion
     *
     ****************************************** */

    document.getElementById("how-to-play").addEventListener("click", (e) => {

        if (e.target.dataset.action !== "toggle") return;

        const article = e.target.parentElement.parentElement;

        if (article.classList.contains("collapsed")) {
            expandSection(article);
        } else {
            collapseSection(article);
        }

    });


    /* ******************************************
     *
     *  Setup Game/Account State
     *
     ****************************************** */

    function setAccountsState() {
        hideElements('state-access-needed');
        hideElements('state-access-granted');

        showElements(web3Provider.userAccount ? 'state-access-granted' : 'state-access-needed');

        if (web3Provider.userAccount) return WinNGNTContract.checkIfIsFirstTicket(web3Provider.userAccount);
        return Promise.resolve();
    }

    function resetGameState() {

        function updateGameNumber() {
            document.getElementById('game-number').textContent = `(#${WinNGNTContract.gameNumber})`;
        }

        function updateTicketsPurchased() {
            const ticketsPurchased = parseFloat(WinNGNTContract.numberOfTicketsPurchased);
            document.getElementById('tickets-purchased').textContent = ticketsPurchased;
            const percentage = (ticketsPurchased / GAME_DATA.total_tickets) * 100;
            let width = `${percentage}%`;
            if (percentage < 50) width = `calc(${percentage}% + 40px)`;
            document.getElementById('progress-bar-fill').style.width = width;
        }

        function updateTicketsLeft() {
            const ticketSelect = document.querySelector('#ticket-amount');
            const ticketOptions = document.querySelectorAll('#ticket-amount > option');

            if (WinNGNTContract.numberOfTicketsLeft === 0) {

                ticketSelect.setAttribute('disabled', 'disabled');

            } else if (WinNGNTContract.numberOfTicketsLeft < 10) {

                ticketSelect.removeAttribute('disabled');

                ticketOptions.forEach((option) => {
                    if (+option.value > WinNGNTContract.numberOfTicketsLeft) {
                        option.setAttribute('disabled', 'disabled');
                    } else {
                        option.removeAttribute('disabled');
                    }
                });

                ticketOptions[0].selected = true;

            } else {

                ticketSelect.removeAttribute('disabled');

                ticketOptions.forEach((option) => {
                    option.removeAttribute('disabled');
                });

            }
        }

        function handleFinishedGame() {
            buyTicketButton.setAttribute('disabled', 'disabled');
            buyTicketButton.removeEventListener('click', buyTicket);

            showElements('state-game-end');

            const interval = setInterval(checkGameInfo, 10000);

            function checkGameInfo() {
                return WinNGNTContract.getGameInfo()
                    .then(() => {
                        if (WinNGNTContract.numberOfTicketsLeft > 0) {
                            updateGameNumber();
                            updateTicketsPurchased();
                            updateTicketsLeft();
                            handleUnfinishedGame();
                            displayLatestWinner();
                            clearInterval(interval);
                        }
                    });
            }
        }

        function handleUnfinishedGame() {
            buyTicketButton.removeAttribute('disabled');
            buyTicketButton.addEventListener('click', buyTicket);

            hideElements('state-game-end');
        }

        return WinNGNTContract.getGameInfo()
            .then(() => updateGameNumber())
            .then(() => updateTicketsPurchased())
            .then(() => updateTicketsLeft())
            .then(() => {
                if (WinNGNTContract.numberOfTicketsLeft === 0) {
                    handleFinishedGame();
                } else {
                    handleUnfinishedGame();
                }
            })
    }


    /* ******************************************
     *
     *  Buy Tickets
     *
     ****************************************** */

    function buyTicket(e) {

        e.preventDefault();

        const noOfTickets = parseFloat(document.getElementById('ticket-amount').value);

        const confettiContainer = document.getElementById('confetti-container');
        const transactionNotice = document.getElementById('transaction-notice');
        const transactionNoticeClose = document.querySelector('#transaction-notice button');

        function showTransactionNotice() {
            transactionNotice.removeAttribute('hidden');
            setTimeout(() => transactionNotice.classList.remove('hidden'), 10);
        }

        function hideTransactionNotice() {
            transactionNotice.classList.add('hidden');
            setTimeout(() => transactionNotice.setAttribute('hidden', 'hidden'), 1000);
        }

        function showConfetti() {
            confettiContainer.removeAttribute('hidden');
            confettiContainer.classList.remove('hidden');

            setTimeout(() => {
                confettiContainer.classList.add('hidden');
                setTimeout(() => confettiContainer.setAttribute('hidden', 'hidden'), 1100);
            }, 10000);
        }

        function onPending() {
            buyTicketButton.setAttribute('disabled', 'disabled');

            document.getElementById('step-approve').classList.remove('completed');
            document.getElementById('step-connect-account').classList.remove('completed');

            hideElements('state-purchase-success');
            hideElements('state-purchase-error');
            showElements('state-purchase-pending');

            showTransactionNotice();

            // Wait 2 seconds to let users acknowledge transaction notice
            return new Promise((resolve) => setTimeout(() => resolve(), 2000));
        }

        function onSuccess(transaction) {
            buyTicketButton.removeAttribute('disabled');

            hideElements('state-purchase-pending');
            showElements('state-purchase-success');

            showConfetti();

            document.querySelector('#transaction-notice .state-purchase-success .content').innerHTML = `
                <p>You successfully bought <strong>${noOfTickets === 1 ? '1 ticket' : noOfTickets + ' tickets'}</strong>! Buy more tickets for a higher chance of winning the game!</p>
                <br>
                <p><a href="${GAME_DATA.etherscan_base}/tx/${transaction.transactionHash}">View transaction on the blockchain</a></p>
            `;

            resetGameState();
        }

        function onError(err) {
            buyTicketButton.removeAttribute('disabled');

            if (err.code === 4001) return hideTransactionNotice();
            if (err.message && err.message.indexOf('denied message signature') !== -1) return hideTransactionNotice();

            if (GAME_DATA.environment === 'development') {
                if (mobileDevice) alert(JSON.stringify(err));
                else console.log(err);
            }

            hideElements('state-purchase-pending');
            showElements('state-purchase-error');

            document.querySelector('#transaction-notice .state-purchase-error .content').innerHTML = `
                <p>There was an issue purchasing your ticket. Please try again later.</p>
                <br>
                ${err.code ? `<p>Code: ${err.code}</p>` : ''}
                ${err.message ? `<p>Message: ${err.message}</p>` : ''}
            `;
        }

        onPending()
            .then(() => {
                if (web3Provider.userAccount) return Promise.resolve();
                return web3Provider.grantAccountAccess().then(() => setAccountsState());
            })
            .then(() => {
                return WinNGNTContract.getAllowedTicketNumber(web3Provider.userAccount)
                    .then((allowedTickets) => {
                        if (+noOfTickets > allowedTickets) return Promise.reject({
                            message: `${allowedTickets > 0 ? 
                                `You're only allowed to buy <strong>${allowedTickets} more ticket(s) this game</strong>` : 
                                `<strong>You've bought as many tickets as you can this game</strong>`}. 
                                Each address is allowed a maximum of ${GAME_DATA.max_user_tickets_per_game} tickets per game.`
                        });

                        else return Promise.resolve();
                    });
            })
            .then(() => {
                return NGNTContract.balanceOf(web3Provider.userAccount)
                    .then((balance) => {
                        const totalCost = +GAME_DATA.ticket_cost * noOfTickets;

                        if (+balance < totalCost) return Promise.reject({
                            message: `You currently have <strong>${formatNumber(balance)} NGNT</strong> in your wallet, which isn't enough to pay for your ticket cost of ${formatNumber(totalCost)} NGNT. Please <a href="#how-to-2">fund your NGNT wallet</a> and try again.`
                        });

                        else return Promise.resolve();
                    });
            })
            .then(() => {
                return getGasPrice().then((gasPrice) => {
                    NGNTContract.gasPrice = gasPrice;
                    WinNGNTContract.gasPrice = gasPrice;
                });
            })
            .then(() => {
                document.getElementById('step-connect-account').classList.add('completed');

                if (!WinNGNTContract.isFirstTicket) return Promise.resolve();
                return NGNTContract.approve(web3Provider.userAccount, WinNGNTContract.address);
            })
            .then(() => {
                document.getElementById('step-approve').classList.add('completed');

                return WinNGNTContract.buyTicket(web3Provider.userAccount, noOfTickets);
            })
            .then(onSuccess)
            .catch(onError)
            .then(() => showElements('state-purchase-completed'));

        transactionNoticeClose.addEventListener('click', () => hideTransactionNotice());
    }


    /* ******************************************
     *
     *  Latest Winner
     *
     ****************************************** */

    function displayLatestWinner() {
        return getPreviousWinners()
            .then((response) => showLatestWinner(response.docs[0], {
                showTime: true,
                linkTo: '/winners/',
                linkText: 'View all previous games'
            }));
    }


    /* ******************************************
     *
     *  Setup Browser State
     *
     ****************************************** */

    if (!mobileDevice) {
        document.getElementById('desktop-wallet-cta')
            .removeAttribute('hidden');

        document.getElementById('mobile-wallet-cta')
            .setAttribute('hidden', 'true');
    }

    web3Provider.initialize().then(() => {
        if (!web3Provider.web3) {
            showElements('state-no-web3');
            hideElements('state-has-web3');
            return;
        }

        collapseSection(document.getElementById('how-to-1'));
        expandSection(document.getElementById('how-to-2'));

        WinNGNTContract.initialize()
            .then(() => NGNTContract.initialize())
            .then(() => web3Provider.getAccounts())
            .then(() => setAccountsState())
            .then(() => resetGameState())
            .then(() => hideElements('state-loading-contract'));
    });

    displayLatestWinner();


})();
