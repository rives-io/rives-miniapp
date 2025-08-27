"use client"

import { createContext, ReactNode, useState } from "react"

export enum GAME_STATE {
    OFF,
    RESTARTING,
    RUNNING,
    PAUSED
}

export enum COMMAND{
    NONE,
    PAUSE,
    RESTART
}


export const GameStateContext = createContext<{
  gameState: GAME_STATE,
  setGameState: (state: GAME_STATE) => void,
  gameCommand: COMMAND,
  setGameCommand: (command: COMMAND) => void
}>({gameState: GAME_STATE.OFF, 
    setGameState: () => null, 
    gameCommand: COMMAND.NONE, 
    setGameCommand: () => null
});


export const GameStateProvider = ({ children }: { children: ReactNode }) => {
    const [gameState, setGameState] = useState(GAME_STATE.OFF);
    const [gameCommand, setGameCommand] = useState(COMMAND.NONE);

    return (
        <GameStateContext.Provider value={{ gameState, setGameState, gameCommand, setGameCommand }}>
            {children}
        </GameStateContext.Provider>
    );
};