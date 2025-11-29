import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { Itinerary, ChatMessage } from '../types';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatAssistantProps {
  itinerary: Itinerary | null;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ itinerary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '喵！我是您的旅遊小幫手。對這次行程有任何疑問嗎？我可以為您查詢交通、天氣或餐廳建議喔！', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await generateChatResponse(history, userMsg.text, itinerary || undefined);
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "抱歉，連線有點問題，請稍後再試試喵！",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="no-print">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-sky-400 text-white rounded-full shadow-xl shadow-sky-200 hover:bg-sky-500 hover:scale-105 transition-all z-40 ${isOpen ? 'hidden' : 'flex'} items-center gap-2 group border-4 border-white`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
          行程諮詢
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden border-4 border-white animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-sky-400 p-5 text-white flex justify-between items-center shrink-0 rounded-t-[1.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Bot className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h3 className="font-black text-lg flex items-center gap-1">
                  AI 旅遊助手 <Sparkles className="w-3 h-3 text-yellow-300 fill-current" />
                </h3>
                <p className="text-xs text-sky-100 font-medium">隨時為您解答</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${
                  msg.role === 'user' ? 'bg-pink-100 text-pink-500' : 'bg-sky-100 text-sky-500'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-pink-400 text-white rounded-tr-none shadow-pink-100' 
                    : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                 <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center shrink-0 border-2 border-white">
                   <Bot className="w-5 h-5" />
                 </div>
                 <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-1.5">
                   <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-full px-4 py-2 focus-within:ring-4 focus-within:ring-sky-100 focus-within:border-sky-300 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="說點什麼喵..."
                className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2 rounded-full transition-all ${
                  input.trim() && !isTyping 
                    ? 'text-sky-500 bg-sky-100 hover:bg-sky-200' 
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};