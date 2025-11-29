import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { Itinerary, ChatMessage } from '../types';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface ChatAssistantProps {
  itinerary: Itinerary | null;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ itinerary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是您的旅遊助手。對這次行程有任何疑問嗎？我可以為您查詢交通、天氣或餐廳建議。', timestamp: Date.now() }
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
      // Format history for Gemini API
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
        text: "抱歉，連接發生錯誤，請稍後再試。",
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
        className={`fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-40 ${isOpen ? 'hidden' : 'flex'} items-center gap-2 group`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium whitespace-nowrap">
          行程諮詢
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI 旅遊助手</h3>
                <p className="text-xs text-indigo-200">隨時為您解答</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                   <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-1">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="詢問有關行程的問題..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2 rounded-full transition-all ${
                  input.trim() && !isTyping 
                    ? 'text-indigo-600 hover:bg-indigo-50' 
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