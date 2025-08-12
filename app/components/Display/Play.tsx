"use client"

import React, { useContext, useRef, useState } from 'react';
import { useEffect } from 'react';

import { useAccount } from 'wagmi';

import { generateEntropy, RuleInfo } from '@utils/utils';
import Rivemu, { RivemuRef } from '@components/Rivemu';

import { COMMAND, GAME_STATE, GameStateContext } from '@/app/providers/GameStateProvider';
import { GameplayStateContext, GIF_FRAME_FREQ } from '@/app/providers/GameplayStateProvider';
import { Parser } from 'expr-eval';


function Play({ruleInfo, cartridgeData}:{ruleInfo:RuleInfo, cartridgeData:Uint8Array<ArrayBufferLike>}) {
  const { gameState, setGameState, gameCommand, setGameCommand } = useContext(GameStateContext);
  const { setGameplayOwner, setGameplayLog, setGifResolution, addGifFrame } = useContext(GameplayStateContext);

  const { address } = useAccount();
  const rivemuRef = useRef<RivemuRef>(null);

  const page = typeof window !== "undefined"? window.location.href:null;
  
  const [currScore, setCurrScore] = useState<number>();
  const [lastFrameIndex, setLastFrameIndex] = useState<number>();

  const parser = new Parser();
  const scoreFunctionEvaluator = ruleInfo?.score_function? parser.parse(ruleInfo.score_function):null;
  let decoder = new TextDecoder("utf-8");


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


  const rivemuOnFrame = function (
      outcard: ArrayBuffer,
      frame: number,
      cycles: number,
      fps: number,
      cpu_cost: number,
      cpu_speed: number,
      cpu_usage: number,
      cpu_quota: number
  ) {
    if (lastFrameIndex == undefined || frame >= lastFrameIndex + fps/GIF_FRAME_FREQ) {
      const canvas = document.getElementById("canvas");
      if (!canvas) return;

      const frameImage = (canvas as HTMLCanvasElement).toDataURL('image/jpeg');
      addGifFrame(frameImage);
      setLastFrameIndex(frame);
    }
    
    if (scoreFunctionEvaluator && decoder.decode(outcard.slice(0,4)) == 'JSON') {
      const outcard_str = decoder.decode(outcard);
      const outcard_json = JSON.parse(outcard_str.substring(4));
      setCurrScore(scoreFunctionEvaluator.evaluate(outcard_json));
    }

    if (page && page != window.location.href) {
      // rivemuRef will be null, call Rivemu directly
      
      // @ts-ignore:next-line
      Module.ccall('rivemu_stop')
    }
  };

  const rivemuOnBegin = function (width: number, height: number, target_fps: number, total_frames: number, info_data: Uint8Array) {
    console.log("rivemu_on_begin");
    setGameplayLog(null);
    setGameplayOwner(address || "0x");
    setGifResolution(width, height);

    //setTimeout(() => {rivemuRef.current?.stop();}, 5000); // 5 seconds
  };

  const rivemuOnFinish = function (
    rivlog: ArrayBuffer,
    outcard: ArrayBuffer,
    outhash: string
  ) {
    rivemuRef.current?.stop();
    console.log("rivemu_on_finish")
    let score: number | undefined = undefined;
    if (scoreFunctionEvaluator && decoder.decode(outcard.slice(0,4)) == 'JSON') {
        const outcard_str = decoder.decode(outcard);
        const outcard_json = JSON.parse(outcard_str.substring(4));
        score = scoreFunctionEvaluator.evaluate(outcard_json);
    }
    setGameplayLog(
      {
        cartridge_id: ruleInfo.cartridge_id,
        log: new Uint8Array(rivlog),
        outcard: {
            value: new Uint8Array(outcard),
            hash: outhash
        },
        score,
        rule_id: ruleInfo.id,
        tapes: undefined,
        in_card: undefined
      }
    );
  };


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
          rivemu_on_frame={rivemuOnFrame}
          rivemu_on_begin={rivemuOnBegin}
          rivemu_on_finish={rivemuOnFinish}
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