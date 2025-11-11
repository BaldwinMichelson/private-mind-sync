import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WalletConnect from "@/components/WalletConnect";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import SessionFooter from "@/components/SessionFooter";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setShowChat(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Your message has been encrypted and processed privately. This is a demo response showing the encryption shimmer effect.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Circuit pattern background */}
      <div className="fixed inset-0 circuit-pattern pointer-events-none" />
      
      <Header />
      
      <main className="pt-20 pb-32">
        {!showChat ? (
          <div className="container mx-auto">
            <Hero />
            <WalletConnect />
          </div>
        ) : (
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-4 py-8">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.text}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-16 left-0 right-0">
        <ChatInput onSend={handleSendMessage} />
      </div>
      
      <SessionFooter />
    </div>
  );
};

export default Index;
