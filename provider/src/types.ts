export interface Env {
  ARBITRUM_PROVIDER: string
  AVALANCHE_PROVIDER: string
  BSC_PROVIDER: string
  CELO_PROVIDER: string
  GNOSIS_PROVIDER: string
  MAINNET_PROVIDER: string
  OPTIMISM_PROVIDER: string
  POLYGON_PROVIDER: string
  ZKSYNC_PROVIDER: string
  BASE_SEPOLIA_PROVIDER: string
  BASE_PROVIDER: string
  SEPOLIA_PROVIDER: string
  LINEA_PROVIDER: string
  ZKEVM_PROVIDER: string
  SCROLL_PROVIDER: string

  // Optional environment variable for configuring cache duration in seconds
  CACHE_DURATION_SECONDS?: string
}
