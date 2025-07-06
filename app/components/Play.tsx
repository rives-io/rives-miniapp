"use client"

import React from 'react';
import { useEffect } from 'react';
import Image from 'next/image';

import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount } from 'wagmi';

import gameGIF from "@/public/game.gif";
import { buildUrl, CartridgeInfo, RuleInfo } from '@/utils/utils';
import Gamepad from './Gamepad';
import { envClient } from '@/utils/clientEnv';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';


function Play({ruleInfo, cartridgeInfo}:{ruleInfo:RuleInfo, cartridgeInfo:CartridgeInfo}) {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div>
      <div id='emulator-screen'>
        {
          isConnected && address?
            <iframe
              id="emulator-iframe"
              src={
                `${envClient.EMULATOR_URL}/#simple=true` +
                `&cartridge=${buildUrl(envClient.CARTRIDGES_URL, cartridgeInfo.id)}` +
                `&args=${ruleInfo.args}` +
                `&entropy=${address}`
              }
              className="w-full h-full overflow-hidden border-none"
            ></iframe>
          :
            <div className='w-full h-full relative'>
              <Image src={gameGIF} alt={'game gif'} fill/>
            </div>
        }
      </div>
      <div className='flex justify-center'>
        <span className='pixelated-font text-xs'>RISC-V Verifiable Entertainment System</span>
      </div>

      <div className='flex justify-center'>
        <span className='pixelated-font'>{cartridgeInfo.name} - {ruleInfo.name}</span>
      </div>

      {
        isConnected && address?
          <Gamepad/>
        :
        <div className="flex justify-center items-center h-64">
          <Wallet className="base-blue rounded-xl">
            <ConnectWallet>
                <Name className="text-inherit" />
            </ConnectWallet>
          </Wallet>
        </div>
      }
      
    </div>
  )
}

export default Play