import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  Chain,
  fromHex,
  isHex,
  sha256,
  keccak256,
  WalletClient,
  parseAbi,
  toFunctionSelector,
  parseAbiParameters,
  encodeAbiParameters,
  publicActions,
  EIP1193Provider,
} from "viem";
import { anvil, base, baseSepolia } from "viem/chains";
import "viem/window";
import { envClient } from "./clientEnv";

//
// Models
//

export interface RulesOutput {
  data: RuleInfo[];
  total: number;
  page: number;
}

export interface RuleInfo {
  id: string;
  name: string;
  description: string;
  cartridge_id: string;
  created_by: string;
  created_at: number;
  input_index?: number;
  args: string;
  in_card: string;
  score_function: string;
  start?: number;
  end?: number;
  tags: string[];
  allow_tapes?: boolean;
  allow_in_card?: boolean;
  save_tapes?: boolean;
  save_out_cards?: boolean;
  tapes?: string[];
  deactivated?: boolean;
}

export interface CartridgeInfo {
  id: string;
  name: string;
  user_address: string;
  input_index?: number;
  authors?: string[];
  info?: InfoCartridge;
  original_info?: InfoCartridge;
  created_at: number;
  updated_at: number;
  cover?: string;
  active?: boolean;
  unlocked?: boolean;
  primary?: boolean;
  primary_id?: string;
  last_version?: string;
  versions?: string[];
  tapes?: string[];
  tags?: string[];
}

export interface InfoCartridge {
  name?: string;
  summary?: string;
  description?: string;
  version?: string;
  status?: string;
  tags?: string[];
  authors?: Author[];
  links?: string[];
  tapes?: string[];
}

export interface Author {
  name: string;
  link: string;
}
export interface GameplayData {
  outcard: Uint8Array;
  outhash: string;
  tape: Uint8Array;
  rivemuOnFinish: boolean;
}

export interface VerifyPayload {
  rule_id: string;
  outcard_hash: string;
  tape: string;
  claimed_score: number;
  tapes: string[];
  in_card: string;
}

export interface TapesOutput {
  data: TapeInfo[];
  total: number;
  page: number;
}
export interface TapeInfo {
  id: string;
  cartridge_id: string;
  rule_id: string;
  user_address: string;
  timestamp: number;
  input_index?: number;
  score?: number;
  rank?: number;
  verified?: boolean;
  in_card?: string;
  data?: string;
  out_card?: string;
  tapes?: string[];
}

//
// Chains configs and utils
//

const chains: Record<number, Chain> = {};
chains[baseSepolia.id] = baseSepolia;
chains[base.id] = base;
chains[anvil.id] = anvil;

export function getChain(chainId: number): Chain;
export function getChain(chainId: string): Chain;
export function getChain(chainId: number | string) {
  if (typeof chainId === "string") {
    if (!isHex(chainId)) return null;
    chainId = fromHex(chainId, "number");
  }

  const chain = chains[chainId];
  if (!chain) return null;

  return chain;
}

export const publicClient = createPublicClient({ 
    chain: getChain(envClient.NETWORK_CHAIN_ID),
    transport: http()
    //transport: http(envClient.NETWORK_CHAIN_ID == "0xAA36A7" ? "https://ethereum-sepolia-rpc.publicnode.com" : undefined)
})

const humanWorldAbi = [
    // Read-Only Functions
    "function getCartridgeInsertionModel() view returns ((address,bytes))",
    "function getTapeSubmissionModel(bytes32) view returns ((address,bytes))",
    "function getCartridgeOwner(bytes32) view returns (address)",
    "function getRegisteredModel(address) view returns (bool)",

    // Authenticated Functions
    "function setTapeSubmissionModel(bytes32 cartridgeId,address modelAddress, bytes config)",
    "function addInput(address _dapp, bytes payload)",
];

export const worldAbi = parseAbi(humanWorldAbi);

type EIP1193ProviderExt = Partial<EIP1193Provider> & {
  chainId?: `0x${string}`;
};

export function checkChain(client: WalletClient, eth?: EIP1193ProviderExt) {
  if (!eth) {
    eth = window.ethereum;
  }
  if (!eth) {
    const errorMessage =
      "MetaMask or another web3 wallet is not installed. Please install one to proceed.";
    throw new Error(errorMessage);
  }
  if (
    !eth.chainId ||
    !client.chain ||
    fromHex(eth.chainId, "number") != client.chain.id
  )
    throw new Error("Wallet on wrong chain");
}

export async function connectWalletClient() {
  // Check for window.ethereum
  // window.ethereum is an object provided by MetaMask or other web3 wallets
  const eth: EIP1193ProviderExt | undefined = window.ethereum;
  if (!eth) {
    const errorMessage =
      "MetaMask or another web3 wallet is not installed. Please install one to proceed.";
    throw new Error(errorMessage);
  }
  const transport = custom(eth as EIP1193Provider);

  // Declare a Wallet Client
  // This creates a wallet client using the chain and the custom transport
  const walletClient = createWalletClient({
    chain: getChain(envClient.NETWORK_CHAIN_ID),
    transport: transport,
  }).extend(publicActions);

  // Return the wallet client
  return walletClient;
}

export function connectPublicClient() {
  // Declare a Public Client
  const publicClient = createPublicClient({
    chain: getChain(envClient.NETWORK_CHAIN_ID),
    transport: http(),
  });

  // Return the public client
  return publicClient;
}

// const publicClient = connectPublicClient();

//
// utils
//

export function timeToDateUTCString(time: bigint) {
  const date = new Date(Number(time) * 1000);
  return formatDate(date);
}

export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
    timeZoneName: "short",
  };

  const dateString = date.toLocaleDateString("en-US", options);
  const [month_day, year, time] = dateString.split(",");
  const [month, day] = month_day.split(" ");
  const finalYear = year.substring(1);

  return `${month}/${day}/${finalYear}, ${time}`;
}

export function buildUrl(baseUrl: string, path: string) {
  let formatedBaseUrl = baseUrl;
  let formatedPath = path;

  if (baseUrl[baseUrl.length - 1] == "/") {
    formatedBaseUrl = baseUrl.slice(0, baseUrl.length - 1);
  }

  if (path.length > 0 && path[0] == "/") {
    formatedPath = path.slice(1);
  }

  return `${formatedBaseUrl}/${formatedPath}`;
}

//
// Rives utils
//

const RULE_ID_BYTES = 20;
const TRUNCATED_TAPE_ID_BYTES = 12;

export function truncateTapeHash(id: string): string {
  return id.startsWith("0x")
    ? id.slice(2, 2 + 2 * TRUNCATED_TAPE_ID_BYTES)
    : id.slice(0, 2 * TRUNCATED_TAPE_ID_BYTES);
}

export function ruleIdFromBytes(id: string): string {
  return id.startsWith("0x")
    ? id.slice(2, 2 + 2 * RULE_ID_BYTES)
    : id.slice(0, 2 * RULE_ID_BYTES);
}

export function calculateTapeId(ruleId: string, log: Uint8Array): string {
  return `${ruleIdFromBytes(ruleId)}${truncateTapeHash(keccak256(log))}`;
}

export function formatRuleIdToBytes(id: string): string {
  return `0x${ruleIdFromBytes(id)}${"0".repeat(2 * (32 - RULE_ID_BYTES))}`;
}

export async function getRule(ruleId: string): Promise<RuleInfo | null> {
  const res = await fetch(
    buildUrl(envClient.RIVES_NODE_URL, `inspect/core/rules?id=${ruleId}`),
  );
  const outJson = await res.json();

  if (outJson["status"] != "Accepted" || outJson["reports"].length == 0) {
    return null;
  }

  const out: RulesOutput = JSON.parse(
    fromHex(outJson["reports"][0].payload, "string"),
  );
  return out["data"][0];
}

export async function getCartridgeInfo(
  cartridgeId: string,
): Promise<CartridgeInfo | null> {
  const res = await fetch(
    buildUrl(
      envClient.RIVES_NODE_URL,
      `inspect/core/cartridge_info?id=${cartridgeId}`,
    ),
  );
  const outJson = await res.json();

  if (outJson["status"] != "Accepted" || outJson["reports"].length == 0) {
    return null;
  }

  const out: CartridgeInfo = JSON.parse(
    fromHex(outJson["reports"][0].payload, "string"),
  );
  return out;
}

export function generateEntropy(userAddress: string, ruleId: string): string {
  if (userAddress.length != 42 || !isHex(userAddress) || ruleId.length != 40) {
    return "";
  }

  return sha256(`${userAddress}${ruleId}`).slice(2);
}

export async function getContestLeaderboard(
  ruleId: string,
): Promise<TapesOutput | null> {
  // const res = await fetch(buildUrl(envClient.RIVES_NODE_URL,"inspect"), {
  //   method: 'POST',
  //   body: `core/rules?id=${ruleId}`
  // });

  const res = await fetch(
    buildUrl(
      envClient.RIVES_NODE_URL,
      `inspect/core/tapes?rule_id=${ruleId}&order_by=score&order_dir=desc&full=true`,
    ),
  );
  const outJson = await res.json();

  if (outJson["status"] != "Accepted" || outJson["reports"].length == 0) {
    console.log(`Request error: ${outJson["message"]}`);
    return null;
  }

  const out: TapesOutput = JSON.parse(
    fromHex(outJson["reports"][0].payload, "string"),
  );
  return out;
}

//
// Rives onchain utils
//

const verificationFunctionName = "core.register_external_verification";
// const verificationFunctionName = "core.verify";
const verificationParameters = "bytes32,bytes32,bytes,int,bytes32[],bytes";

const humanMiscAbi = ["function addInput(address _app, bytes payload) payable"];

const miscAbi = parseAbi(humanMiscAbi);

export async function submitGameplay(
  walletClient: WalletClient,
  inputData: VerifyPayload,
) {
  checkChain(walletClient);

  const inputPayload = encodeAbiParameters(
    parseAbiParameters(verificationParameters), // 'bytes32,bytes32,bytes,int,bytes32[],bytes'
    [
      inputData.rule_id as `0x${string}`,
      inputData.outcard_hash as `0x${string}`,
      inputData.tape as `0x${string}`,
      BigInt(inputData.claimed_score),
      inputData.tapes as `0x${string}`[],
      inputData.in_card as `0x${string}`,
    ],
  );

  const selector = toFunctionSelector(
    `${verificationFunctionName}(${verificationParameters})`,
  );
  const payload = selector + inputPayload.replace("0x", "");

  // const payloadTest = encodeFunctionData({
  //   abi: miscAbi,
  //   functionName: 'addInput',
  //   args: [envClient.APP_ADDR, payload],
  // })

  // const payload = encodeFunctionData({
  //   functionName: 'core.register_external_verification',
  //   abi: miscAbi,
  //   args: [inputData.rule_id, inputData.outcard_hash, inputData.tape, inputData.claimed_score, inputData.tapes, inputData.in_card],
  // })

  const publicClient = connectPublicClient();
  const [address] = await walletClient.requestAddresses();

  const { request } = await publicClient.simulateContract({
    account: address,
    address: envClient.WORLD_ADDR as `0x${string}`,
    abi: miscAbi,
    functionName: "addInput",
    args: [envClient.APP_ADDR, payload],
    value: BigInt(0),
  });
  const txHash = await walletClient.writeContract(request);

  await publicClient.waitForTransactionReceipt({ hash: txHash });
}


export async function getTapeGif(tape_id:string):Promise<string|null> {
    try {
        const response = await fetch(buildUrl(process.env.GIF_SERVER_URL || "", "gifs"),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([tape_id])
            }
        );

        if (!response.ok || response.status === 204) return null;

        const gif = await response.json();

        return gif[0];
    } catch (e) {
        console.log(`Error fetching gif: ${e}`)
        return null;
    }
}