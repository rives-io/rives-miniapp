import Header from '@components/Header';
import { envClient } from '@utils/clientEnv';
import { buildUrl, getCartridgeInfo, getRule } from '@utils/utils';
import ConsoleControls from './components/ConsoleControls';
import Gamepad from '@components/Gamepad';



const getCartridgeData = async (cartridgeId:string): Promise<Uint8Array|null> => {
    const response = await fetch(buildUrl(envClient.CARTRIDGES_URL, cartridgeId),
        {
            method: "GET",
            headers: {
                "Content-Type": "application/octet-stream",
            },
            mode: 'cors'
        }
    );
    const blob = await response.blob();
    const data = new Uint8Array(await blob.arrayBuffer());

    if (data.length > 0) return data;

    return null;
}

export default async function HomePage() {
  if (!process.env.NEXT_PUBLIC_CONTEST_ID) {
    return <div>ERROR: env NEXT_PUBLIC_CONTEST_ID not found.</div>
  }

  const ruleInfo = await getRule(process.env.NEXT_PUBLIC_CONTEST_ID);
  if (!ruleInfo) {
    return <div>{`Rule ${process.env.NEXT_PUBLIC_CONTEST_ID} not found!`}</div>;
  }

  const cartridgeInfoPromise = getCartridgeInfo(ruleInfo.cartridge_id);
  const cartridgeDatapromise = getCartridgeData(ruleInfo.cartridge_id);
  const [cartridgeInfo, cartridgeData] = await Promise.all([cartridgeInfoPromise, cartridgeDatapromise]);

  if (!cartridgeInfo) {
    return <div>{`Cartridge ${ruleInfo.cartridge_id} not found!`}</div>
  }

  if (!cartridgeData) {
    return <div>{`Data for cartridge ${ruleInfo.cartridge_id} not found!`}</div>
  }

  return (
    <main className='p-2'>
      <Header/>
      <ConsoleControls ruleInfo={ruleInfo} cartridgeInfo={cartridgeInfo} cartridgeData={cartridgeData}/>
      <Gamepad/>
    </main>
  );
}