"use client"

import React, { useContext, useRef } from 'react';
import { useEffect } from 'react';

import { useAccount } from 'wagmi';

import { generateEntropy, RuleInfo } from '@utils/utils';
import Rivemu, { RivemuRef } from '@components/Rivemu';

import { COMMAND, GAME_STATE, GameStateContext } from '@/app/providers/GameStateProvider';


function Play({ruleInfo, cartridgeData}:{ruleInfo:RuleInfo, cartridgeData:Uint8Array<ArrayBufferLike>}) {
  const { gameState, setGameState, gameCommand, setGameCommand } = useContext(GameStateContext);

  const { address } = useAccount();
  const rivemuRef = useRef<RivemuRef>(null);


  useEffect(() => {
    if (!address || !rivemuRef.current) return;
    rivemuRef.current?.start();
    setGameState(GAME_STATE.RUNNING);
  }, [rivemuRef, address])

  useEffect(() => {
    if (gameCommand === COMMAND.RESTART) {
      rivemuRef.current?.start();
      setGameState(GAME_STATE.RUNNING);
    } else if (gameCommand === COMMAND.PAUSE) {
      if (gameState === GAME_STATE.RUNNING) {
        rivemuRef.current?.setSpeed(0);
        setGameState(GAME_STATE.PAUSED);
      } else if (gameState === GAME_STATE.PAUSED) {
        rivemuRef.current?.setSpeed(1.0);
        setGameState(GAME_STATE.RUNNING);
      }
    }

    setGameCommand(COMMAND.NONE); // Reset command after processing
  }, [gameCommand]);

  if (!address) {
    throw new Error("Address is undefined!");
  }

  return (
    <div>
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
            <div className='absolute top-1/2 w-full text-center bg-black animate-pulse pixelated-font'>PAUSED - press 'PAUSE' again to resume</div>
          :
            <></>
        }
      </div>
    </div>
  )
}

export default Play