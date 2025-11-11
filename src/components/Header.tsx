import { Lock } from "lucide-react";
import diaryVaultLogo from "@/assets/diaryvault-logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={diaryVaultLogo} alt="DiaryVault" className="w-10 h-10" />
            <h1 className="text-xl font-bold glow-text">DiaryVault</h1>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Encrypted</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
