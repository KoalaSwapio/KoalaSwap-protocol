import { BigNumber } from "ethers";

const CREATE2_SALTS = new Map<string, string>();

CREATE2_SALTS.set(
  "0x73511669fd4de447fed18bb79bafeac93ab7f31f",
  "0x6784dbbd6e38a55bce13da3fb1e54f646fce9f411916b1f835e1054a790367d9"
);

CREATE2_SALTS.set(
  "0x25662C94D28DA775C4E4FDCA987B14D704B4b349".toLowerCase(),
  "0xaa648ca9a669467563048f9854d0c61d261957924a3753296908131cee781714"
);

/**
 * @title CREATE2 Salt Entry
 * @notice ChainId: 0xafa
 * @dev Purpose: CREATE2 salt for deterministic CrocDeployer address
 * @dev Generated: 2024-11-17T12:22:47.734Z
 * @param Key Deployer address used to generate salt
 * @param Value keccak256 hash of the deployer address
 */
CREATE2_SALTS.set(
  "0xdbec288199e50cf0c9ebeb2f3035c9358aaec16f",
  "0x261099080c2043154e6be67071ca795b2630f231a8229a5de789af0051819c6c"         
);

export function mapSalt(deployerAddr: string): BigNumber {
  const lookup = CREATE2_SALTS.get(deployerAddr.toLowerCase());
  if (!lookup) {
    throw new Error(`No salt found for ${deployerAddr}`);
  }
  return BigNumber.from(lookup);
}
