import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatBubble = ({ message, isUser, timestamp }: ChatBubbleProps) => {
  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 relative",
          isUser
            ? "bg-primary text-primary-foreground encryption-shimmer"
            : "bg-card text-card-foreground cyber-border encryption-shimmer"
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        {timestamp && (
          <span className="text-xs opacity-60 mt-1 block">{timestamp}</span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
