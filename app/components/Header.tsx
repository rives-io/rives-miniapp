"use client"

import React from 'react'
import Image from 'next/image';
import rivesLogo from '@/public/logo_cutted.png';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Avatar, EthBalance, Identity, Name } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

function Header() {
    const { isConnected, isConnecting } = useAccount();

    return (
        <header className="flex justify-between items-center h-12 mb-1">
            <div>
                <Image
                    src={rivesLogo}
                    width={64}
                    quality={100}
                    alt='rives logo'
                />
            </div>

            {
                !isConnected || isConnecting?
                    <></>
                :
                    <div className="rounded-xl flex items-center space-x-2">
                        <Wallet className="z-10">
                            <ConnectWallet>
                                <Name className="text-inherit" />
                            </ConnectWallet>
                            
                            <WalletDropdown>
                                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar className='h-6 w-6' />
                                <Name />
                                <Address />
                                <EthBalance />
                                </Identity>
                                <WalletDropdownDisconnect />
                            </WalletDropdown>
                        </Wallet>
                    </div>
            }
        </header>
    )
}

export default Header