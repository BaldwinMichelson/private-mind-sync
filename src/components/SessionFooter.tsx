import { Key, Shield } from "lucide-react";

const SessionFooter = () => {
  const sessionKey = "0x7f9a...3b2c"; // Mock session key

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Session:</span>
            <code className="px-2 py-1 rounded bg-card text-primary font-mono">
              {sessionKey}
            </code>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SessionFooter;
