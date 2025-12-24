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
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Top Navigation Bar */}
            <nav className="w-full bg-white border-b border-gray-200 flex-shrink-0 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Image
                    src="/goalvault-logo.svg"
                    alt="GoalVault Logo"
                    width={48}
                    height={48}
                  />
                  <div>
                    <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      GoalVault
                    </h1>
                    <p className="text-xs text-gray-500">Encrypted goals</p>
                  </div>
                </div>
                <WalletConnect />
              </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
