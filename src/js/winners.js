import {
    showLatestWinner, formatNumber, showPaginationLinks,
    showElements, hideElements
} from "./modules/Utilities";
import {getPreviousWinners} from "./modules/game-api";

(() => {
    const {etherscan_base} = GAME_DATA;

    function showOtherWinners(winnersList) {
        const winnersListComponent = document.getElementById('other-winners');
        winnersListComponent.innerHTML = '';

        // If it's the first page, remove the first item, i.e the latest winner.
        if (!winnersList.hasPrevPage) winnersList.docs.shift();

        winnersList.docs.forEach((winner) => {
            const winnerComponent = document.createElement('li');

            const date = new Date(winner.createdAt);
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

            winnerComponent.innerHTML = `
                <div>
                    <h3 class="text-h3">
                        <strong>${formatNumber(winner.amount)}</strong> NGNT
                    </h3>
                    <p>
                        <a href="${etherscan_base}/address/${winner.address}" target="_blank">
                            ${winner.address}
                        </a>
                    </p>
                    <p>
                        <time datetime="${winner.createdAt}">
                            ${date.toLocaleString('en-US', dateOptions)}
                        </time>
                    </p>
                </div>
                <div class="list-item--cta">
                    <a href="${etherscan_base}/tx/${winner.hash}" target="_blank" class="button">
                        View transaction
                    </a>
                </div>
            `;

            winnersListComponent.appendChild(winnerComponent);
        });
    }

    function start() {
        let winnersList;

        getPreviousWinners()
            .then((res) => {
                winnersList = res;
            })
            .then(() => showLatestWinner(winnersList.docs[0], {showHeading: false}))
            .then(() => showOtherWinners(winnersList))
            .then(() => showPaginationLinks(winnersList, document.getElementById('other-winners'), showOtherWinners))
            .then(() => {
                hideElements('state-content-loading');
                showElements('state-content-loaded');
            })
            .catch((reason) => {
                console.log(reason);
                hideElements('state-content-loading');
                showElements('state-page-error');
            })
    }

    start();
})();
