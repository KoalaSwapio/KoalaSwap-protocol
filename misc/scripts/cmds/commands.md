# Command Line Reference

## Overview

This document outlines the available command-line tools for managing the protocol's operational and governance functions.

## Table of Contents

- [General Commands](#general-commands)
  - [fetchOperationalStatus](#fetch-operational-status)
- [Ops Timelock Commands](#ops-timelock-commands)
  - [updateOpsTimelockDelay](#update-ops-delay)
- [Treasury Timelock Commands](#treasury-timelock-commands)
  - [transferGoverance](#transfer-governance)
  - [emergencyHalt](#emergency-halt)
  - [restoreOperations](#restore-operations)
  - [updateTreasuryTimelockDelay](#update-treasury-delay)

## General Commands

### Fetch Operational Status

Retrieves the current status of the hot path and safe mode by analyzing on-chain events.

```bash
npx hardhat fetchOperationalStatus --from <startingBlock> --network <network>
```

| Parameter | Description |
|-----------|-------------|
| `startingBlock` | Block number to start event fetching |
| `network` | Target network for the operation |

## Ops Timelock Commands

### Update Ops Delay

Modifies the timelock delay period for operational changes.

```bash
npx hardhat updateOpsTimelockDelay --delay <newDelayInSeconds> --network <network>
```

| Parameter | Description |
|-----------|-------------|
| `newDelayInSeconds` | New timelock delay duration |
| `network` | Target network for the operation |

## Treasury Timelock Commands

### Transfer Governance

Transfers protocol governance to specified timelock addresses defined in `constants/addrs.ts`.

```bash
npx hardhat transferGoverance --network <network>
```

### Emergency Halt

Implements emergency security measures by:
- Disabling proxy contracts in CrocSwapDex
- Disabling swap operations in the hot path
- Maintaining "warm path" functionality for basic operations (mint/burn/harvest)

```bash
npx hardhat emergencyHalt --reason <reason> --network <network>
```

| Parameter | Description |
|-----------|-------------|
| `reason` | Justification for emergency halt |
| `network` | Target network for the operation |

### Restore Operations

Reverts emergency halt measures by re-enabling the hot path and disabling safe mode.

```bash
npx hardhat restoreOperations --network <network>
```

### Update Treasury Delay

Modifies the timelock delay period for treasury operations.

```bash
npx hardhat updateTreasuryTimelockDelay --delay <newDelayInSeconds> --network <network>
```

| Parameter | Description |
|-----------|-------------|
| `newDelayInSeconds` | New timelock delay duration |
| `network` | Target network for the operation |

---

**Note**: All commands require appropriate permissions and should be executed with caution in production environments.