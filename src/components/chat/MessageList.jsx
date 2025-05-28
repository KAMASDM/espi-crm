import React, { useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate(); // Firestore timestamp to JS Date
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    }
    return format(date, 'MMM dd, HH:mm');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUser?.uid;
        // Determine if sender changed from previous message to show avatar/name
        const showSenderInfo = index === 0 || messages[index - 1].senderId !== message.senderId;

        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showSenderInfo && !isOwn ? 'mt-3' : 'mt-0.5'}`}>
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!isOwn && showSenderInfo && (
                <img 
                  src={message.senderPhotoURL || `https://ui-avatars.com/api/?name=${message.senderName || 'U'}&background=random`} 
                  alt={message.senderName}
                  className="w-6 h-6 rounded-full self-start" // Aligned to top of message group
                />
              )}
               {!isOwn && !showSenderInfo && (
                <div className="w-6 flex-shrink-0"></div> // Placeholder for alignment
              )}
              
              <div className={`px-3 py-2 rounded-lg shadow-sm ${
                isOwn 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                {!isOwn && showSenderInfo && (
                  <p className="text-xs font-semibold mb-0.5 text-blue-700">{message.senderName}</p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-xs mt-1 text-right ${
                  isOwn ? 'text-blue-100 opacity-80' : 'text-gray-400'
                }`}>
                  {formatMessageTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;