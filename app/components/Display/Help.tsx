import React from 'react'

function Help({cartridge_desc, rule_desc}:{cartridge_desc?:string, rule_desc?:string}) {
    return (
        <div className='emulator-screen bg-black text-white p-4 overflow-scroll relative'>
            <div>
                <h2 className={`pixelated-font text-xl mb-2`}>Contest Description</h2>
                 <pre style={{whiteSpace: "pre-wrap", fontFamily: 'Iosevka Web'}}>
                    {rule_desc || "No description available."}
                </pre>
            </div>

            <div className=''>
                <h2 className={`pixelated-font text-xl mb-2`}>Cartridge Description</h2>
                 <pre style={{whiteSpace: "pre-wrap", fontFamily: 'Iosevka Web'}}>
                    {cartridge_desc || "No description available."}
                </pre>
            </div>

            <div className='sticky bottom-2 left-1/2 text-center pixelated-font text-xs bg-rives-purple p-1 animate-pulse w-fit'>
                Press "HELP" to return to the game.
            </div>
        </div>
  )
}

export default Help