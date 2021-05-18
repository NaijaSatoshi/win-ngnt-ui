const environment = process.env.ELEVENTY_ENV;

const game = {
    environment: environment,
    network_id: 4,
    network_name: "Rinkeby Test Network",
    ngnt_contract_address: "0x89c1551E998E53406265B0Bf9Bd25ecbdF353412",
    win_ngnt_contract_address: "0xf635321a3f8C02844890B125342FA791fe3e766d",
    ngnt_gsn_fee: 50,
    ticket_cost: 500,
    jackpot: 4500,
    total_tickets: 10,
    api_base: "https://win-ngnt-server-staging.herokuapp.com",
    etherscan_base: "https://rinkeby.etherscan.io",
    max_user_tickets_per_game: 10
};

switch(environment) {
    case "staging":
        game.network_id = 1;
        game.network_name = "Main Ethereum Network (Mainnet)";
        game.ngnt_contract_address = "0x05bbed16620b352a7f889e23e3cf427d1d379ffe";
        game.win_ngnt_contract_address = "0x5CC3C71A77086875D5D56Fb512faAe93e8AC9B85";
        game.jackpot = 4500;
        game.total_tickets = 10;
        game.api_base = "https://win-ngnt-server-staging-main.herokuapp.com";
        game.etherscan_base = "https://etherscan.io";
        break;
    case "production":
        game.network_id = 1;
        game.network_name = "Main Ethereum Network (Mainnet)";
        game.ngnt_contract_address = "0x05bbed16620b352a7f889e23e3cf427d1d379ffe";
        game.win_ngnt_contract_address = "0x0d43D69d8a5580c9B9f736B9476440ef9578Cbc7";
        game.jackpot = 110000;
        game.total_tickets = 250;
        game.api_base = "https://win-ngnt-server.herokuapp.com";
        game.etherscan_base = "https://etherscan.io";
        break;
}

module.exports = game;
