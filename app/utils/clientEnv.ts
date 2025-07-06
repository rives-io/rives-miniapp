import { str, envsafe, url } from 'envsafe';

export const envClient = envsafe({
  APP_ADDR: str({
    input: process.env.NEXT_PUBLIC_APP_ADDR,
    desc: "Cartesi app ETH address."
  }),
  WORLD_ADDR: str({
      input: process.env.NEXT_PUBLIC_WORLD_ADDR,
      desc: "Rives World ETH address."
    }),
  RIVES_NODE_URL: url({
    input: process.env.NEXT_PUBLIC_RIVES_NODE_URL,
    desc: "Rives Catesi rollups node URL."
  }),
  NETWORK_CHAIN_ID: str({
    input: process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID,
    desc: "Network ChainId (in hex) where the Cartesi DApp was deployed."
  }),
  CONTEST_ID: str({
    input: process.env.NEXT_PUBLIC_CONTEST_ID,
    desc: "Network ChainId (in hex) where the Cartesi DApp was deployed."
  }),
  CARTRIDGES_URL: url({
    input: process.env.NEXT_PUBLIC_CARTRIDGES_URL,
    desc: "Cartridges URL."
  }),
  TAPES_URL: url({
    input: process.env.NEXT_PUBLIC_TAPES_URL,
    desc: "Tapes URL."
  }),
  RIVES_URL: url({
    input: process.env.NEXT_PUBLIC_RIVES_URL,
    desc: "Rives URL."
  }),
  EMULATOR_URL: url({
    input: process.env.NEXT_PUBLIC_EMULATOR_URL,
    desc: "Rives URL."
  }),
})
