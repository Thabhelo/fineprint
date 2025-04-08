import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, ExternalLink, Book, Scale, Gavel, Search } from 'lucide-react';
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
    if (messages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Legal Research</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Accelerate your legal research with our AI-powered assistant and comprehensive resource directory.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <motion.div 
            className="w-full lg:flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Resizable
              defaultSize={{
                width: '100%',
                height: 600,
              }}
              minHeight={400}
              maxHeight={800}
              enable={{
                top: false,
                right: false,
                bottom: true,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false
              }}
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-indigo-100"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center">
                  <Bot className="h-6 w-6 mr-2" />
                  <h2 className="text-lg font-semibold">AI Legal Assistant</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full shadow-md ${
                            message.role === 'user' ? 'bg-indigo-600' : 'bg-white'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className="h-5 w-5 text-indigo-600" />
                          )}
                        </div>
                        <div
                          className={`p-4 rounded-2xl shadow-sm ${
                            message.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-100'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full shadow-md bg-white">
                        <Bot className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-indigo-100 bg-white">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask your legal question..."
                      className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-indigo-700"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Resizable>
          </motion.div>

          <motion.div
            className="w-full lg:w-80 lg:flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-indigo-100 sticky top-24">
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center">
                <Search className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-semibold">Resource Directory</h2>
              </div>
              <div className="p-5">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Book className="h-4 w-4 mr-2 text-indigo-600" />
                      Legal Research
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://case.law"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Case Law Database <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://heinonline.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Legal Journals <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.law.cornell.edu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Statutes & Regulations <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Scale className="h-4 w-4 mr-2 text-indigo-600" />
                      Practice Areas
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://www.contractstandards.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Contract Law <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.sec.gov/edgar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Corporate Law <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.uspto.gov"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        IP Law <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Gavel className="h-4 w-4 mr-2 text-indigo-600" />
                      Tools
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://www.citationmachine.net/bluebook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Citation Generator <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.lawinsider.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
                      >
                        Document Templates <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                      <a
                        href="https://www.law.cornell.edu/wex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-2.5 transition-colors"
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