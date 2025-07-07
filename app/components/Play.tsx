"use client"

import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';

import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount } from 'wagmi';

import gameGIF from "@public/game.gif";
import { CartridgeInfo, generateEntropy, RuleInfo } from '@utils/utils';
import Gamepad from '@components/Gamepad';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';
import Rivemu, { RivemuRef } from '@components/Rivemu';

enum GAME_STATE {
  OFF,
  RUNNING,
  PAUSED
}

function Play({ruleInfo, cartridgeInfo, cartridgeData}:{ruleInfo:RuleInfo, cartridgeInfo:CartridgeInfo, cartridgeData:Uint8Array<ArrayBufferLike>}) {
  const [gameState, setGameState] = useState(GAME_STATE.OFF);

  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const rivemuRef = useRef<RivemuRef>(null);

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);


  useEffect(() => {
    if (!address || !rivemuRef.current) return;
    handleStart();
  }, [rivemuRef, address])

  const handleStart = () => {
    rivemuRef.current?.start();
    setGameState(GAME_STATE.RUNNING);
  }

  const handlePause = () => {
    if (gameState == GAME_STATE.RUNNING) {
      rivemuRef.current?.setSpeed(0);
      setGameState(GAME_STATE.PAUSED);
    } else if (gameState == GAME_STATE.PAUSED) {
      rivemuRef.current?.setSpeed(1.0);
      setGameState(GAME_STATE.RUNNING);
    }
  }

  return (
    <div>
      {
        isConnected && address?
          <div className='relative'>
            <Rivemu 
              ref={rivemuRef}
              cartridge_data={cartridgeData}
              args={ruleInfo.args}
              entropy={generateEntropy(address, ruleInfo.id)}
              rivemu_on_frame={() => null}
              rivemu_on_begin={() => null}
              rivemu_on_finish={() => null}
            />

            {
              gameState == GAME_STATE.PAUSED?
                <div className='absolute top-1/2 w-full text-center bg-black animate-pulse pixelated-font'>PAUSED - press "PAUSE" again to resume</div>
              :
                <></>
            }

          </div>
        :
          <div className='emulator-screen'>
            <div className='w-full h-full relative'>
              <Image src={gameGIF} alt={'game gif'} fill/>
            </div>
          </div>
      }
      <div className='flex justify-center'>
        <span className='pixelated-font text-xs'>RISC-V Verifiable Entertainment System</span>
      </div>

      <div className='flex justify-center'>
        <span className='pixelated-font'>{cartridgeInfo.name} - {ruleInfo.name}</span>
      </div>

      {
        isConnected && address?
          <>
            <div className='flex justify-center gap-2 py-4'>
              <div className='flex flex-col items-center'>
                <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800' onClick={handlePause}></button>
                <span className='pixelated-font text-[8px]'>Pause</span>
              </div>

              <div className='flex flex-col items-center'>
                <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800' onClick={handleStart}></button>
                <span className='pixelated-font text-[8px]'>Restart</span>
              </div>

              <div className='flex flex-col items-center'>
                <button className='bg-gray-700 w-10 h-4 rounded-lg'></button>
                <span className='pixelated-font text-[8px]'>Leaderboard</span>
              </div>

              <div className='flex flex-col items-center'>
                <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800'></button>
                <span className='pixelated-font text-[8px]'>Help</span>
              </div>
            </div>
            <Gamepad/>
          </>
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