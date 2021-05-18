const {api_base} = GAME_DATA;

function getPaginator(direction, list, urlString) {
    if (direction === 'next' && !list.hasNextPage) {
        return () => Promise.reject(`No ${direction} page`);
    }

    if (direction === 'previous' && !list.hasPrevPage) {
        return () => Promise.reject(`No ${direction} page`);
    }

    const urlObj = new URL(urlString.split('?')[0]);

    if (direction === 'next') {
        const offset = list.offset + list.limit;
        const queryParams = new URLSearchParams({offset});
        urlObj.search = queryParams.toString();
    }

    if (direction === 'previous') {
        const offset = list.offset - list.limit;
        const queryParams = new URLSearchParams({offset});
        urlObj.search = queryParams.toString();
    }

    return function paginator() {
        return fetch(urlObj)
            .then((res) => res.json())
            .then((newList) => {
                newList.getNextPage = getPaginator('next', newList, urlObj.href);
                newList.getPreviousPage = getPaginator('previous', newList, urlObj.href);
                return newList;
            });
    }
}

function getPreviousWinners() {
    const url = `${api_base}/winners`;
    return fetch(url)
        .then((res) => res.json())
        .then((winnersList) => {
            winnersList.getNextPage = getPaginator('next', winnersList, url);
            winnersList.getPreviousPage = getPaginator('previous', winnersList, url);
            return winnersList;
        });
}

function getUsersTickets(userAccount) {
    if (!userAccount) return Promise.reject('No wallet address. userAccount is falsy');

    const url = `${api_base}/orders/${userAccount}`;
    return fetch(url)
        .then((res) => res.json())
        .then((ticketsList) => {
            ticketsList.getNextPage = getPaginator('next', ticketsList, url);
            ticketsList.getPreviousPage = getPaginator('previous', ticketsList, url);
            return ticketsList;
        });
}

export { getPreviousWinners, getUsersTickets };
