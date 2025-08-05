import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MiniKitContextProvider } from '@/app/providers/MiniKitProvider';
import "@coinbase/onchainkit/styles.css";

import { GameStateProvider } from "./providers/GameStateProvider";
import { ConsoleStateProvider } from "./providers/ConsoleStateProvider";
import ReactQueryProvider from "./providers/ReactQueryProvider";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // max-w and max-h set according to instructions on https://miniapps.farcaster.xyz/docs/specification#size--orientation
        className={`${geistMono.className} antialiased max-w-[424px] max-h-[695px]`}
      >
        <MiniKitContextProvider>
          <ReactQueryProvider>
            <ConsoleStateProvider>
              <GameStateProvider>
                {children}
              </GameStateProvider>
            </ConsoleStateProvider>
          </ReactQueryProvider>
        </MiniKitContextProvider>
      </body>
    </html>
  );
}
