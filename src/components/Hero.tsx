import { Lock, Key, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="relative inline-block mb-6">
        <h2 className="text-5xl md:text-7xl font-bold glow-text">
          Write Freely, Keep It Private.
        </h2>
        <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-gold to-purple" />
      </div>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
        Write daily entries encrypted with personal keys. Your memories can be selectively decrypted for sharing or reflection.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="p-6 rounded-xl elegant-border bg-card/50 backdrop-blur paper-texture">
          <Lock className="w-8 h-8 text-gold mb-3 mx-auto" />
          <h3 className="font-semibold mb-2">Personal Encryption</h3>
          <p className="text-sm text-muted-foreground">
            Every entry is encrypted with your personal key before storage
          </p>
        </div>
        
        <div className="p-6 rounded-xl elegant-border bg-card/50 backdrop-blur paper-texture">
          <Key className="w-8 h-8 text-gold mb-3 mx-auto" />
          <h3 className="font-semibold mb-2">Selective Sharing</h3>
          <p className="text-sm text-muted-foreground">
            Choose which memories to decrypt and share with others
          </p>
        </div>
        
        <div className="p-6 rounded-xl elegant-border bg-card/50 backdrop-blur paper-texture">
          <BookOpen className="w-8 h-8 text-gold mb-3 mx-auto" />
          <h3 className="font-semibold mb-2">Beautiful Interface</h3>
          <p className="text-sm text-muted-foreground">
            An elegant notebook experience for your private thoughts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
