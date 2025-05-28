import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList'; // [cite: uploaded:src/components/chat/MessageList.jsx]
import MessageInput from './MessageInput'; // [cite: uploaded:src/components/chat/MessageInput.jsx]
import UserList from './UserList'; // [cite: uploaded:src/components/chat/UserList.jsx]
import { useMessages } from '../../hooks/useChat'; // Use the new hook
import { chatService } from '../../services/firestore'; // [cite: uploaded:src/services/firestore.js]
import { useAuth } from '../../context/AuthContext'; // [cite: uploaded:src/context/AuthContext.jsx]
import { Users, X, User as UserIcon, Hash, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner'; // [cite: uploaded:src/components/common/LoadingSpinner.jsx]

const ChatWindow = ({ selectedChat, onClose }) => {
  const { user: currentUser } = useAuth();
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(selectedChat?.id);
  const [showUserList, setShowUserList] = useState(false); // For mobile/smaller screens

  useEffect(() => {
    // Mark messages as read when a chat is opened or new messages arrive
    if (selectedChat?.id && currentUser?.uid) {
      const unreadCountForCurrentUser = selectedChat.unreadCount?.[currentUser.uid] || 0;
      if (unreadCountForCurrentUser > 0) {
        chatService.markChatAsRead(selectedChat.id);
      }
    }
  }, [selectedChat, messages, currentUser]); // Rerun when messages change too

  const handleSendMessage = async (messageText) => {
    if (!selectedChat?.id) return;
    try {
      await chatService.sendMessage(selectedChat.id, messageText);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally show a toast to the user
    }
  };
  
  let chatDisplayName = "Chat";
  let chatSubtitle = "";
  let AvatarComponent = Hash;
  let avatarBg = 'bg-purple-100';
  let avatarText = 'text-purple-600';


  if (selectedChat) {
    if (selectedChat.type === 'direct' && currentUser) {
        const otherMemberId = selectedChat.members.find(id => id !== currentUser.uid);
        const otherMemberInfo = selectedChat.memberInfo?.[otherMemberId];
        chatDisplayName = otherMemberInfo?.displayName || 'Direct Message';
        // Could add online status here later for subtitle
        chatSubtitle = otherMemberInfo?.email || 'User';
        AvatarComponent = UserIcon;
        avatarBg = 'bg-blue-100';
        avatarText = 'text-blue-600';
    } else { // Group chat
        chatDisplayName = selectedChat.name || 'Group Chat';
        chatSubtitle = `${selectedChat.members?.length || 0} members`;
        AvatarComponent = Hash;
    }
  }


  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a chat from the sidebar to start messaging.</p>
        </div>
      </div>
    );
  }

  if (messagesError) {
    return <div className="p-4 text-red-500">Error loading messages: {messagesError.message}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white flex-1">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center min-w-0">
           <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${avatarBg}`}>
            {selectedChat.type === 'direct' && selectedChat.memberInfo?.[selectedChat.members.find(id => id !== currentUser?.uid)]?.photoURL ? (
                <img src={selectedChat.memberInfo[selectedChat.members.find(id => id !== currentUser?.uid)].photoURL} alt={chatDisplayName} className="w-full h-full rounded-full object-cover" />
            ) : (
                <AvatarComponent className={avatarText} size={18} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{chatDisplayName}</h3>
            <p className="text-xs text-gray-500 truncate">{chatSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedChat.type === 'group' && (
            <button onClick={() => setShowUserList(!showUserList)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg md:hidden" title="View Members">
              <Users size={20} />
            </button>
          )}
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg md:hidden" title="Close Chat">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          {messagesLoading && messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <MessageList messages={messages} currentUser={currentUser} />
          )}
          <MessageInput onSendMessage={handleSendMessage} />
        </div>

        {/* User List Sidebar (for group chats, typically shown on larger screens or toggled on mobile) */}
        {selectedChat.type === 'group' && (
          <div className={`w-64 border-l border-gray-200 flex-shrink-0 ${showUserList ? 'block' : 'hidden'} md:block`}>
            <UserList users={
                selectedChat.members.map(uid => ({
                    id: uid,
                    name: selectedChat.memberInfo?.[uid]?.displayName || 'Unknown User',
                    // Add status and avatar if you implement presence
                    status: 'online', // Placeholder
                    avatar: selectedChat.memberInfo?.[uid]?.photoURL
                }))
            } />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
