import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = () => {
    // Mock wallet connection
    setIsConnected(true);
    toast({
      title: "Wallet Connected",
      description: "Rainbow Wallet connected successfully",
    });
  };

  return (
    <div className="flex justify-center">
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          size="lg"
          className="gap-2 cyber-border bg-card hover:bg-card/80"
        >
          <Wallet className="w-5 h-5" />
          Connect Rainbow Wallet
        </Button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
          <Check className="w-5 h-5 text-success" />
          <span className="text-success font-medium">Wallet Connected</span>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
