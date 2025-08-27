"use client"

import { Name } from '@coinbase/onchainkit/identity';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import React, { useState } from 'react'
import { Joystick } from 'react-joystick-component';
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick';
import { useAccount } from 'wagmi';
import { vibrate } from './ConsoleControls';


// keymap from https://github.com/rives-io/riv/blob/main/rivemu-web/gamepad.js
const KEY_MAP:Record<string, any> = {
    "A": { key: 'a', code: 'KeyA', keyCode: 65, charCode: 97, which: 65, bubbles: true },
    "D": { key: 'd', code: 'KeyD', keyCode: 68, charCode: 100, which: 68, bubbles: true },
    "S": { key: 's', code: 'KeyS', keyCode: 83, charCode: 115, which: 83, bubbles: true },
    "F": { key: 'f', code: 'KeyF', keyCode: 70, charCode: 102, which: 70, bubbles: true },
    "V": { key: 'v', code: 'KeyV', keyCode: 86, charCode: 118, which: 86, bubbles: true },
    "X": { key: 'x', code: 'KeyX', keyCode: 88, charCode: 120, which: 88, bubbles: true },
    "Z": { key: 'z', code: 'KeyZ', keyCode: 90, charCode: 122, which: 90, bubbles: true },
    "C": { key: 'c', code: 'KeyC', keyCode: 67, charCode: 99, which: 67, bubbles: true },
    "E": { key: 'e', code: 'KeyE', keyCode: 69, charCode: 101, which: 69, bubbles: true },
    "W": { key: 'w', code: 'KeyW', keyCode: 87, charCode: 119, which: 87, bubbles: true },
    "Q": { key: 'q', code: 'KeyQ', keyCode: 81, charCode: 113, which: 81, bubbles: true },
    "R": { key: 'r', code: 'KeyR', keyCode: 82, charCode: 114, which: 82, bubbles: true },
    "FORWARD": { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, charCode: 0, which: 38, bubbles: true },
    "BACKWARD": { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, charCode: 0, which: 40, bubbles: true },
    "LEFT": { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, charCode: 0, which: 37, bubbles: true },
    "RIGHT": { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, charCode: 0, which: 39, bubbles: true }
};

function handleGamepadButtonClick(event_type:"keyup"|"keydown", btn_id:string) {
    const key = KEY_MAP[btn_id];
    const event = new KeyboardEvent(event_type, key);
    //console.log("keyboard event:", event_type, key);
    document.dispatchEvent(event);
}

function Gamepad() {
    const { address, isConnected } = useAccount();
    const [joystickDirectionX, setJoystickDirectionX] = useState<string|null>(null)
    const [joystickDirectionY, setJoystickDirectionY] = useState<string|null>(null)

    function handleMove(event: IJoystickUpdateEvent): void {
        if (!event.direction) return;

        let currentDirectionX = event.direction == "LEFT" || event.direction == "RIGHT" ? event.direction : "";
        let currentDirectionY = event.direction == "FORWARD" || event.direction == "BACKWARD" ? event.direction : "";

        if (currentDirectionX.length == 0 && event.x) {
            if (event.x > 0.33) {
                currentDirectionX = "RIGHT";
            }
            else if (event.x < -0.33) {
                currentDirectionX = "LEFT";
            }
        }

        if (currentDirectionY.length == 0 && event.y) {
            if (event.y > 0.33) {
                currentDirectionY = "FORWARD";
            }
            else if (event.y < -0.33) {
                currentDirectionY = "BACKWARD";
            }
        }

        if (joystickDirectionX && joystickDirectionX != currentDirectionX) {
            // keyup previous directionX
            handleGamepadButtonClick("keyup", joystickDirectionX);
        }
        if (joystickDirectionY && joystickDirectionY != currentDirectionY) {
            // keyup previous directionY
            handleGamepadButtonClick("keyup", joystickDirectionY);
        }

        setJoystickDirectionX(currentDirectionX);
        setJoystickDirectionY(currentDirectionY);
        handleGamepadButtonClick("keydown", currentDirectionX);
        handleGamepadButtonClick("keydown", currentDirectionY);
    }

    function handleStop(event: IJoystickUpdateEvent): void {
        if (joystickDirectionX) {
            handleGamepadButtonClick("keyup", joystickDirectionX);
        }

        if (joystickDirectionY) {
            handleGamepadButtonClick("keyup", joystickDirectionY);
        }
    }


    if (!(isConnected || address)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Wallet className="base-blue rounded-xl">
                <ConnectWallet>
                    <Name className="text-inherit" />
                </ConnectWallet>
                </Wallet>
            </div>
        );
    }
  
    return (
    <div className='w-full min-fit flex justify-between'>
        {/* directional buttons */}
        <div className='w-[150px] h-[150px] relative flex items-center'>
            <Joystick size={120} sticky={false} baseColor="#374151" stickColor="#1f2937" 
             start={()=>vibrate()} 
             move={handleMove} 
             stop={handleStop}>
            </Joystick>
        </div>

        {/* action buttons */}
        <div className='w-[150px] h-[150px] relative'>
            <button className='absolute top-0 end-[50px] w-[50px] h-[50px] bg-gray-700 active:bg-gray-800 rounded-full flex justify-center items-center'
            onTouchStart={() => {
                vibrate();
                handleGamepadButtonClick("keydown", "V")
            }}
            onTouchEnd={() => handleGamepadButtonClick("keyup", "V")}
            onCopy={() => null}
            >
                <span className='pixelated-font text-3xl'>V</span>
            </button>

            <button className='absolute top-[50px] start-[100px] w-[50px] h-[50px] bg-gray-700 active:bg-gray-800 rounded-full flex justify-center items-center'
            onTouchStart={() => {
                vibrate();
                handleGamepadButtonClick("keydown", "X")
            }} 
            onTouchEnd={() => handleGamepadButtonClick("keyup", "X")}
            onCopy={() => null}
            >
                <span className='pixelated-font text-3xl'>X</span>
            </button>

            <button className='absolute top-[100px] start-[50px] w-[50px] h-[50px] bg-gray-700 active:bg-gray-800 rounded-full flex justify-center items-center'
            onTouchStart={() => {
                vibrate();
                handleGamepadButtonClick("keydown", "Z");
            }}
            onTouchEnd={() => handleGamepadButtonClick("keyup", "Z")}
            onCopy={() => null}
            >
                <span className='pixelated-font text-3xl'>Z</span>
            </button>

            <button className='absolute top-[50px] start-0 w-[50px] h-[50px] bg-gray-700 active:bg-gray-800 rounded-full flex justify-center items-center'
            onTouchStart={() => {
                vibrate();
                handleGamepadButtonClick("keydown", "C")
            }} 
            onTouchEnd={() => handleGamepadButtonClick("keyup", "C")}
            onCopy={() => null}
            >
                <span className='pixelated-font text-3xl'>C</span>
            </button>
        </div>
    </div>
  )
}

export default Gamepad