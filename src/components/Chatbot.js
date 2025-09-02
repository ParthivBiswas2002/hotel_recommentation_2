import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaPhone, FaEnvelope, FaWhatsapp, FaRobot, FaSpinner } from 'react-icons/fa';
import ApiService from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 I\'m your intelligent hotel assistant. I can help you find hotels by location, star rating, amenities, and more. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);

  // Updated quick replies for hotel-specific queries
  const quickReplies = [
    'Hotels in India',
    '5 star hotels',
    'Hotels with pool and spa',
    'Help'
  ];

  const contactOptions = [
    {
      icon: FaPhone,
      title: 'Call Us',
      subtitle: '+91 9907015059',
      action: 'tel:+919907015059',
      color: 'bg-green-500'
    },
    {
      icon: FaEnvelope,
      title: 'Email Us',
      subtitle: 'parthivbiswas1@gmail.com',
      action: 'mailto:parthivbiswas1@gmail.com',
      color: 'bg-blue-500'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      subtitle: 'Chat with us',
      action: 'https://wa.me/919907015059',
      color: 'bg-green-600'
    }
  ];

  // Enhanced message sending with API integration
  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputMessage,
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);
      const currentInput = inputMessage;
      setInputMessage('');
      setIsTyping(true);

      try {
        // Call your intelligent chatbot API
        const response = await ApiService.sendChatMessage(currentInput);
        
        setIsTyping(false);
        
        const botResponse = {
          id: messages.length + 2,
          type: 'bot',
          text: response.response,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
      } catch (error) {
        console.error('Chatbot error:', error);
        setIsTyping(false);
        
        // Enhanced fallback response based on user input
        let fallbackResponse = '';
        const input = currentInput.toLowerCase();
        
        if (input.includes('hotel') || input.includes('stay') || input.includes('accommodation')) {
          fallbackResponse = 'I\'m having trouble connecting to my knowledge base right now. For hotel bookings, please try using our search feature on the main page or contact our support team directly.';
        } else if (input.includes('book') || input.includes('reservation')) {
          fallbackResponse = 'I\'m currently unable to process booking requests. Please use our booking system on the main page or contact our support team for assistance.';
        } else if (input.includes('price') || input.includes('cost') || input.includes('rate')) {
          fallbackResponse = 'I\'m having connectivity issues. For current pricing and rates, please check our main search results or contact our team directly.';
        } else {
          fallbackResponse = 'I apologize, but I\'m having trouble connecting to my services right now. Please try again in a moment or contact our support team for immediate assistance.';
        }
        
        const errorResponse = {
          id: messages.length + 2,
          type: 'bot',
          text: fallbackResponse,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, errorResponse]);
      }
    }
  };

  // Enhanced quick reply handler
  const handleQuickReply = async (reply) => {
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: reply,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);

    try {
      // Send quick reply to the API
      const response = await ApiService.sendChatMessage(reply);
      
      setIsTyping(false);
      
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: response.response,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Quick reply error:', error);
      setIsTyping(false);
      
      // Enhanced fallback responses based on quick reply type
      let botResponseText = '';
      switch (reply) {
        case 'Hotels in India':
          botResponseText = 'I\'m having trouble accessing hotel data right now. For Mumbai hotels, please use our main search with "Mumbai" as your destination, or contact our team for personalized recommendations.';
          break;
        case '5 star hotels':
          botResponseText = 'I\'m currently unable to access luxury hotel listings. Please filter by 5-star rating in our main search or contact our luxury travel specialists.';
          break;
    
        case 'Hotels with pool and spa':
          botResponseText = 'I can\'t access amenity data right now. Please use our amenity filters for "Pool" and "Spa" in the main search, or contact our team for hotels with these facilities.';
          break;
      
        case 'Help':
          botResponseText = 'I\'m having technical difficulties, but I can still help! Try asking me about:\n🏨 Hotels in specific cities\n⭐ Star ratings (3, 4, 5 star)\n💰 Budget or luxury options\n🏊 Hotels with amenities like pools, spas, gyms\n📍 Specific locations\n\nOr contact our support team directly!';
          break;
        default:
          botResponseText = 'I\'m having trouble processing that request right now. Please try rephrasing your question or contact our support team for immediate assistance.';
      }
      
      const fallbackMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, fallbackMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaRobot className="text-xl" />
                <div>
                  <h3 className="font-semibold">Hotel Assistant</h3>
                  <p className="text-xs text-primary-100">AI-Powered • Ready to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:text-primary-100 transition-colors duration-200"
                >
                  {isMinimized ? '□' : '−'}
                </motion.button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'chat'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'contact'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Contact
                  </button>
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-80">
                    {/* Messages */}
                    <div 
                      id="messages-container"
                      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                    >
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                            <div className="flex items-center space-x-1">
                              <FaSpinner className="animate-spin text-primary-600" />
                              <p className="text-sm text-gray-600">Assistant is thinking...</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Quick Replies */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {quickReplies.map((reply) => (
                          <motion.button
                            key={reply}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickReply(reply)}
                            disabled={isTyping}
                            className={`text-xs px-3 py-2 rounded-lg transition-colors duration-200 ${
                              isTyping 
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {reply}
                          </motion.button>
                        ))}
                      </div>

                      {/* Input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isTyping}
                          placeholder={isTyping ? "Assistant is responding..." : "Ask me about hotels..."}
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                            isTyping ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                        />
                        <motion.button
                          whileHover={!isTyping ? { scale: 1.05 } : {}}
                          whileTap={!isTyping ? { scale: 0.95 } : {}}
                          onClick={handleSendMessage}
                          disabled={isTyping || !inputMessage.trim()}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            isTyping || !inputMessage.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {isTyping ? (
                            <FaSpinner className="animate-spin text-sm" />
                          ) : (
                            <FaPaperPlane className="text-sm" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="p-4 space-y-4">
                    <h4 className="font-semibold text-gray-800 mb-4">Get in Touch</h4>
                    {contactOptions.map((option, index) => (
                      <motion.a
                        key={option.title}
                        href={option.action}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className={`${option.color} text-white p-2 rounded-lg`}>
                          <option.icon />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{option.title}</h5>
                          <p className="text-sm text-gray-600">{option.subtitle}</p>
                        </div>
                      </motion.a>
                    ))}
                    
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Our AI-powered assistant and support team are available 24/7 to help you find the perfect hotel.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
