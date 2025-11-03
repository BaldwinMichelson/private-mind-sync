import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";
import { WalletConnect } from "@/components/WalletConnect";

export const metadata: Metadata = {
  title: "GoalVault - Encrypted Goal Management",
  description: "Secure goal management with Fully Homomorphic Encryption",
  icons: {
    icon: '/goalvault-logo.svg',
    shortcut: '/goalvault-logo.svg',
    apple: '/goalvault-logo.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <main className="flex flex-col max-w-screen-xl mx-auto pb-20 px-4 md:px-6">
            <nav className="flex w-full h-fit py-6 md:py-8 justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/goalvault-logo.svg"
                  alt="GoalVault Logo"
                  width={60}
                  height={60}
                  className="md:w-20 md:h-20"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    GoalVault
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500">Encrypted goals with on-chain proofs</p>
                </div>
              </div>
              <WalletConnect />
            </nav>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
