"use client"

import { createContext, ReactNode, useState } from "react"

export enum CONSOLE_STATE {
  PLAY,
  LEADERBOARD,
  HELP,
  SUBMIT
}


export const ConsoleStateContext = createContext<{
  consoleState: CONSOLE_STATE,
  setConsoleState: (state: CONSOLE_STATE) => void
}>({consoleState: CONSOLE_STATE.PLAY, setConsoleState: () => null});


export const ConsoleStateProvider = ({ children }: { children: ReactNode }) => {
    const [consoleState, setConsoleState] = useState(CONSOLE_STATE.PLAY);

    return (
        <ConsoleStateContext.Provider value={{ consoleState, setConsoleState }}>
            {children}
        </ConsoleStateContext.Provider>
    );
};