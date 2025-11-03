import { GoalVaultApp } from "@/components/GoalVaultApp";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Secure Goals, Private Progress</h1>
        <p className="hero-subtitle">
          Blockchain-powered goal management with Fully Homomorphic Encryption. 
          Track your progress privately while keeping your goals secure on-chain.
        </p>
        
        {/* Feature Cards */}
        <div className="features-grid">
          <div className="feature-card green">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">🔐</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Encrypted Storage</h3>
                <p className="text-sm text-gray-600">
                  Goal details encrypted with your wallet's private key. Only you can decrypt your progress.
                </p>
              </div>
            </div>
          </div>
          
          <div className="feature-card yellow">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">🔒</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Privacy-First</h3>
                <p className="text-sm text-gray-600">
                  FHE technology ensures your goals and progress remain private, even on the blockchain.
                </p>
              </div>
            </div>
          </div>
          
          <div className="feature-card green">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Immutable Proof</h3>
                <p className="text-sm text-gray-600">
                  Blockchain ensures your goals can't be altered or deleted once created.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main App */}
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <GoalVaultApp />
      </div>
    </main>
  );
}
