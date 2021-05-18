/* ******************************************
 *
 *  Accordion
 *
 ****************************************** */

function expandSection(article) {
    article.classList.remove("collapsed");
}

function collapseSection(article) {
    article.classList.add("collapsed");
}


/* ******************************************
 *
 *  Utilities
 *
 ****************************************** */

function showElements(state) {
    const elements = document.getElementsByClassName(state);
    for (let i = 0; i < elements.length; i++) {
        elements[i].removeAttribute('hidden');
    }
}

function hideElements(state) {
    const elements = document.getElementsByClassName(state);
    for (let i = 0; i < elements.length; i++) {
        elements[i].setAttribute('hidden', 'hidden');
    }
}

function focusElement(element) {
    if (element.hasAttribute('tabindex')) return element.focus();

    element.setAttribute('tabindex', '-1');
    element.focus();
    element.removeAttribute('tabindex');
}

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showLatestWinner(latestWinner, options) {
    const {showHeading = true, showTime = true, linkTo, linkText} = options;

    const latestWinnerComponent = document.querySelector('.latest-winner');
    const {etherscan_base} = GAME_DATA;

    if (!latestWinner) return;

    latestWinnerComponent.innerHTML = '';
    latestWinnerComponent.classList.remove('nested-section');

    const heading = document.createElement('h2');
    heading.classList.add(showHeading ? 'text-h2' : 'sr-only');
    heading.textContent = 'Latest winner';
    latestWinnerComponent.appendChild(heading);

    const jackpot = document.createElement('p');
    jackpot.classList.add('text-highlight');
    jackpot.innerHTML = `<strong>${formatNumber(latestWinner.amount)}</strong> NGNT`;
    latestWinnerComponent.appendChild(jackpot);

    const walletAddress = document.createElement('a');
    walletAddress.setAttribute('target', '_blank');
    walletAddress.setAttribute('href', `${etherscan_base}/address/${latestWinner.address}`);
    walletAddress.textContent = latestWinner.address;
    const walletAddressWrapper = document.createElement('p');
    walletAddressWrapper.appendChild(walletAddress);
    latestWinnerComponent.appendChild(walletAddressWrapper);

    if (showTime) {
        const time = document.createElement('time');
        const date = new Date(latestWinner.createdAt);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        time.textContent = date.toLocaleString('en-US', dateOptions);
        time.setAttribute('datetime', latestWinner.createdAt);
        const timeWrapper = document.createElement('p');
        timeWrapper.appendChild(time);
        latestWinnerComponent.appendChild(timeWrapper);
    }

    latestWinnerComponent.appendChild(document.createElement('br'));

    const actionButton = document.createElement('a');
    actionButton.setAttribute('href', linkTo || `${etherscan_base}/tx/${latestWinner.hash}`)
    actionButton.setAttribute('target', '_blank');
    actionButton.classList.add('button');
    actionButton.textContent = linkText || 'View transaction';
    latestWinnerComponent.appendChild(actionButton);
}

function showPaginationLinks(list, listComponent, render) {
    if (!list.hasNextPage && !list.hasPrevPage) return;

    function handleNewPage(newList) {
        render(newList);
        showPaginationLinks(newList, listComponent, render);

        listComponent.firstElementChild.scrollIntoView({behavior: 'smooth', block: 'center'});
        setTimeout(() => {
            focusElement(listComponent.firstElementChild);
        }, 500);
    }
    
    const paginationComponent = document.createElement('div');
    paginationComponent.classList.add('pagination');

    const previous = document.createElement('button');
    previous.classList.add('button', 'pagination__previous');
    if (!list.hasPrevPage) previous.setAttribute('disabled', 'disabled');
    previous.textContent = 'Previous';
    previous.addEventListener('click', () => {
        list.getPreviousPage()
            .then((res) => handleNewPage(res))
            .catch((reason) => alert(reason));
    });

    const next = document.createElement('button');
    next.classList.add('button', 'pagination__next');
    if (!list.hasNextPage) next.setAttribute('disabled', 'disabled');
    next.textContent = 'Next';
    next.addEventListener('click', () => {
        list.getNextPage()
            .then((res) => handleNewPage(res))
            .catch((reason) => alert(reason));
    });

    const currentPageDetails = document.createElement('small');
    currentPageDetails.classList.add('pagination__details');
    currentPageDetails.innerHTML = `Page ${list.page} of ${list.totalPages} <br>
        Showing ${list.offset + 1} - ${list.hasNextPage ? list.offset + list.limit : list.totalDocs} of ${list.totalDocs} items`;

    paginationComponent.appendChild(previous);
    paginationComponent.appendChild(currentPageDetails);
    paginationComponent.appendChild(next);

    listComponent.appendChild(paginationComponent);
}

export { 
    expandSection, collapseSection, showElements,
    hideElements, showLatestWinner, formatNumber,
    showPaginationLinks
};
