'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';

type DataRow = Record<string, any>;

interface ExcelAIProps {
  data: DataRow[];
  headers: string[];
  isDarkMode: boolean;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ExcelAI({ data, headers, isDarkMode }: ExcelAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm your AI data assistant. Ask me anything about your spreadsheet!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare context (first 100 rows to avoid token limits)
      const contextData = data.slice(0, 100);
      const contextStr = JSON.stringify(contextData);
      
      const prompt = `
You are an expert data analyst assistant. 
Here are the headers of the dataset: ${headers.join(', ')}.
Here is a sample of the data (up to 100 rows):
${contextStr}

User's question: ${userMessage}

Please provide a clear, concise, and helpful answer based on the data provided. If the question cannot be answered with the provided data, politely say so.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text || '' }]);
      } else {
        throw new Error("Received empty response from AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while communicating with the AI.");
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-[600px] rounded-2xl border shadow-sm overflow-hidden",
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
    )}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white" 
                : (isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600")
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-sm" 
                : (isDarkMode ? "bg-zinc-800 text-zinc-200 rounded-tl-sm" : "bg-zinc-100 text-zinc-800 rounded-tl-sm")
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 max-w-[85%]"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
            )}>
              <Bot className="w-4 h-4" />
            </div>
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm flex items-center gap-2",
              isDarkMode ? "bg-zinc-800 text-zinc-400 rounded-tl-sm" : "bg-zinc-100 text-zinc-500 rounded-tl-sm"
            )}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className={cn(
          "px-6 py-3 text-sm flex items-center gap-2 border-t",
          isDarkMode ? "bg-red-950/30 border-red-900/50 text-red-400" : "bg-red-50 border-red-200 text-red-600"
        )}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1 truncate">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className={cn(
        "p-4 border-t",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about your data..."
            disabled={isLoading}
            className={cn(
              "w-full pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm",
              isDarkMode 
                ? "bg-black border border-zinc-800 text-white focus:ring-white/10 focus:border-zinc-600 placeholder:text-zinc-600" 
                : "bg-zinc-50 border border-zinc-200 text-zinc-900 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-zinc-400"
            )}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={cn(
              "absolute right-2 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              isDarkMode 
                ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className={cn("text-xs text-center mt-3", isDarkMode ? "text-zinc-600" : "text-zinc-400")}>
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
