# Validate Deployments Script
This script is used to validate the deployment of the Croc contracts by comparing the deployed bytecode to the on-chain bytecode.

## How it works
The script starts by importing two functions from the ../libs/chain module: initProvider and validateDeploy.

It then initializes a provider using the initProvider function with a specific deploymnetChainId. This function returns an object containing the addresses of the deployed contracts (addrs) and the initialized provider.

The validate function is defined. This function is responsible for validating the deployment of the contracts.

Inside the validate function, it first logs a message indicating that it's starting to validate the core contracts.

It then creates an array of promises, each promise being a call to the validateDeploy function with the address of a contract, the name of the contract, and the provider. Some contracts also receive the address of the dex contract as an additional argument.

It uses Promise.all to wait for all the promises to resolve. This means it's waiting for all the contracts to be validated.

It then logs a message indicating that it's starting to validate the peripheral contracts and repeats the process for these contracts.

Finally, it calls the validate function to start the validation process.

## How to use it
To use this script, you would need to have the ../libs/chain module and the deployed contracts store in the addrs object. You would also need to replace the deploymnetChainId with the chain ID of the network where your contracts are deployed.

Once you have these, you can simply run the script. It will log messages to the console indicating the progress of the validation. If there are any discrepancies between the deployed bytecode and the on-chain bytecode, the validateDeploy function should throw an error.

```bash
npx hardhat run misc/scripts/validateDeploys.ts
```