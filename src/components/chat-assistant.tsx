import React, { useState, useRef } from "react";
import { Mic, Send, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant powered by Ollama. How can I help you today?' }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Web Speech API
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");

    // Call Ollama endpoint (mock or real)
    try {
      const apiUrl = import.meta.env.VITE_OLLAMA_API_URL || "http://localhost:11434";
      
      // We wrap in try-catch in case Ollama is not running locally
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3", // or any default model
          prompt: userMsg,
          stream: false
        })
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error("Ollama API Error:", error);
      // Fallback response if Ollama is not available
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "I am a mock response because Ollama is not currently reachable at " + (import.meta.env.VITE_OLLAMA_API_URL || "http://localhost:11434") }]);
      }, 500);
    }
  };

  if (!open) {
    return (
      <Button 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="size-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-background border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <h3 className="font-semibold text-sm">Ollama Assistant</h3>
        <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
          <X className="size-4" />
        </button>
      </div>
      
      <div className="flex-1 p-3 h-80 overflow-y-auto space-y-3 bg-muted/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`text-sm p-2 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border text-foreground'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-background">
        <button 
          type="button" 
          onClick={startListening}
          className={`p-2 rounded-full transition-colors ${isListening ? 'bg-destructive/20 text-destructive animate-pulse' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Mic className="size-4" />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..." 
          className="flex-1 min-w-0 text-sm focus:outline-none bg-transparent"
        />
        <button type="submit" disabled={!input.trim()} className="text-primary disabled:opacity-50">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
