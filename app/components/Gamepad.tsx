"use client"

import React from 'react'
import Image from 'next/image';
import gamepadCenter from '@/public/gamepad-center-button.png';
import gamepadDirectional from '@/public/gamepad-directional-button.png';
import gamepadButton from '@/public/gamepad-button.png';


// keymap from https://github.com/rives-io/riv/blob/main/rivemu-web/gamepad.js
const KEY_MAP:Record<string, any> = {
    "A": { key: 'a', code: 'KeyA', keyCode: 65, charCode: 97, which: 65, bubbles: true, elemId: "buttonA" },
    "D": { key: 'd', code: 'KeyD', keyCode: 68, charCode: 100, which: 68, bubbles: true, elemId: "buttonD" },
    "S": { key: 's', code: 'KeyS', keyCode: 83, charCode: 115, which: 83, bubbles: true, elemId: "buttonS" },
    "F": { key: 'f', code: 'KeyF', keyCode: 70, charCode: 102, which: 70, bubbles: true, elemId: "buttonF" },
    "V": { key: 'v', code: 'KeyV', keyCode: 86, charCode: 118, which: 86, bubbles: true, elemId: "buttonV" },
    "X": { key: 'x', code: 'KeyX', keyCode: 88, charCode: 120, which: 88, bubbles: true, elemId: "buttonX" },
    "Z": { key: 'z', code: 'KeyZ', keyCode: 90, charCode: 122, which: 90, bubbles: true, elemId: "buttonZ" },
    "C": { key: 'c', code: 'KeyC', keyCode: 67, charCode: 99, which: 67, bubbles: true, elemId: "buttonC" },
    "E": { key: 'e', code: 'KeyE', keyCode: 69, charCode: 101, which: 69, bubbles: true, elemId: "buttonE" },
    "W": { key: 'w', code: 'KeyW', keyCode: 87, charCode: 119, which: 87, bubbles: true, elemId: "buttonW" },
    "Q": { key: 'q', code: 'KeyQ', keyCode: 81, charCode: 113, which: 81, bubbles: true, elemId: "buttonQ" },
    "R": { key: 'r', code: 'KeyR', keyCode: 82, charCode: 114, which: 82, bubbles: true, elemId: "buttonR" },
    "ArrowUp": { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, charCode: 0, which: 38, bubbles: true, elemId: "joystickUp" },
    "ArrowDown": { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, charCode: 0, which: 40, bubbles: true, elemId: "joystickDown" },
    "ArrowLeft": { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, charCode: 0, which: 37, bubbles: true, elemId: "joystickLeft" },
    "ArrowRight": { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, charCode: 0, which: 39, bubbles: true, elemId: "joystickRight"  }
};

function handleGamepadButtonClick(event_type:string, btn_id:string) {
    const key = KEY_MAP[btn_id];
    new KeyboardEvent(event_type, key);
}

function Gamepad() {
  return (
    <div className='w-full min-h-64 flex justify-between'>
        {/* directional buttons */}
        <div className='w-[150px] h-[150px] relative'>
            <Image className='absolute top-[50px] start-[50px]' width={50} src={gamepadCenter} alt={''} />

            <button className='absolute start-[50px]'>
                <Image width={50} src={gamepadDirectional} alt={''} />
            </button>

            <button className='absolute top-[50px] -rotate-90'>
                <Image width={50} src={gamepadDirectional} alt={''} />
            </button>

            <button className='absolute top-[50px] start-[100px] rotate-90'>
                <Image width={50} src={gamepadDirectional} alt={''} />
            </button>

            <button className='absolute top-[100px] start-[50px] rotate-180'>
                <Image width={50} src={gamepadDirectional} alt={''} />
            </button>
        </div>

        {/* action buttons */}
        <div className='w-[150px] h-[150px] relative'>
            <button className='absolute end-[0px]'
            onTouchStart={() => handleGamepadButtonClick("keydown", "X")} 
            onTouchEnd={() => handleGamepadButtonClick("keyup", "X")}>
                <div className='relative'>
                    <span className='absolute top-0 start-0 w-full h-full flex justify-center items-center pixelated-font text-3xl'>X</span>
                    <Image width={50} src={gamepadButton} alt={''} />
                </div>
            </button>

            <button className='absolute end-[60px] top-[25px]' 
            onTouchStart={() => handleGamepadButtonClick("keydown", "Z")} 
            onTouchEnd={() => handleGamepadButtonClick("keyup", "Z")}>
                <div className='relative'>
                    <span className='absolute top-0 start-0 w-full h-full flex justify-center items-center pixelated-font text-3xl'>Z</span>
                    <Image width={50} src={gamepadButton} alt={''} />
                </div>
            </button>

            <button className='absolute top-[60px] end-[0px]'>
                <Image width={50} src={gamepadButton} alt={''} />
            </button>

            <button className='absolute end-[60px] top-[85px]'>
                <Image width={50} src={gamepadButton} alt={''} />
            </button>
        </div>
    </div>
  )
}

export default Gamepad