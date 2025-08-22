"use client"


import React, { useContext, useEffect } from 'react'
import Image from 'next/image';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount } from 'wagmi';
import { Transition } from '@headlessui/react';
import { sdk } from '@farcaster/miniapp-sdk';

import { CONSOLE_STATE, ConsoleStateContext } from '@/app/providers/ConsoleStateProvider';
import Play from '@/app/components/Display/Play';
import { CartridgeInfo, RuleInfo } from '@/app/utils/utils';
import gameGIF from "@public/game.gif";
import { COMMAND, GAME_STATE, GameStateContext } from '@/app/providers/GameStateProvider';
import { GameplayStateContext } from '@/app/providers/GameplayStateProvider';
import Help from './Display/Help';
import Leaderboard from './Display/Leaderboard';
import Submit from './Display/Submit';


function ConsoleControls({ruleInfo, cartridgeInfo, cartridgeData}:
{ruleInfo:RuleInfo, cartridgeInfo:CartridgeInfo, cartridgeData:Uint8Array<ArrayBufferLike>}) {
    const { consoleState, setConsoleState } = useContext(ConsoleStateContext);
    const { gameState, setGameCommand } = useContext(GameStateContext);
    const { gameplay } = useContext(GameplayStateContext);
    
    const { setFrameReady, isFrameReady } = useMiniKit();
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (!isFrameReady) {
            sdk.actions.ready({ disableNativeGestures: true })
             .then(() =>setFrameReady());
        }
    }, [setFrameReady, isFrameReady]);

    useEffect(() => {
        // set console state to submit if
        // there is a gameplay to be send
        if (gameplay) {
            setConsoleState(CONSOLE_STATE.SUBMIT);
        } else {
            setConsoleState(CONSOLE_STATE.PLAY);
            setGameCommand(COMMAND.RESTART);
        }
    }, [gameplay])

    const handlePause = () => {
        if (consoleState === CONSOLE_STATE.PLAY) {
            setGameCommand(COMMAND.PAUSE);
        }
    }

    const handleRestart = () => {
        if (consoleState === CONSOLE_STATE.PLAY) {
            setGameCommand(COMMAND.RESTART);
        }
    }

    const handleLeaderboard = () => {
        // pause the game if it's running
        if (gameState === GAME_STATE.RUNNING) {
            handlePause();
        }

        if (consoleState === CONSOLE_STATE.LEADERBOARD) {
            setConsoleState(CONSOLE_STATE.PLAY);
        } else {
            setConsoleState(CONSOLE_STATE.LEADERBOARD);
        }
    }

    const handleHelp = () => {
        // pause the game if it's running
        if (gameState === GAME_STATE.RUNNING) {
            handlePause();
        }

        if (consoleState === CONSOLE_STATE.HELP) {
            setConsoleState(CONSOLE_STATE.PLAY);
        } else {
            setConsoleState(CONSOLE_STATE.HELP);
        }
    }


    return (
        <div className='relative'>
            {
                isConnected && address?
                    <div>
                        <div className='border border-black bg-black rounded-sm'>
                            <Play ruleInfo={ruleInfo} cartridgeData={cartridgeData}/>
                        </div>

                        <Transition show={consoleState === CONSOLE_STATE.HELP}
                         enter="transition-opacity duration-300"
                         enterFrom="opacity-0"
                         enterTo="opacity-100"
                         leave="transition-opacity duration-200"
                         leaveFrom="opacity-100"
                         leaveTo="opacity-0"
                        >
                            <div className='absolute top-0 left-0 z-10 w-full'>
                                <Help cartridge_desc={cartridgeInfo.info?.description} 
                                rule_desc={ruleInfo.name === "default" ? "Standard Contest" : ruleInfo.description}
                                />
                            </div>
                        </Transition>

                        <Transition show={consoleState === CONSOLE_STATE.LEADERBOARD}
                         enter="transition-opacity duration-300"
                         enterFrom="opacity-0"
                         enterTo="opacity-100"
                         leave="transition-opacity duration-200"
                         leaveFrom="opacity-100"
                         leaveTo="opacity-0"
                        >
                            <div className='absolute top-0 left-0 z-10 w-full'>
                                <Leaderboard ruleInfo={ruleInfo} />
                            </div>
                        </Transition>

                        <Transition show={consoleState === CONSOLE_STATE.SUBMIT}
                         enter="transition-opacity duration-300"
                         enterFrom="opacity-0"
                         enterTo="opacity-100"
                         leave="transition-opacity duration-200"
                         leaveFrom="opacity-100"
                         leaveTo="opacity-0"
                        >
                            <div className='absolute top-0 left-0 z-10 w-full'>
                                <Submit />
                            </div>
                        </Transition>
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
                    <div className='flex justify-center gap-2 py-4'>
                        <div className='flex flex-col items-center'>
                        <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800' 
                        onClick={handlePause}></button>
                        <span className='pixelated-font text-[8px]'>Pause</span>
                        </div>

                        <div className='flex flex-col items-center'>
                        <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800' 
                        onClick={handleRestart}></button>
                        <span className='pixelated-font text-[8px]'>Restart</span>
                        </div>

                        <div className='flex flex-col items-center'>
                        <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800' 
                        onClick={handleLeaderboard}></button>
                        <span className='pixelated-font text-[8px]'>Leaderboard</span>
                        </div>

                        <div className='flex flex-col items-center'>
                        <button className='bg-gray-700 w-10 h-4 rounded-lg active:bg-gray-800'
                        onClick={handleHelp}></button>
                        <span className='pixelated-font text-[8px]'>Help</span>
                        </div>
                    </div>
                :
                    <></>
            }


        </div>
    )
}

export default ConsoleControls