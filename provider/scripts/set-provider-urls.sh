#!/bin/bash

read -r -d '' FILE << EOM
{
  "MAINNET_PROVIDER": "$MAINNET_PROVIDER",
  "OPTIMISM_PROVIDER": "$OPTIMISM_PROVIDER",
  "BSC_PROVIDER": "$BSC_PROVIDER",
  "GNOSIS_PROVIDER": "$GNOSIS_PROVIDER",
  "POLYGON_PROVIDER": "$POLYGON_PROVIDER",
  "ZKSYNC_PROVIDER": "$ZKSYNC_PROVIDER",
  "ZKEVM_PROVIDER": "$ZKEVM_PROVIDER",
  "ARBITRUM_PROVIDER": "$ARBITRUM_PROVIDER",
  "CELO_PROVIDER": "$CELO_PROVIDER",
  "AVALANCHE_PROVIDER": "$AVALANCHE_PROVIDER",
  "BASE_SEPOLIA_PROVIDER": "$BASE_SEPOLIA_PROVIDER",
  "BASE_PROVIDER": "$BASE_PROVIDER",
  "SEPOLIA_PROVIDER": "$SEPOLIA_PROVIDER",
  "LINEA_PROVIDER": "$LINEA_PROVIDER",
  "SCROLL_PROVIDER": "$SCROLL_PROVIDER"
} 
EOM

echo $FILE | yarn wrangler secret:bulk
