import { Button } from "@/components/ui/button";
import { Wallet, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  onConnect?: () => void;
}

const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
      title: "Wallet Connected",
      description: "Rainbow Wallet connected successfully. Your encryption keys are ready.",
    });
    onConnect?.();
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleConnect}
        size="lg"
        className="gap-2 elegant-border"
      >
        <Wallet className="w-5 h-5" />
        Connect Rainbow Wallet
      </Button>
    </div>
  );
};

export default WalletConnect;
