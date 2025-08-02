"use client"

import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer'

import { RuleInfo } from '@/app/utils/utils'
import { getOutputs, VerificationOutput, VerifyPayloadProxyInput } from '@/app/utils/backend-libs/core/lib';
import { DecodedIndexerOutput } from '@/app/utils/backend-libs/cartesapp/lib';

const RIVES_NODE_URL = process.env.NEXT_PUBLIC_RIVES_NODE_URL;
const PAGE_SIZE = 15;

function Leaderboard({ruleInfo}:{ruleInfo:RuleInfo}) {
    const [rankingFocus, setRankingFocus] = useState(1);
    const totalEntries = useRef(1);
    const isFetchingRef = useRef(true); // Ref used to prevent scrolling the leaderboard while fetching
    const [ prevRankingFocusRef, prevRankingFocusInView ] = useInView();
    const [ nextRankingFocusRef, nextRankingFocusInView ] = useInView();
    const isMovingRef = useRef(false); // <-- Ref used for timing logic
    const scrollRef = useRef<HTMLDivElement>(null);
    const { ref, inView } = useInView();

    const {
        status,
        data,
        error,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['leaderboardData'],
        queryFn: async ({
        pageParam,
        }): Promise<{
        data:VerificationOutput[]
        nextPage: number|undefined
        }> => {
            const tags = ["score", ruleInfo.cartridge_id, ruleInfo.id];
            const response:DecodedIndexerOutput = await getOutputs(
            {
                tags,
                type: 'notice',
                page: pageParam,
                page_size: PAGE_SIZE,
                order_by: "value",
                order_dir: "desc"
            },
            {cartesiNodeUrl: RIVES_NODE_URL});
            const total_pages = Math.ceil(response.total / PAGE_SIZE);
            totalEntries.current = response.total;

            return {data: response.data as VerificationOutput[], nextPage: pageParam+1 <= total_pages ? pageParam+1 : undefined};
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    })

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, inView])

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;
        const scrollAmount = 32;

        // if next row is not in view? scroll down
        // else if previous row is not in view? scroll up
        if (!nextRankingFocusInView) {
            if (rankingFocus+1 == totalEntries.current) {
                scrollEl.scrollBy({ top: +scrollAmount*2, behavior: 'smooth' });
            } else {
                scrollEl.scrollBy({ top: +scrollAmount, behavior: 'smooth' });
            }
        } else if (!prevRankingFocusInView) {
            if (rankingFocus-1 == 1) {
                scrollEl.scrollBy({ top: -scrollAmount*3, behavior: 'smooth' });
            } else {
                scrollEl.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            }
        }
    }, [prevRankingFocusRef, nextRankingFocusRef, nextRankingFocusInView, prevRankingFocusInView])

    useEffect(() => {
        isFetchingRef.current = isFetching;
    }, [isFetching])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isMovingRef.current) return; // Ignore key presses while moving focus

            const delay_keydown_events = async () => {
                isMovingRef.current = true;
                setTimeout(() => isMovingRef.current = false, 200);
            };

            if (e.key == "ArrowUp") {
                setRankingFocus((prev) => Math.max(prev - 1, 1));
                delay_keydown_events();
            } else if (e.key === "ArrowDown" && !isFetchingRef.current) {
                setRankingFocus((prev) => Math.min(prev + 1, totalEntries.current));
                delay_keydown_events();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // React automatically calls the function returned by useEffect when:
        //     The component is about to unmount, or
        //     The dependencies of the effect change (if there are any in the deps array)
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    if (isFetching && !isFetchingNextPage) {
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
        <div ref={scrollRef} className='emulator-screen bg-black text-white p-4 overflow-scroll relative'>
            <div>
                <h2 className={`pixelated-font text-xl mb-2`}>{ruleInfo.name} Leaderboard</h2>
            </div>

            <div>
                <div className='flex flex-col min-w-0'>
                    {data.pages.map((page, index) => (
                        page.data.map((output, index2) => {
                            const currentRanking = index * PAGE_SIZE + index2 + 1;
                            return (
                                <div 
                                ref={currentRanking === rankingFocus+1? nextRankingFocusRef: currentRanking === rankingFocus-1? prevRankingFocusRef:undefined} 
                                key={`${output._msgSender}+${output._timestamp}`}
                                className={`flex justify-between p-2 ${rankingFocus === currentRanking ? 'bg-rives-purple' : ''}`} 
                                >
                                    <span className='text-xs'>{currentRanking}</span>
                                    <span className='text-xs'>
                                        {output.user_address?.substring(0, 6)}...{output.user_address?.substring(output.user_address.length - 4)}
                                    </span>
                                    <span className='text-xs'>{output._timestamp}</span>
                                    <span className='text-xs'>{output.score.toString()}</span>
                                </div>
                            )
                        })
                    ))}

                    <div ref={ref} className='h-3'>
                        <span className={`text-xs ${!isFetchingNextPage? "hidden": ""}`}>Loading...</span>
                    </div>
                </div>
            </div>

            <div className='sticky bottom-2 left-1/2 text-center pixelated-font text-xs bg-rives-purple p-1 animate-pulse max-w-full w-[90%]'>
                Press "LEADERBOARD" to return to the game.
            </div>
        </div>
  )

}

export default Leaderboard