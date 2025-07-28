"use client"

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query';

import { RuleInfo } from '@/app/utils/utils'
import { getOutputs, VerificationOutput, VerifyPayloadProxyInput } from '@/app/utils/backend-libs/core/lib';
import { DecodedIndexerOutput } from '@/app/utils/backend-libs/cartesapp/lib';

const RIVES_NODE_URL = process.env.NEXT_PUBLIC_RIVES_NODE_URL;
const PAGE_SIZE = 10;

function Leaderboard({ruleInfo}:{ruleInfo:RuleInfo}) {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rankingFocus, setRankingFocus] = useState(0);
    const isMovingRef = useRef(false); // <-- Ref used for timing logic

    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['leaderboardData', page],
        queryFn: async () => {
            const tags = ["score", ruleInfo.cartridge_id, ruleInfo.id];
            const response:DecodedIndexerOutput = await getOutputs(
            {
                tags,
                type: 'notice',
                page,
                page_size: PAGE_SIZE,
                order_by: "value",
                order_dir: "desc"
            },
            {cartesiNodeUrl: RIVES_NODE_URL});

            setTotalPages(response.total);
            return response.data as VerificationOutput[];
        },
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isMovingRef.current) return; // Ignore key presses while moving focus

            const delay_keydown_events = async () => {
                isMovingRef.current = true;
                setTimeout(() => isMovingRef.current = false, 200);
            };

            if (e.key == "ArrowUp") {
                setRankingFocus((prev) => Math.max(prev - 1, 0));
                delay_keydown_events();
            } else if (e.key === "ArrowDown") {
                setRankingFocus((prev) => prev+1);
                delay_keydown_events();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // React automatically calls the function returned by useEffect when:
        //     The component is about to unmount, or
        //     The dependencies of the effect change (if there are any in the deps array)
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    if (isFetching || isPending) {
        return (
            <div className='emulator-screen bg-black text-white p-4 overflow-scroll relative'>
                <div className='flex justify-center items-center h-full'>
                    <h2 className='pixelated-font text-xl'>Loading...</h2>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className='emulator-screen bg-black text-white p-4 overflow-scroll relative'>
                <div className='flex justify-center items-center h-full'>
                    <h2 className='pixelated-font text-xl'>No data available</h2>
                </div>
            </div>
        );
    }
    
    return (
        <div className='emulator-screen bg-black text-white p-4 overflow-scroll relative'>
            <div>
                <h2 className={`pixelated-font text-xl mb-2`}>{ruleInfo.name} Leaderboard</h2>
            </div>

            <div>
                <div className='flex flex-col min-w-0'>
                    {data.map((output, index) => (
                        <div key={`${output._msgSender}+${output._timestamp}`}
                         className={`flex justify-between p-2 ${rankingFocus === index ? 'bg-rives-purple' : ''}`} 
                        >
                            <span className='text-xs'>{index+1}</span>
                            <span className='text-xs'>
                                {output.user_address?.substring(0, 6)}...{output.user_address?.substring(output.user_address.length - 4)}
                            </span>
                            <span className='text-xs'>{output._timestamp}</span>
                            <span className='text-xs'>{output.score.toString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className='sticky bottom-2 left-1/2 text-center pixelated-font text-xs bg-rives-purple p-1 animate-pulse max-w-full w-[90%]'>
                Press "LEADERBOARD" to return to the game.
            </div>
        </div>
  )

}

export default Leaderboard