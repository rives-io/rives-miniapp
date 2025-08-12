"use client"

import React, { useContext, useEffect, useRef, useState } from 'react'
import Image from "next/image"
import GIFEncoder from "gif-encoder-2";
import { toFunctionSelector, toHex, WalletClient } from 'viem';
import { GameplayStateContext } from '@/app/providers/GameplayStateProvider';
import { VerifyPayloadProxy } from '@/app/utils/backend-libs/core/ifaces';
import { formatRuleIdToBytes, getChain, publicClient, worldAbi } from '@/app/utils/utils';
import { models } from "@/app/utils/backend-libs/core/lib";
import rivesLogo from '@public/logo_cutted.png';
import { envClient } from '@/app/utils/clientEnv';
import { useAccount, useWalletClient } from 'wagmi';

function generateGif(frames: string[], width:number, height:number): Promise<string> {
    const encoder = new GIFEncoder(width, height, 'octree', true);
    encoder.setDelay(200);
    encoder.start();
    
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    let idx = 0;
    const addFrames = new Array<Promise<void>>();
    
    for (const frame of frames) {
        
        const p: Promise<void> = new Promise(resolveLoad => {
            const img = document.createElement("img");
            img.width = width;
            img.height = height;
            img.onload = () => {
                ctx?.drawImage(img,0,0,img.width,img.height);
                encoder.addFrame(ctx);
                resolveLoad();
            };
            img.src = frame;
        })
        addFrames.push(p);
        idx++;
    }
    return Promise.all(addFrames).then(() => {
        encoder.finish();
        const buffer = encoder.out.getData();
        if (buffer) {
            var binary = '';
            var len = buffer.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode( buffer[ i ] );
            }
            return window.btoa( binary );
        }
        return "";
    });
    
}

function Submit() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const walletClientRef = useRef<WalletClient|null>(null);

    const {player, gameplay, getGifParameters, clearGifFrames, setGameplayLog} = useContext(GameplayStateContext);
    const [gifImg, setGifImg] = useState("");
    const sendingRef = useRef(false);
    const submittedRef = useRef(false);
    const [submitResult, setSubmitResult] = useState<{success: boolean, messasge:string}|null>(null);
    
    useEffect(() => {
        if (gameplay) {
            const gifParameters = getGifParameters();
            if (gifParameters) {
                generateGif(gifParameters.frames, gifParameters.width, gifParameters.height).then(setGifImg)
            }
        }
    }, [gameplay])

    useEffect(() => {
        if (walletClient) {
            walletClientRef.current = walletClient;
        }
    }, [walletClient])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key == "x") {
                handleCancel();
            } else if (e.key === "z") {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // React automatically calls the function returned by useEffect when:
        //     The component is about to unmount, or
        //     The dependencies of the effect change (if there are any in the deps array)
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleCancel = async () => {
        if (sendingRef.current) return;

        setGameplayLog(null);
    }

    const handleSubmit = async () => {
        if (sendingRef.current) return;

        if (submittedRef.current) {
            setGameplayLog(null);
            return;
        }

        if (!walletClientRef.current) return console.log("No wallet connected");

        if (!gameplay){
            console.log("No gameplay data.");
            return;
        }

        const exporter = models['VerifyPayloadProxy'].exporter;
        if (!exporter) return;
        const abiTypes = models['VerifyPayloadProxy'].abiTypes;

        const inputData: VerifyPayloadProxy = {
            rule_id: formatRuleIdToBytes(gameplay.rule_id),
            outcard_hash: '0x' + gameplay.outcard.hash,
            tape: toHex(gameplay.log),
            claimed_score: gameplay.score || 0,
            tapes:gameplay.tapes||[],
            in_card:gameplay.in_card ? toHex(gameplay.in_card):'0x'
        };

        const functionPayload = exporter(inputData);
        const selector = toFunctionSelector(`core.register_external_verification(${abiTypes.join(',')})`);

        const payload = selector + functionPayload.replace('0x','');

        sendingRef.current = true;
        try {
            const { request } = await publicClient.simulateContract({
                account: address,
                address: envClient.WORLD_ADDR as `0x${string}`,
                abi: worldAbi,
                functionName: 'addInput',
                args: [envClient.APP_ADDR, payload],
                value: BigInt(0)
            });
            const txHash = await walletClientRef.current.writeContract(request);
        
            await publicClient.waitForTransactionReceipt( 
                { hash: txHash }
            );

            setSubmitResult({success: true, messasge: "Submited."});
            submittedRef.current = true;
        } catch (error) {
            console.log(error as Error)
            setSubmitResult({success: false, messasge: "Failed to submit gameplay."});
        }
        sendingRef.current = false;
    }

    return (
        <div className='emulator-screen bg-black text-white p-4 relative flex flex-col items-center'>
            <div className=' flex-1'>
                <h2 className={`pixelated-font text-xl`}>Submit Gameplay</h2>
                <div className='pixelated-font text-center'>Score: {gameplay?.score}</div>
            </div>

            <div className="w-[156px] h-[156px] relative">
                <Image fill
                    className='border-[#8b5cf6] border-2'
                    style={{objectFit: "cover"}}
                    src={"data:image/gif;base64," + gifImg}
                    alt={"Not found"}
                />
            </div>

            <div className='w-full p-4 flex-1'>
                {
                    sendingRef.current?
                        <div className="w-full h-full flex flex-col items-center text-white">
                            <Image width={156} className="animate-bounce" src={rivesLogo} alt='RiVES logo'/>
                            <span className="pixelated-font text-sm">Submitting...</span>
                        </div>
                    :
                        <>
                            {
                                submitResult?
                                    <div 
                                     className={`${submitResult.success? "text-green-500":"text-red-500"} pixelated-font text-sm text-center p-1`}>
                                        {submitResult.messasge}
                                    </div>
                                :
                                    <></>
                            }
                            <div className='flex h-full justify-center items-end gap-4'>
                                <div className={`${submitResult?.success? "hidden":""} flex gap-1`}>
                                    <div className='w-[25px] h-[25px] bg-gray-700 active:bg-gray-800 rounded-full flex justify-center items-center'
                                    >
                                        <span className='pixelated-font text-lg'>X</span>
                                    </div>

                                    <span className='pixelated-font'>Cancel</span>
                                </div>

                                <div className='flex gap-1'>
                                    <div className='w-[25px] h-[25px] bg-gray-700 active:bg-gray-800 rounded-full flex justify-center items-center'
                                    >
                                        <span className='pixelated-font text-lg'>Z</span>
                                    </div>

                                    <span className='pixelated-font'>
                                        {
                                            !submitResult?
                                                "Confirm"
                                            :
                                                submitResult.success?
                                                    "OK"
                                                :
                                                    "Try Again"
                                        }
                                    </span>
                                </div>

                            </div>
                        </>
                }

            </div>
        </div>
    )
}

export default Submit