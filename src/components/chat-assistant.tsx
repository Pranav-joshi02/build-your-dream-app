import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, X, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatWithOllamaFn, chatWithGeminiFn } from "@/lib/api";

// Global event to trigger speech recognition from anywhere (e.g. app shell header)
export const triggerSpeechRecognition = () => {
  window.dispatchEvent(new Event('start-speech-recognition'));
};

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant. I use Ollama locally with a Gemini fallback. How can I help you today?' }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API
  const SpeechRecognition = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleStartSpeech = () => {
      setOpen(true);
      setTimeout(() => startListening(), 300);
    };

    window.addEventListener('start-speech-recognition', handleStartSpeech);
    return () => window.removeEventListener('start-speech-recognition', handleStartSpeech);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
        if (event.results[0].isFinal) {
          setIsListening(false);
          if (transcript.trim()) {
            handleSend(transcript);
          }
        }
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    setInput("");
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = async (e?: React.FormEvent | string) => {
    let text = input;
    if (typeof e === 'string') {
      text = e;
    } else if (e) {
      e.preventDefault();
    }
    if (!text.trim() || isTyping) return;

    const userMsg = text;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsTyping(true);
    setFallbackWarning(false);

    try {
      // Primary: Try Ollama
      const response = await chatWithOllamaFn({ data: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Ollama API Error, falling back to Gemini:", error);
      setFallbackWarning(true);
      
      try {
        // Fallback: Gemini
        const geminiResponse = await chatWithGeminiFn({ data: userMsg });
        setMessages(prev => [...prev, { role: 'assistant', content: geminiResponse }]);
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I am completely offline right now. Both Ollama and Gemini failed." }]);
      }
    } finally {
      setIsTyping(false);
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
    <div className="fixed bottom-6 right-6 w-80 bg-background border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
          <X className="size-4" />
        </button>
      </div>
      
      {fallbackWarning && (
        <div className="bg-warning/20 text-warning-foreground text-[10px] px-3 py-1.5 flex items-center gap-1.5">
          <AlertCircle className="size-3" />
          <span>Local Ollama unreachable. Using Gemini fallback.</span>
        </div>
      )}
      
      <div className="flex-1 p-3 h-80 overflow-y-auto space-y-3 bg-muted/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`text-sm p-2.5 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border shadow-sm rounded-bl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background border shadow-sm p-3 rounded-lg rounded-bl-sm flex gap-1.5 items-center">
              <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-background items-center">
        <button 
          type="button" 
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-destructive/10 text-destructive animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Mic className="size-4" />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask me anything..."}
          className={`flex-1 min-w-0 text-sm focus:outline-none bg-transparent ${isListening ? 'text-destructive font-medium' : ''}`}
          disabled={isTyping}
        />
        <button type="submit" disabled={!input.trim() || isTyping} className="text-primary disabled:opacity-50 p-2 flex-shrink-0 hover:bg-primary/10 rounded-full transition-colors">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
