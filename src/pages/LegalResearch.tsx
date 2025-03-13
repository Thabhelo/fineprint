import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, ExternalLink, Book, Scale, Gavel } from 'lucide-react';
import { sendMessageToGroq } from '../lib/groq';
import { toast } from 'sonner';
import { Resizable } from 're-resizable';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function LegalResearch() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI legal assistant. How can I help you with your legal research today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Convert messages to Groq format (excluding timestamps and ids)
      const conversationHistory = messages.map(({ role, content }) => ({ role, content }));
      
      const response = await sendMessageToGroq(input, conversationHistory, {
        temperature: 0.7,
        maxTokens: 2048
      });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      const updatedMessages = [...messages, botMessage];
      setMessages(updatedMessages);

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8 items-start">
          {/* Chat Interface */}
          <Resizable
            defaultSize={{
              width: 800,
              height: 600,
            }}
            minWidth={400}
            minHeight={400}
            maxWidth={1000}
            maxHeight={800}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 bg-indigo-600 text-white flex items-center">
                <Bot className="h-6 w-6 mr-2" />
                <h2 className="text-lg font-semibold">AI Legal Assistant</h2>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          message.role === 'user' ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-xl ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-gray-600" />
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask your legal question..."
                    className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </Resizable>

          {/* Quick Access */}
          <motion.div
            className="w-80 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-4 bg-indigo-600 text-white">
                <h2 className="text-lg font-semibold">Quick Access</h2>
              </div>
              <div className="p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Book className="h-4 w-4 mr-2" />
                      Legal Research
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://case.law"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Case Law Database <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://heinonline.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Legal Journals <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.law.cornell.edu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Statutes & Regulations <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Scale className="h-4 w-4 mr-2" />
                      Practice Areas
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://www.contractstandards.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Contract Law <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.sec.gov/edgar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Corporate Law <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.uspto.gov"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        IP Law <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Gavel className="h-4 w-4 mr-2" />
                      Tools
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://www.citationmachine.net/bluebook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Citation Generator <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.lawinsider.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Document Templates <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.law.cornell.edu/wex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded p-2 transition-colors"
                      >
                        Legal Dictionary <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}