# Local Contracts

In order to test locally, we need to deploy local versions of thw NGNT and WinNGNT contracts.

### Prerequisites

1. [OpenZeppelin CLI](https://www.npmjs.com/package/@openzeppelin/cli)
1. [Truffle](https://www.trufflesuite.com/truffle)
1. [Ganache](https://www.trufflesuite.com/ganache)

Make sure Ganache is setup to the following parameters:
- host: 127.0.0.1
- port: 8545
- network_id: (anything)


### Deploying the NGNT Contract

1. Clone contract repository
1. Run `npm install`
1. Run `oz create`

```bash
? Pick a contract to instantiate: NGNT

? Pick a network development
✓ Contract NGNT deployed
✓ Contract LimitedUpgradesProxyAdmin deployed
✓ Contract V1 deployed
All contracts have been deployed

? Call a function to initialize the instance after creating it? Yes

? Select which function 
initialize(_name: string, _symbol: string, _currency: string, _decimals: uint8, _masterMinter: address, _paus
er: address, _blacklister: address, _owner: address, _gsnFee: uint256)

? _name (string): NGNT
? _symbol (string): NGNT
? _currency (string): Naira
? _decimals (uint8): 2
? _masterMinter (address): get_address_from_ganache
? _pauser (address): get_address_from_ganache
? _blacklister (address): get_address_from_ganache
? _owner (address): get_address_from_ganache
? _gsnFee (uint256): 2000
```

1. Get contract address from console
1. Get ABI from `build/contracts/NGNT.json`


### Deploying the WinNGNT Contract

1. Clone contract repository
1. Run `npm install`

Add `.env` file to project root

```
NODE_ENV=development
NGNT_CONTRACT_ADDRESS=contract_address_here
```

1. Run `truffle compile`
1. Run `truffle migrate`
1. Get contract address from console
1. Get ABI from `build/contracts/WinNGNT.json`


### Change MetaMask Network ID

Change to Ganache network
