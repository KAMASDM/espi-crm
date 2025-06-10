import React, { useEffect, useRef } from "react";
import moment from "moment";

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = moment(timestamp.toDate());

    if (date.isSame(moment(), "day")) {
      return date.format("HH:mm");
    } else if (date.isSame(moment().subtract(1, "day"), "day")) {
      return `Yesterday ${date.format("HH:mm")}`;
    }
    return date.format("MMM DD, HH:mm");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUser?.uid;
        const showSenderInfo =
          index === 0 || messages[index - 1].senderId !== message.senderId;

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
              showSenderInfo && !isOwn ? "mt-3" : "mt-0.5"
            }`}
          >
            <div
              className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                isOwn ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {!isOwn && showSenderInfo && (
                <img
                  src={message.senderPhotoURL}
                  alt={message.senderName}
                  className="w-6 h-6 rounded-full self-start"
                />
              )}
              {!isOwn && !showSenderInfo && (
                <div className="w-6 flex-shrink-0"></div>
              )}

              <div
                className={`px-3 py-2 rounded-lg shadow-sm ${
                  isOwn
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {!isOwn && showSenderInfo && (
                  <p className="text-xs font-semibold mb-0.5 text-blue-700">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-1 text-right ${
                    isOwn ? "text-blue-100 opacity-80" : "text-gray-400"
                  }`}
                >
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
