import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WalletConnect from "@/components/WalletConnect";
import DiaryEntry from "@/components/DiaryEntry";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 paper-texture pointer-events-none" />
      
      <Header />
      
      <main className="pt-20 pb-16">
        {!isConnected ? (
          <div className="container mx-auto">
            <Hero />
            <div className="mt-8">
              <WalletConnect onConnect={() => setIsConnected(true)} />
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <DiaryEntry />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
