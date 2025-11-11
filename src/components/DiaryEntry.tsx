import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Lock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DiaryEntry = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please add a title and content to your entry.",
        variant: "destructive",
      });
      return;
    }

    // Mock save with encryption
    toast({
      title: "Entry Encrypted & Saved",
      description: "Your memory has been securely stored.",
    });

    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card rounded-xl elegant-border p-8 paper-texture">
        <div className="mb-6">
          <Input
            placeholder="Entry Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
          <div className="text-sm text-muted-foreground mt-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] border-0 bg-transparent px-0 text-base leading-relaxed resize-none focus-visible:ring-0 placeholder:text-muted-foreground/50 notebook-lines"
          />
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-success" />
            <span>Auto-encrypted on save</span>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntry;
