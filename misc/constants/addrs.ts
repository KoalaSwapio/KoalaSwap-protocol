import { ethers } from "hardhat";

// Convention is to use empty string for pre-deployed contract
export interface CrocAddrs {
  dex: string;
  cold: string;
  warm: string;
  long: string;
  micro: string;
  hot: string;
  knockout: string;
  koCross: string;
  policy: string;
  query: string;
  impact: string;
  shell: string;
  policyShell: string;
  deployer: string;
  govern: CrocGovAddrs;
}

export interface CrocGovAddrs {
  multisigTreasury: string;
  multisigOps: string;
  multisigEmergency: string;
  timelockTreasury: string;
  timelockOps: string;
  timelockEmergency: string;
}

const emptryGovAddrs: CrocGovAddrs = {
  multisigTreasury: "",
  multisigOps: "",
  multisigEmergency: "",
  timelockTreasury: "",
  timelockOps: "",
  timelockEmergency: "",
};

const emptyAddrs: CrocAddrs = {
  dex: "",
  cold: "",
  warm: "",
  long: "",
  micro: "",
  hot: "",
  knockout: "",
  koCross: "",
  policy: "",
  query: "",
  impact: "",
  shell: "",
  policyShell: "",
  deployer: "",
  govern: emptryGovAddrs,
};

// Mock used in local forks
const mockAddrs: CrocAddrs = {
  dex: "0xAAAAaAAa7A116286168fe3733f994062bc73CbF3",
  cold: "0xC469e7aE4aD962c30c7111dc580B4adbc7E914DD",
  warm: "",
  long: "",
  micro: "",
  hot: "",
  knockout: "",
  koCross: "",
  policy: "0x43ca3D2C94be00692D207C6A1e60D8B325c6f12f",
  query: "",
  impact: "",
  shell: "",
  policyShell: "",
  deployer: "0x73511669fd4de447fed18bb79bafeac93ab7f31f",
  govern: emptryGovAddrs,
};

// Mainnet
const mainnetAddrs: CrocAddrs = {
  dex: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688",
  cold: "0xF8fe6fA0D9c778F8d814c838758B57a9Cf1dD710",
  warm: "0xd268767BE4597151Ce2BB4a70A9E368ff26cB195",
  long: "0x13242bD05B1d3D6b79ADA2b28678C235F3f2389B",
  micro: "0x396d435f5d0756c6f7EdD82E6C67BDc6C093985d",
  hot: "0xa9Dd587ad17Aed82CAc5596B16DCc9DeFEc885Cb",
  knockout: "0x7F5D75AdE75646919c923C98D53E9Cc7Be7ea794",
  koCross: "0x509DE582af6B4658a1830f7882077FBA5523C957",
  policy: "0x0b6CD0ECb176cb39Ad99B3A0E4294167a80B68a3",
  query: "0xCA00926b6190c2C59336E73F02569c356d7B6b56",
  impact: "0x3e3EDd3eD7621891E574E5d7f47b1f30A994c0D0",
  shell: "",
  policyShell: "",
  deployer: "0x25662C94D28DA775C4E4FDCA987B14D704B4b349",
  govern: {
    multisigTreasury: "0xDBD8D583a18C99e7f5191351E6E739AF8e62DaC3",
    multisigOps: "0x9fACdcfb3b58D85d0440aF292D64480Ad2503A6e",
    multisigEmergency: "0x803291D2581C17de29FecA7C64b309e241988e2C",
    timelockTreasury: "0x7237C120FCA2081f1A36AB933B065389174962B7",
    timelockOps: "0x41114A13230625A2735FaA7183e528Ed2538cB7b",
    timelockEmergency: "0x7237C120FCA2081f1A36AB933B065389174962B7",
  },
};

// Goerli
/* const goerliAddrs: CrocAddrs = {
    dex: "0xfafcd1f5530827e7398b6d3c509f450b1b24a209",
    cold: "0xb2ae163293c82dcf36b0ce704591edc2f9e2608d",
    warm: "0x01B180D35125D31B4057d9ac7F46687dA1cAEFab",
    long: "0x66d34e1486d0bad1a8ced5a8505a73d0cfd41a0a",
    micro: "0x323172539b1b0d9eddffbd0318c4d6ab45292843",
    hot: "0x141e224f461a85006b2ef051a7c1c290e449202a",
    knockout: "0x806859d4C974F9dCBB5f77e027062a02fC965987",
    koCross: "0xa7b87362b5b86f696a8027b409c20dba094744e2",
    policy: "0xaa391ee82f0c6b406e98ccd76d637cac2f712228",
    query: "0x93a4baFDd49dB0e06f3F3f9FddC1A67792F47518", 
    impact: "0x142BE02F2A3A27ecD6e2f18a43c2C234F372C831",
    shell: "0xdf2a97ae85e8ce33ad20ad2d3960fd92e8079861",
    policyShell: "",
    deployer: "",
    govern: emptryGovAddrs
}*/

const goerliAddrsDryRun: CrocAddrs = {
  dex: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688",
  cold: "0x0b6CD0ECb176cb39Ad99B3A0E4294167a80B68a3",
  warm: "0xd268767BE4597151Ce2BB4a70A9E368ff26cB195",
  long: "0x13242bD05B1d3D6b79ADA2b28678C235F3f2389B",
  micro: "0x323172539b1b0d9eddffbd0318c4d6ab45292843",
  hot: "0x41114A13230625A2735FaA7183e528Ed2538cB7b",
  knockout: "0x7F5D75AdE75646919c923C98D53E9Cc7Be7ea794",
  koCross: "0x509DE582af6B4658a1830f7882077FBA5523C957",
  policy: "0x62beAB7f90Fe2EFD230e61a95DD2c753f466AB13",
  query: "0xc2e1f740E11294C64adE66f69a1271C5B32004c8",
  impact: "0x3e3EDd3eD7621891E574E5d7f47b1f30A994c0D0",
  shell: "",
  policyShell: "",
  deployer: "0x25662C94D28DA775C4E4FDCA987B14D704B4b349",
  govern: {
    multisigTreasury: "0x78e80194528C5BbC1Bbce7f5A7e7B1A143200351",
    multisigOps: "0x2D2E5B97Acdea31efbf11b39AeA8dbd5B0c258F1",
    multisigEmergency: "0x53e3713543737Af4eCb1ad74563402C64e307f0D",
    timelockTreasury: "0xfd66C5FFF528e1855e498CD324520107885A5288",
    timelockOps: "0xeF7D040C5540feedD74BA8E5a5167b19c24C940d",
    timelockEmergency: "0xfd66C5FFF528e1855e498CD324520107885A5288",
  },
};

// Mainnet
const morphTestnetAddrs: CrocAddrs = {
  dex: "0xcd5f6Fa8d2f3DEAaf51b721dF0B109554D8853aF",
  cold: "0x6bd17F4e0a5FAD35FE067DDc9ED7E4236286C8a3",
  warm: "0x447B4ff02e87AF7f182a30F6C88d15d5Aa4B0945",
  long: "0x395Bf9702833A43208914bCb99a73AEdAd36d1Bd",
  micro: "0x06f53E3BabC31DB106e295B8E945990a01f09052",
  hot: "0x88DeD87cb3A8582Ec57a150B78c16680102C18D6",
  knockout: "0xc9381CA673C2E49596E3fD235bC99f4F3326285d",
  koCross: "0xc6E378fbA998c3Aa350cB1C6c857dF25610f51f0",
  policy: "0xdeaAc49f52d2043E70F00B9dFF15Dc4141214f9C",
  query: "0x248f259E685f6977C797E93c4FCC83cBE5556633",
  impact: "0x4e1E63eFf1D99414eafd9D4a2D6840A93311c680",
  shell: "",
  policyShell: "",
  deployer: "0x30f85668C4b4C5e99Eb2B415CcEFab59228295bC",
  govern: {
    multisigTreasury: "0x86D9709eF6614e3F10FEF0806C24d30368C8F0Ed",
    multisigOps: "0xfDDb1a444D4C362c1c235426737206fb34575f8a",
    multisigEmergency: "0xfDDb1a444D4C362c1c235426737206fb34575f8a",
    timelockTreasury: "0x5c983967ABCE6f03c153b31Ee3395c7B58Ece2Ef",
    timelockOps: "0x4Ba179aDf98FddEFac1BC05fc021bb23afB7aF47",
    timelockEmergency: "0x5c983967ABCE6f03c153b31Ee3395c7B58Ece2Ef",
  },
};

export let CROC_ADDRS = {
  "0x1": mainnetAddrs,
  "0x5": goerliAddrsDryRun,
  mock: mockAddrs,
  "0xafa": morphTestnetAddrs,
};

// Goerli
export let TOKEN_ADDRS = {
  "0x5": {
    eth: ethers.constants.AddressZero,
    dai: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
    usdc: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
  },
};

export let POOL_IDXS = {
  "0x5": 36000,
  "0x1": 420,
};

export const BOOT_PROXY_IDX = 0;
export const SWAP_PROXY_IDX = 1;
export const LP_PROXY_IDX = 2;
export const COLD_PROXY_IDX = 3;
export const LONG_PROXY_IDX = 4;
export const MICRO_PROXY_IDX = 5;
export const KNOCKOUT_LP_PROXY_IDX = 7;
export const FLAG_CROSS_PROXY_IDX = 3500;
export const SAFE_MODE_PROXY_PATH = 9999;
