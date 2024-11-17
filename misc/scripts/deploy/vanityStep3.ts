/**
 * @title CrocSwapDex Governance Setup Script
 * @notice Deploys governance infrastructure (ColdPath, CrocPolicy) and transfers
 * CrocSwapDex control from CrocDeployer to CrocPolicy
 *
 * @dev This is step 3 of the deployment process. It deploys governance contracts,
 * installs the ColdPath proxy, and transfers control to enable governed operations.
 *
 *
 * Technical Details:
 * ----------------
 * 1. Deploys ColdPath contract for proxy functionality
 * 2. Deploys CrocPolicy contract for governance control
 * 3. Uses protocol command 21 to install ColdPath proxy
 * 4. Uses protocol command 20 to transfer control to policy contract
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads CrocDeployer
 * 2. Deploys ColdPath contract
 * 3. Deploys CrocPolicy contract
 * 4. Installs ColdPath proxy through protocol command
 * 5. Transfers DEX control to CrocPolicy contract
 * 6. Outputs updated address registry with new contract addresses
 *
 * Requirements:
 * ------------
 * - CrocSwapDex must be deployed (from step 2)
 * - Deploying wallet must have authority rights on CrocDeployer
 * - Address registry must contain correct DEX and deployer addresses
 *
 * State Changes:
 * -------------
 * - Deploys new ColdPath contract
 * - Deploys new CrocPolicy contract
 * - Installs ColdPath proxy in CrocSwapDex
 * - Transfers DEX control from CrocDeployer to CrocPolicy
 * - Updates address registry with new contract addresses
 * - @dev The address registry in misc/constants/addrs.ts must be manually updated
 *   with the new dex address for subsequent deployment steps
 *
 * Gas Considerations:
 * -----------------
 * - Multiple transactions required:
 *   1. ColdPath deployment
 *   2. CrocPolicy deployment
 *   3. ColdPath proxy installation (1,000,000 gas limit)
 *   4. Control transfer (1,000,000 gas limit)
 *
 * Example usage:
 *
 * # Deploy governance and transfer control on local hardhat network
 * npx hardhat run scripts/deploy/vanityStep3.ts --network localhost
 *
 * # Deploy governance and transfer control on mainnet
 * npx hardhat run scripts/deploy/vanityStep3.ts --network mainnet
 *
 */
import { ColdPath, CrocDeployer, CrocPolicy } from '../../../typechain';
import { BOOT_PROXY_IDX, COLD_PROXY_IDX } from '../../constants/addrs';
import { inflateAddr, initChain, refContract, traceContractTx } from '../../libs/chain';
import { AbiCoder } from '@ethersproject/abi';

const abi = new AbiCoder()

async function vanityDeploy() {
    let { addrs, chainId, wallet: authority } = initChain()

    const crocDeployer = await refContract("CrocDeployer", addrs.deployer, 
        authority) as CrocDeployer

    const coldPath = await inflateAddr("ColdPath", addrs.cold, authority) as ColdPath
    addrs.cold = coldPath.address

    const policy = await inflateAddr("CrocPolicy", addrs.policy, 
        authority, addrs.dex) as CrocPolicy
    addrs.policy = policy.address

    console.log(`Updated addresses for ${chainId}`, addrs)

    let cmd;

    // Install cold path proxy, so we can transfer ownership
    cmd = abi.encode(["uint8", "address", "uint16"], [21, addrs.cold, COLD_PROXY_IDX])
    await traceContractTx(crocDeployer.protocolCmd(addrs.dex, BOOT_PROXY_IDX, cmd, true, {"gasLimit": 1000000}), 
        "Cold Path Install")

    cmd = abi.encode(["uint8", "address"], [20, policy.address])
    await traceContractTx(crocDeployer.protocolCmd(addrs.dex, COLD_PROXY_IDX, cmd, true, {"gasLimit": 1000000}), 
        "Transfer to Policy Contract")

    console.log(`Updated addresses for ${chainId}`, addrs)
}

vanityDeploy()
