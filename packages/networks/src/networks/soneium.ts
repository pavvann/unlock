import { NetworkConfig, HookType } from '@unlock-protocol/types'

export const soneium: NetworkConfig = {
  chain: 'Soneium',
  description:
    'Soneium is an Ethereum Layer 2 network, built by Sony Block Solutions Labs',
  explorer: {
    name: 'Astar zkEVM (Startale)',
    urls: {
      address: (address) => `https://soneium.blockscout.com/address/${address}`,
      base: `https://soneium.blockscout.com/`,
      token: (address, holder) =>
        `https://soneium.blockscout.com/token/${address}?a=${holder}`,
      transaction: (hash) => `https://soneium.blockscout.com/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
    ],
  },
  id: 1868,
  isTestNetwork: false,
  multisig: '',
  name: 'Soneium',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.soneium.org/',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.soneium.org/',
  startBlock: 3938991,
  subgraph: {
    endpoint: '',
    graphId: '',
    networkName: '',
    studioName: '',
  },
  unlockAddress: '0x32E4C23E164B9C96689e823E5FBf966D66E4912d',
}

export default soneium
