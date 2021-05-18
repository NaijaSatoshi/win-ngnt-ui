
function getGasPrice() {
    return fetch('https://mainnet-02.gsn.openzeppelin.org/getaddr')
        .then((res) => res.json())
        .then((res) => res.MinGasPrice)
        .catch(() => 5000000000)
        .then((gasPrice) => gasPrice + 1000000000);
}

export { getGasPrice };
