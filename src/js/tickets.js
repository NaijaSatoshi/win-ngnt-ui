import web3Provider from './modules/Web3Provider';
import {showElements, hideElements, formatNumber, showPaginationLinks} from "./modules/Utilities";
import {getUsersTickets} from "./modules/game-api";


(() => {
    function getUserAccount() {
        hideElements('state-access-needed');
        hideElements('state-access-granted');

        return web3Provider.getAccounts()
            .then((accounts) => {
                const userAccount = accounts[0];
                return userAccount;
            })
            .catch((reason) => {
                showElements('state-access-needed');
            });
    }

    function renderTickets(ticketsList) {
        const usersTickets = ticketsList.docs
        const ticketsListComponent = document.getElementById('past-tickets-list');


        if (usersTickets.length >= 1) ticketsListComponent.innerHTML = '';

        usersTickets.forEach((ticket) => {
            const ticketComponent = document.createElement('li');

            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: "2-digit", minute: "2-digit"};
            const date = (new Date(ticket.createdAt)).toLocaleString('en-US', dateOptions);

            ticketComponent.innerHTML = `
                <div>
                    <h3 class="text-h3">
                        <time datetime="${ticket.createdAt}">${date}</time>
                    </h3>
                    <p>
                        Bought 
                        <strong>${ticket.ticketCount} ticket${ticket.ticketCount > 1 ? 's' : ''}</strong> 
                        for 
                        <strong>${formatNumber(ticket.cost)} NGNT</strong>
                    </p>
                </div>
                <div class="list-item--cta">
                    <a href="${GAME_DATA.etherscan_base}/tx/${ticket.hash}"
                        target="_blank" class="button">
                        View transaction
                    </a>
                </div>`;

            ticketsListComponent.appendChild(ticketComponent);
        });
    }

    function start() {
        let ticketsList;
        getUserAccount()
            .then((userAccount) => userAccount ? userAccount : web3Provider.grantAccountAccess().then(() => web3Provider.userAccount))
            .then((userAccount) => {
                if (!userAccount) {
                    showElements('state-access-needed');
                    hideElements('state-access-granted');
                    document.getElementById('grant-access').addEventListener('click', () => start());
                    return Promise.reject('Failed to get account access.');
                }

                showElements('state-access-granted');
                hideElements('state-access-needed');
                return getUsersTickets(userAccount);
            })
            .then((response) => {
                ticketsList = response;
                renderTickets(ticketsList);
            })
            .then(() => showPaginationLinks(ticketsList, document.getElementById('past-tickets-list'), renderTickets))
            .then(() => {
                hideElements('state-content-loading');
                showElements('state-content-loaded');
            })
            .catch((reason) => {
                if (reason === 'Failed to get account access.') return;

                console.log("Error getting user's tickets", reason);
                showElements('state-page-error');
                hideElements('state-access-granted');
            });
    }

    web3Provider.initialize().then(() => {
        if (!web3Provider.web3) {
            showElements('state-no-web3');
            hideElements('state-access-needed');
            hideElements('state-access-granted');
            return;
        }

        start();
    });
})();
