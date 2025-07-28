"use client"


import React, { useEffect, useRef } from 'react'

function Help({cartridge_desc, rule_desc}:{cartridge_desc?:string, rule_desc?:string}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const scrollEl = scrollRef.current;
            if (!scrollEl) return;

            const scrollAmount = 40; // pixels per key press

            if (e.key == "ArrowUp") {
                scrollEl.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            } else if (e.key === "ArrowDown") {
                scrollEl.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // React automatically calls the function returned by useEffect when:
        //     The component is about to unmount, or
        //     The dependencies of the effect change (if there are any in the deps array)
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div ref={scrollRef} className='emulator-screen bg-black text-white p-4 overflow-scroll relative'>
            <div>
                <h2 className={`pixelated-font text-xl mb-2`}>Contest Description</h2>
                 <pre style={{whiteSpace: "pre-wrap", fontFamily: 'Iosevka Web'}}>
                    {rule_desc || "No description available."}
                </pre>
            </div>

            <div>
                <h2 className={`pixelated-font text-xl mb-2`}>Cartridge Description</h2>
                 <pre style={{whiteSpace: "pre-wrap", fontFamily: 'Iosevka Web'}}>
                    {cartridge_desc || "No description available."}
                </pre>
            </div>

            <div className='sticky bottom-0 left-full text-center pixelated-font text-xs bg-rives-purple p-1 animate-pulse w-fit'>
                Press "HELP" to return to the game.
            </div>
        </div>
  )
}

export default Help