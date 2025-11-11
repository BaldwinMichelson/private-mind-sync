import { Lock, Shield, Zap } from "lucide-react";

const Hero = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="relative inline-block mb-6">
        <h2 className="text-5xl md:text-7xl font-bold glow-text">
          Think in Private.
        </h2>
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-r from-primary to-cyber-cyan" />
      </div>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
        Chat with on-chain AI that encrypts your prompts and responses, ensuring truly private model inference.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="p-6 rounded-xl cyber-border bg-card/50 backdrop-blur">
          <Lock className="w-8 h-8 text-primary mb-3 mx-auto" />
          <h3 className="font-semibold mb-2">End-to-End Encrypted</h3>
          <p className="text-sm text-muted-foreground">
            Your conversations are encrypted before leaving your device
          </p>
        </div>
        
        <div className="p-6 rounded-xl cyber-border bg-card/50 backdrop-blur">
          <Shield className="w-8 h-8 text-primary mb-3 mx-auto" />
          <h3 className="font-semibold mb-2">On-Chain Privacy</h3>
          <p className="text-sm text-muted-foreground">
            Blockchain-verified encryption with zero knowledge proofs
          </p>
        </div>
        
        <div className="p-6 rounded-xl cyber-border bg-card/50 backdrop-blur">
          <Zap className="w-8 h-8 text-primary mb-3 mx-auto" />
          <h3 className="font-semibold mb-2">Instant Inference</h3>
          <p className="text-sm text-muted-foreground">
            Fast AI responses without compromising your privacy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
