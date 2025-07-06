import Header from './components/Header';
import Play from './components/Play';
import { getCartridgeInfo, getRule } from './utils/utils';

export default async function HomePage() {
  if (!process.env.NEXT_PUBLIC_CONTEST_ID) {
    return <div>ERROR: env NEXT_PUBLIC_CONTEST_ID not found.</div>
  }

  const ruleInfo = await getRule(process.env.NEXT_PUBLIC_CONTEST_ID);
  if (!ruleInfo) {
    return <div>{`Rule ${process.env.NEXT_PUBLIC_CONTEST_ID} not found!`}</div>;
  }

  const cartridgeInfo = await getCartridgeInfo(ruleInfo.cartridge_id);
  if (!cartridgeInfo) {
    return <div>{`Cartridge ${ruleInfo.cartridge_id} not found!`}</div>
  }

  return (
    <main className='p-2'>
      <Header/>
      <Play ruleInfo={ruleInfo} cartridgeInfo={cartridgeInfo}/>
    </main>
  );
}